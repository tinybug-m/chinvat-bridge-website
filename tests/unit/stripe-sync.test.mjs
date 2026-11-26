// Stripe webhook state machine (src/lib/stripe-sync.ts) against fixture events. No Stripe or
// Supabase calls: a fake Stripe holds the "current" subscription, and a fake store applies the same
// monotonic guard the database function public.apply_stripe_subscription_state applies.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  customerStatusFor,
  guardSubscriptionWrite,
  handleStripeEvent,
  invoiceSubscriptionId,
  isHandledEvent,
  RetryLaterError,
} from "../../src/lib/stripe-sync.ts";

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/stripe/${name}.json`, import.meta.url), "utf8"));
const NOW_S = 1_800_000_600;

function world({ stripeStatus = "active", planId = "growth" } = {}) {
  let clock = NOW_S * 1000;
  const users = new Map(); // email -> id
  const customers = new Map(); // id -> row
  const subscriptions = new Map([
    ["sub_test_1", { id: "sub_test_1", status: stripeStatus, cancel_at_period_end: false, metadata: planId ? { planId } : {}, items: { data: [{ current_period_end: NOW_S + 86400 }] } }],
  ]);
  const calls = { retrieved: 0, upserts: 0, applied: 0 };
  const deps = {
    now: () => new Date((clock += 1000)),
    async retrieveSubscription(id) {
      calls.retrieved++;
      const sub = subscriptions.get(id);
      if (!sub) throw new Error("no such subscription");
      return structuredClone(sub);
    },
    async provisionUser(email) {
      if (!users.has(email)) users.set(email, `user-${users.size + 1}`);
      return { id: users.get(email) };
    },
    async readCustomer(id) {
      const row = customers.get(id);
      return row ? { stripe_subscription_id: row.stripe_subscription_id, status: row.status } : null;
    },
    async upsertCustomer(id, profile, state) {
      calls.upserts++;
      customers.set(id, {
        id,
        email: profile.email,
        plan_id: profile.planId,
        full_name: profile.fullName,
        stripe_subscription_id: state.subscriptionId,
        status: state.status,
        stripe_subscription_status: state.stripeStatus,
        stripe_synced_at: state.observedAt,
      });
    },
    async applyState(state) {
      const row = [...customers.values()].find((r) => r.stripe_subscription_id === state.subscriptionId);
      if (!row) return "not_found";
      const verdict = guardSubscriptionWrite({ stripeStatus: row.stripe_subscription_status, syncedAt: row.stripe_synced_at }, state);
      if (verdict !== "applied") return verdict;
      calls.applied++;
      Object.assign(row, { status: state.status, stripe_subscription_status: state.stripeStatus, stripe_synced_at: state.observedAt });
      return "applied";
    },
  };
  return { deps, users, customers, subscriptions, calls, setClock: (ms) => (clock = ms) };
}

const onlyCustomer = (w) => [...w.customers.values()][0];

test("checkout.session.completed provisions an account with the state read from Stripe", async () => {
  const w = world();
  assert.equal(await handleStripeEvent(fixture("checkout.session.completed"), w.deps), "provisioned");
  const row = onlyCustomer(w);
  assert.equal(row.email, "new.client@example.test");
  assert.equal(row.plan_id, "growth");
  assert.equal(row.status, "active");
  assert.equal(w.calls.retrieved, 1);
});

test("redelivered checkout does not rewrite the profile", async () => {
  const w = world();
  await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
  onlyCustomer(w).full_name = "Edited by admin";
  assert.equal(await handleStripeEvent(fixture("checkout.session.completed"), w.deps), "applied");
  assert.equal(w.calls.upserts, 1);
  assert.equal(onlyCustomer(w).full_name, "Edited by admin");
});

test("an old checkout event cannot reactivate a cancelled subscription", async () => {
  const w = world();
  await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
  w.subscriptions.get("sub_test_1").status = "canceled";
  assert.equal(await handleStripeEvent(fixture("customer.subscription.deleted"), w.deps), "applied");
  assert.equal(onlyCustomer(w).status, "cancelled");
  // The checkout event is redelivered late: Stripe says canceled, so it stays cancelled.
  await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
  assert.equal(onlyCustomer(w).status, "cancelled");
});

test("ended subscriptions never move back to live, even from a newer stale reading", async () => {
  assert.equal(guardSubscriptionWrite({ stripeStatus: "canceled", syncedAt: "2027-01-01T00:00:00Z" }, { stripeStatus: "active", observedAt: "2027-01-02T00:00:00Z" }), "terminal");
  assert.equal(guardSubscriptionWrite({ stripeStatus: "incomplete_expired", syncedAt: null }, { stripeStatus: "incomplete", observedAt: "2027-01-02T00:00:00Z" }), "terminal");
  assert.equal(guardSubscriptionWrite({ stripeStatus: "canceled", syncedAt: null }, { stripeStatus: "canceled", observedAt: "2027-01-02T00:00:00Z" }), "applied");
});

test("an older reading never overwrites a newer one (out-of-order handlers)", () => {
  const stored = { stripeStatus: "past_due", syncedAt: "2027-01-02T00:00:00Z" };
  assert.equal(guardSubscriptionWrite(stored, { stripeStatus: "active", observedAt: "2027-01-01T00:00:00Z" }), "stale");
  assert.equal(guardSubscriptionWrite(stored, { stripeStatus: "active", observedAt: "2027-01-03T00:00:00Z" }), "applied");
});

test("event order is not trusted: the subscription is read from Stripe for every event", async () => {
  const w = world();
  await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
  // The 'updated' fixture says past_due, but Stripe now says active again: active wins.
  assert.equal(await handleStripeEvent(fixture("customer.subscription.updated"), w.deps), "applied");
  assert.equal(onlyCustomer(w).status, "active");
  w.subscriptions.get("sub_test_1").status = "past_due";
  await handleStripeEvent(fixture("invoice.payment_failed"), w.deps);
  assert.equal(onlyCustomer(w).status, "past_due");
  w.subscriptions.get("sub_test_1").status = "active";
  await handleStripeEvent(fixture("invoice.paid.legacy"), w.deps);
  assert.equal(onlyCustomer(w).status, "active");
});

test("a subscription event before its checkout asks Stripe to retry; later it applies", async () => {
  const w = world();
  await assert.rejects(handleStripeEvent(fixture("customer.subscription.updated"), w.deps), RetryLaterError);
  await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
  assert.equal(await handleStripeEvent(fixture("customer.subscription.updated"), w.deps), "applied");
});

test("subscriptions not from this site's checkout are acknowledged, not retried", async () => {
  const w = world({ planId: null });
  assert.equal(await handleStripeEvent(fixture("customer.subscription.updated"), w.deps), "not_found");
});

test("a site subscription that never gets provisioned stops retrying after a day", async () => {
  const w = world();
  w.setClock((fixture("customer.subscription.updated").created + 2 * 86400) * 1000);
  assert.equal(await handleStripeEvent(fixture("customer.subscription.updated"), w.deps), "not_found");
});

test("checkout for an email that already holds a different active subscription is left unchanged", async () => {
  const w = world();
  await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
  w.subscriptions.set("sub_test_2", { id: "sub_test_2", status: "active", cancel_at_period_end: false, metadata: { planId: "scale" } });
  const other = fixture("checkout.session.completed");
  other.id = "evt_test_checkout_2";
  other.data.object.subscription = "sub_test_2";
  other.data.object.metadata.planId = "scale";
  assert.equal(await handleStripeEvent(other, w.deps), "conflict_left_unchanged");
  assert.equal(onlyCustomer(w).stripe_subscription_id, "sub_test_1");
  assert.equal(onlyCustomer(w).plan_id, "growth");
});

for (const stripeStatus of ["past_due", "paused"]) {
  test(`checkout for an email whose subscription is ${stripeStatus} is left unchanged`, async () => {
    const w = world();
    await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
    w.subscriptions.get("sub_test_1").status = stripeStatus;
    const updated = fixture("customer.subscription.updated");
    updated.data.object.status = stripeStatus;
    await handleStripeEvent(updated, w.deps);
    assert.notEqual(onlyCustomer(w).status, "active");
    w.subscriptions.set("sub_test_2", { id: "sub_test_2", status: "active", cancel_at_period_end: false, metadata: { planId: "scale" } });
    const other = fixture("checkout.session.completed");
    other.id = "evt_test_checkout_3";
    other.data.object.subscription = "sub_test_2";
    other.data.object.metadata.planId = "scale";
    assert.equal(await handleStripeEvent(other, w.deps), "conflict_left_unchanged");
    assert.equal(onlyCustomer(w).stripe_subscription_id, "sub_test_1");
    assert.equal(onlyCustomer(w).plan_id, "growth");
  });
}

test("a cancelled customer may start a new subscription", async () => {
  const w = world();
  await handleStripeEvent(fixture("checkout.session.completed"), w.deps);
  w.subscriptions.get("sub_test_1").status = "canceled";
  await handleStripeEvent(fixture("customer.subscription.deleted"), w.deps);
  w.subscriptions.set("sub_test_2", { id: "sub_test_2", status: "active", cancel_at_period_end: false, metadata: { planId: "scale" } });
  const again = fixture("checkout.session.completed");
  again.data.object.subscription = "sub_test_2";
  again.data.object.metadata.planId = "scale";
  assert.equal(await handleStripeEvent(again, w.deps), "provisioned");
  assert.equal(onlyCustomer(w).status, "active");
  assert.equal(onlyCustomer(w).plan_id, "scale");
});

test("non-site checkouts and unhandled events are ignored without writes", async () => {
  const w = world();
  const payment = fixture("checkout.session.completed");
  payment.data.object.mode = "payment";
  assert.equal(await handleStripeEvent(payment, w.deps), "provision_skipped");
  assert.equal(await handleStripeEvent({ id: "evt_x", type: "charge.refunded", created: NOW_S, data: { object: {} } }, w.deps), "ignored");
  assert.equal(w.customers.size, 0);
  assert.equal(isHandledEvent("charge.refunded"), false);
  assert.equal(isHandledEvent("invoice.payment_succeeded"), true);
});

test("status mapping and invoice subscription lookup", () => {
  assert.deepEqual(
    ["active", "trialing", "past_due", "unpaid", "canceled", "incomplete_expired", "incomplete", "paused", "something_new"].map(customerStatusFor),
    ["active", "active", "past_due", "past_due", "cancelled", "cancelled", "pending", "paused", "past_due"]
  );
  assert.equal(invoiceSubscriptionId(fixture("invoice.payment_failed").data.object), "sub_test_1");
  assert.equal(invoiceSubscriptionId(fixture("invoice.paid.legacy").data.object), "sub_test_1");
  assert.equal(invoiceSubscriptionId({ id: "in_x", parent: null }), null);
});
