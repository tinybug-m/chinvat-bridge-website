import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function provisionCustomerAccount(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email ?? session.customer_email;
  const metadata = session.metadata ?? {};

  if (!email || !metadata.planId) {
    console.error("checkout.session.completed missing email or planId metadata", session.id);
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
    console.error("Failed to provision Supabase account for", email, linkError);
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
      stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
      status: "active",
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    console.error("Failed to upsert customer record for", email, upsertError);
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
    console.error(`Failed to mark subscription ${subscriptionId} as ${status}:`, error);
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
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`New subscription started: plan=${session.metadata?.planId} customer=${session.customer}`);
      await provisionCustomerAccount(session);
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

  return NextResponse.json({ received: true });
}
