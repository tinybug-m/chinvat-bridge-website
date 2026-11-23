/*
 * Stripe webhook state machine. Pure (type-only imports), so tests/unit/stripe-sync.test.mjs runs
 * it with fixture events; src/app/api/webhooks/stripe/route.ts supplies Stripe and Supabase.
 *
 * Rules:
 *  - Event order is never trusted. Every handled event names a subscription, and the subscription
 *    is read from Stripe before anything is written; the event body only says which one.
 *  - Stored state is monotonic. Each write carries the time Stripe was read (observedAt). The
 *    database (public.apply_stripe_subscription_state) refuses a reading older than the stored one,
 *    and never moves an ended subscription (canceled / incomplete_expired) back to live, so a late
 *    or replayed checkout event cannot reactivate a cancelled customer.
 *  - Account creation is unchanged: checkout.session.completed creates the auth user (by email) and
 *    the customer row, and never overwrites an account holding a different active subscription.
 *  - Logs name Stripe object ids only, never an email, a name or a Checkout Session id.
 */
import type Stripe from "stripe";

export type CustomerStatus = "active" | "past_due" | "cancelled" | "pending" | "paused";

export const HANDLED_EVENT_TYPES = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
] as const;

export function isHandledEvent(type: string): boolean {
  return (HANDLED_EVENT_TYPES as readonly string[]).includes(type);
}

const ENDED = new Set(["canceled", "incomplete_expired"]);

/** Portal status for a Stripe subscription status. Unknown statuses are treated as a payment issue. */
export function customerStatusFor(stripeStatus: string): CustomerStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "incomplete":
      return "pending";
    case "paused":
      return "paused";
    default:
      return "past_due"; // past_due, unpaid, anything new
  }
}

export interface SubscriptionState {
  subscriptionId: string;
  stripeStatus: string;
  status: CustomerStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** ISO time at which this state was read from Stripe. */
  observedAt: string;
  /** The site's plan id when the subscription came from this site's checkout (subscription metadata). */
  planId: string | null;
}

type SubscriptionLike = Pick<Stripe.Subscription, "id" | "status" | "cancel_at_period_end" | "metadata"> & {
  items?: { data?: Array<{ current_period_end?: number | null }> } | null;
};

export function subscriptionState(subscription: SubscriptionLike, observedAt: Date): SubscriptionState {
  const periodEnds = (subscription.items?.data ?? [])
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const periodEnd = periodEnds.length > 0 ? Math.max(...periodEnds) : null;
  return {
    subscriptionId: subscription.id,
    stripeStatus: subscription.status,
    status: customerStatusFor(subscription.status),
    currentPeriodEnd: periodEnd === null ? null : new Date(periodEnd * 1000).toISOString(),
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    observedAt: observedAt.toISOString(),
    planId: subscription.metadata?.planId || null,
  };
}

/** The same guard the database applies (public.apply_stripe_subscription_state); used by tests' fake store. */
export type ApplyResult = "applied" | "stale" | "terminal" | "not_found";
export function guardSubscriptionWrite(
  stored: { stripeStatus: string | null; syncedAt: string | null },
  incoming: Pick<SubscriptionState, "stripeStatus" | "observedAt">
): Exclude<ApplyResult, "not_found"> {
  if (stored.syncedAt && Date.parse(stored.syncedAt) > Date.parse(incoming.observedAt)) return "stale";
  if (stored.stripeStatus && ENDED.has(stored.stripeStatus) && !ENDED.has(incoming.stripeStatus)) return "terminal";
  return "applied";
}

function idOf(ref: string | { id: string } | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : (ref.id ?? null);
}

/** The subscription an invoice belongs to (2025+ API: invoice.parent; older: invoice.subscription). */
export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const fromParent = idOf(invoice.parent?.subscription_details?.subscription as string | { id: string } | null | undefined);
  if (fromParent) return fromParent;
  return idOf((invoice as unknown as { subscription?: string | { id: string } | null }).subscription);
}

export interface CustomerRow {
  stripe_subscription_id: string | null;
  status: string;
}

export interface CheckoutProfile {
  email: string;
  planId: string;
  fullName: string | null;
  companyName: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  targetMarket: string | null;
  improvements: string | null;
  stripeCustomerId: string | null;
}

export interface SyncDeps {
  retrieveSubscription(id: string): Promise<SubscriptionLike>;
  /** Creates (or finds) the auth user for this email; null when that fails. */
  provisionUser(email: string, fullName: string | null): Promise<{ id: string } | null>;
  readCustomer(userId: string): Promise<CustomerRow | null>;
  /** Writes the profile plus the subscription state (new customer, or a new subscription). */
  upsertCustomer(userId: string, profile: CheckoutProfile, state: SubscriptionState): Promise<void>;
  /** Monotonic state write keyed by subscription id (the database guard decides). */
  applyState(state: SubscriptionState): Promise<ApplyResult>;
  now(): Date;
}

export type SyncOutcome =
  | "ignored"
  | "provisioned"
  | "provision_skipped"
  | "conflict_left_unchanged"
  | "applied"
  | "stale"
  | "terminal"
  | "not_found";

/** Thrown when an event should be retried later (Stripe redelivers on a non-2xx answer). */
export class RetryLaterError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "RetryLaterError";
  }
}

/** How long a sync event for a not-yet-provisioned site subscription keeps asking for a retry. */
export const PROVISION_WAIT_SECONDS = 24 * 60 * 60;

async function readSubscription(deps: SyncDeps, subscriptionId: string): Promise<SubscriptionState> {
  const subscription = await deps.retrieveSubscription(subscriptionId);
  // Taken after the read returns: any later write necessarily carries a later observation.
  return subscriptionState(subscription, deps.now());
}

function text(value: string | undefined, max = 500): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session, deps: SyncDeps): Promise<SyncOutcome> {
  const email = (session.customer_details?.email ?? session.customer_email)?.trim().toLowerCase();
  const metadata = session.metadata ?? {};
  const subscriptionId = idOf(session.subscription as string | { id: string } | null);
  if (session.mode !== "subscription" || !email || !metadata.planId || !subscriptionId) return "provision_skipped";

  const state = await readSubscription(deps, subscriptionId);

  const user = await deps.provisionUser(email, text(metadata.fullName));
  if (!user) throw new Error("account provisioning failed");

  const existing = await deps.readCustomer(user.id);
  if (existing && existing.stripe_subscription_id === subscriptionId) {
    // Already provisioned (a redelivery, or the subscription events got here first): state only,
    // through the monotonic guard. The profile written at first provisioning is left alone.
    return await deps.applyState(state);
  }
  // The checkout email is unverified: never let one checkout overwrite an account that already
  // holds a different active subscription (someone else typing an existing customer's address).
  if (existing && existing.status === "active" && existing.stripe_subscription_id) {
    return "conflict_left_unchanged";
  }

  await deps.upsertCustomer(
    user.id,
    {
      email,
      planId: metadata.planId,
      fullName: text(metadata.fullName),
      companyName: text(metadata.companyName),
      phone: text(metadata.phone),
      website: text(metadata.website),
      country: text(metadata.country),
      targetMarket: text(metadata.targetMarket),
      improvements: text(metadata.improvements),
      stripeCustomerId: idOf(session.customer as string | { id: string } | null),
    },
    state
  );
  return "provisioned";
}

async function onSubscriptionChanged(subscriptionId: string, event: Stripe.Event, deps: SyncDeps): Promise<SyncOutcome> {
  const state = await readSubscription(deps, subscriptionId);
  const result = await deps.applyState(state);
  if (result !== "not_found") return result;

  // No customer row yet. A subscription from this site's checkout (it carries planId) is about to be
  // provisioned by checkout.session.completed; ask Stripe to redeliver so this state is not lost.
  // Anything else (another product, or a day has passed) is acknowledged and ignored.
  const ageSeconds = deps.now().getTime() / 1000 - event.created;
  if (state.planId && ageSeconds < PROVISION_WAIT_SECONDS) {
    throw new RetryLaterError("subscription not provisioned yet");
  }
  return "not_found";
}

/** Handles one verified Stripe event. Throws to make Stripe retry. */
export async function handleStripeEvent(event: Stripe.Event, deps: SyncDeps): Promise<SyncOutcome> {
  switch (event.type) {
    case "checkout.session.completed":
      return onCheckoutCompleted(event.data.object as Stripe.Checkout.Session, deps);
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return onSubscriptionChanged((event.data.object as Stripe.Subscription).id, event, deps);
    case "invoice.paid":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed": {
      const subscriptionId = invoiceSubscriptionId(event.data.object as Stripe.Invoice);
      return subscriptionId ? onSubscriptionChanged(subscriptionId, event, deps) : "ignored";
    }
    default:
      return "ignored";
  }
}
