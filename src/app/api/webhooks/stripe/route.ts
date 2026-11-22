import "server-only";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * Logs name Stripe object ids only (event, customer, subscription), never an email, a name or a
 * Checkout Session id (that id appears in the customer's success URL).
 */
async function provisionCustomerAccount(session: Stripe.Checkout.Session, eventId: string) {
  const email = (session.customer_details?.email ?? session.customer_email)?.trim().toLowerCase();
  const metadata = session.metadata ?? {};

  if (session.mode !== "subscription" || !email || !metadata.planId) {
    console.error(`checkout.session.completed is not a site subscription checkout; skipped (event=${eventId})`);
    return;
  }

  const supabase = createAdminClient();

  // generateLink creates the auth user if one doesn't already exist for this email,
  // and is a no-op otherwise — the safest way to get a stable user id here.
  const { data, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: { full_name: metadata.fullName } },
  });

  if (linkError || !data.user) {
    console.error(`Failed to provision Supabase account (event=${eventId}, code=${linkError?.code ?? "none"})`);
    return;
  }

  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

  // The checkout email is unverified: never let one checkout overwrite an account that already
  // holds a different active subscription (someone else typing an existing customer's address).
  const { data: existing, error: existingError } = await supabase
    .from("customers")
    .select("stripe_subscription_id, status")
    .eq("id", data.user.id)
    .maybeSingle();
  if (existingError) {
    console.error(`Failed to read existing customer record (event=${eventId})`);
    throw new Error("customer lookup failed");
  }
  if (existing && existing.status === "active" && existing.stripe_subscription_id && existing.stripe_subscription_id !== subscriptionId) {
    console.error(
      `Checkout for an account that already has a different active subscription; record left unchanged for review (event=${eventId}, subscription=${subscriptionId})`
    );
    return;
  }

  const { error: upsertError } = await supabase.from("customers").upsert(
    {
      id: data.user.id,
      email,
      full_name: metadata.fullName || null,
      company_name: metadata.companyName || null,
      phone: metadata.phone || null,
      website: metadata.website || null,
      country: metadata.country || null,
      target_market: metadata.targetMarket || null,
      improvements: metadata.improvements || null,
      plan_id: metadata.planId,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id: subscriptionId,
      status: "active",
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    console.error(`Failed to upsert customer record (event=${eventId}, code=${upsertError.code})`);
    throw new Error("customer upsert failed");
  }
}

async function markSubscriptionStatus(subscriptionId: string | null, status: "past_due" | "cancelled") {
  if (!subscriptionId) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .update({ status })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error(`Failed to mark subscription ${subscriptionId} as ${status} (code=${error.code})`);
    throw new Error("subscription status update failed");
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    // Stripe's check also rejects deliveries older than its 5-minute tolerance (replays).
    console.warn(`Stripe webhook rejected: ${error instanceof Error ? error.name : "invalid signature"}`);
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch {
    // A 500 makes Stripe retry the delivery later; every handler is safe to run twice.
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`New subscription started: plan=${session.metadata?.planId} customer=${session.customer} (event=${event.id})`);
      await provisionCustomerAccount(session, event.id);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : null;
      console.log(`Payment failed for customer=${invoice.customer}`);
      await markSubscriptionStatus(subscriptionId, "past_due");
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription cancelled: customer=${subscription.customer}`);
      await markSubscriptionStatus(subscription.id, "cancelled");
      break;
    }
    default:
      break;
  }
}
