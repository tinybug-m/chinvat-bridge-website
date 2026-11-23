import "server-only";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripeWebhookSecret } from "@/lib/env";
import { handleStripeEvent, isHandledEvent, RetryLaterError, type SyncDeps } from "@/lib/stripe-sync";

/*
 * Stripe webhook. Rules live in src/lib/stripe-sync.ts (state machine, unit-tested); this file
 * verifies the signature, makes delivery idempotent through public.stripe_events, and wires the
 * state machine to Stripe and Supabase (service role: no user session exists here).
 *
 * Answers: 200 handled or already handled; 409 another delivery of the same event is in progress;
 * 500 failed (Stripe retries with backoff). Logs name Stripe object ids and outcomes only.
 */

function syncDeps(): SyncDeps {
  const supabase = createAdminClient();
  const stripe = getStripeClient();
  return {
    now: () => new Date(),
    retrieveSubscription: (id) => stripe.subscriptions.retrieve(id),
    async provisionUser(email, fullName) {
      // generateLink creates the auth user if one doesn't already exist for this email, and is a
      // no-op otherwise: the safest way to get a stable user id here. The link is never sent.
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { data: { full_name: fullName ?? undefined } },
      });
      if (error || !data.user) {
        console.error(`[stripe] account provisioning failed (code=${error?.code ?? "none"})`);
        return null;
      }
      return { id: data.user.id };
    },
    async readCustomer(userId) {
      const { data, error } = await supabase
        .from("customers")
        .select("stripe_subscription_id, status")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw new Error(`customer lookup failed (${error.code})`);
      return data;
    },
    async upsertCustomer(userId, profile, state) {
      const { error } = await supabase.from("customers").upsert(
        {
          id: userId,
          email: profile.email,
          full_name: profile.fullName,
          company_name: profile.companyName,
          phone: profile.phone,
          website: profile.website,
          country: profile.country,
          target_market: profile.targetMarket,
          improvements: profile.improvements,
          plan_id: profile.planId,
          stripe_customer_id: profile.stripeCustomerId,
          stripe_subscription_id: state.subscriptionId,
          status: state.status,
          stripe_subscription_status: state.stripeStatus,
          stripe_current_period_end: state.currentPeriodEnd,
          stripe_cancel_at_period_end: state.cancelAtPeriodEnd,
          stripe_synced_at: state.observedAt,
        },
        { onConflict: "id" }
      );
      if (error) throw new Error(`customer upsert failed (${error.code})`);
    },
    async applyState(state) {
      const { data, error } = await supabase.rpc("apply_stripe_subscription_state", {
        p_subscription_id: state.subscriptionId,
        p_stripe_status: state.stripeStatus,
        p_status: state.status,
        // The SQL argument accepts null (no period end), but generated RPC types cannot mark an
        // argument nullable. Omitting it instead would make PostgREST fail to resolve the function.
        p_current_period_end: (state.currentPeriodEnd ?? null) as string,
        p_cancel_at_period_end: state.cancelAtPeriodEnd,
        p_observed_at: state.observedAt,
      });
      if (error) throw new Error(`subscription state write failed (${error.code})`);
      if (data === "applied" || data === "stale" || data === "terminal" || data === "not_found") return data;
      throw new Error("subscription state write returned an unknown result");
    },
  };
}

export async function POST(request: Request) {
  const webhookSecret = stripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    // Stripe's check also rejects deliveries older than its 5-minute tolerance (replays).
    console.warn(`Stripe webhook rejected: ${error instanceof Error ? error.name : "invalid signature"}`);
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  if (!isHandledEvent(event.type)) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();
  const { data: claim, error: claimError } = await supabase.rpc("begin_stripe_event", {
    p_id: event.id,
    p_type: event.type,
    p_livemode: event.livemode,
    p_created: new Date(event.created * 1000).toISOString(),
  });
  if (claimError) {
    console.error(`[stripe] event store unavailable (event=${event.id}, code=${claimError.code})`);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
  if (claim === "duplicate") {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (claim !== "process") {
    // Another delivery of this event holds the lease; a non-2xx makes Stripe try again later.
    return NextResponse.json({ error: "Event is being processed." }, { status: 409 });
  }

  try {
    const outcome = await handleStripeEvent(event, syncDeps());
    console.log(`[stripe] ${event.type} event=${event.id} outcome=${outcome}`);
    const { error } = await supabase.rpc("finish_stripe_event", { p_id: event.id, p_outcome: outcome });
    if (error) console.error(`[stripe] could not mark event processed (event=${event.id}, code=${error.code})`);
    return NextResponse.json({ received: true });
  } catch (error) {
    const reason = error instanceof RetryLaterError ? "retry_later" : error instanceof Error ? error.message : "error";
    console.error(`[stripe] ${event.type} event=${event.id} failed: ${reason}`);
    await supabase.rpc("fail_stripe_event", { p_id: event.id, p_error: reason });
    // A 500 makes Stripe redeliver later; every step is safe to run again.
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 500 });
  }
}
