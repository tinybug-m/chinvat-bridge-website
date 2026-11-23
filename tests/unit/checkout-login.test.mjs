// Post-checkout sign-in security rules (src/lib/checkout-login.ts). Runs with Node's type
// stripping: `pnpm test:unit`. The route handler wires these same functions to Stripe/Supabase.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CHECKOUT_LOGIN_TTL_SECONDS,
  checkCheckoutSession,
  mayAutoLogin,
  newBindingToken,
  redeemCheckoutLogin,
  sha256Hex,
} from "../../src/lib/checkout-login.ts";

const NOW = 1_800_000_000;
const SESSION_ID = "cs_test_a1B2c3D4e5F6g7H8i9J0";

function session(overrides = {}, token = "browser-token") {
  return {
    id: SESSION_ID,
    created: NOW - 120,
    mode: "subscription",
    status: "complete",
    payment_status: "paid",
    customer_email: "New.Client@Example.com",
    customer_details: { email: "New.Client@Example.com" },
    subscription: "sub_123",
    metadata: { planId: "growth", bindingHash: sha256Hex(token) },
    ...overrides,
  };
}

/** Fake deps with a redemption store that behaves like a unique index (async, interleavable). */
function deps(overrides = {}) {
  const redeemed = new Set();
  const calls = { established: 0, emailed: 0, provisioned: 0 };
  const d = {
    calls,
    nowSeconds: () => NOW,
    retrieveSession: async () => session(),
    async claimRedemption(hash) {
      await new Promise((r) => setImmediate(r)); // let concurrent callers interleave
      if (redeemed.has(hash)) return false;
      redeemed.add(hash);
      return true;
    },
    isAdminEmail: (email) => email === "owner@example.com",
    isAdminUser: async (userId) => userId === "admin-user",
    async provisionLoginLink() {
      calls.provisioned++;
      return { user: { id: "user-1", created_at: new Date((NOW - 30) * 1000).toISOString(), last_sign_in_at: null }, hashedToken: "h" };
    },
    existingSubscriptionId: async () => undefined,
    async establishSession() {
      calls.established++;
      return true;
    },
    async sendEmailLink() {
      calls.emailed++;
      return true;
    },
    ...overrides,
  };
  return d;
}

const input = { sessionId: SESSION_ID, bindingToken: "browser-token" };

test("the browser that started a fresh, paid checkout is signed in once", async () => {
  const d = deps();
  assert.equal(await redeemCheckoutLogin(d, input), "signed_in");
  assert.equal(d.calls.established, 1);
});

test("replay: a second redemption of the same session is refused", async () => {
  const d = deps();
  assert.equal(await redeemCheckoutLogin(d, input), "signed_in");
  assert.equal(await redeemCheckoutLogin(d, input), "sign_in_required");
  assert.equal(d.calls.established, 1);
});

test("concurrent redemptions: exactly one succeeds", async () => {
  const d = deps();
  const results = await Promise.all(Array.from({ length: 20 }, () => redeemCheckoutLogin(d, input)));
  assert.equal(results.filter((r) => r === "signed_in").length, 1);
  assert.equal(results.filter((r) => r === "sign_in_required").length, 19);
  assert.equal(d.calls.established, 1);
});

test("expiry is measured from Stripe's session creation time", () => {
  const fresh = checkCheckoutSession(session({ created: NOW - CHECKOUT_LOGIN_TTL_SECONDS }), "browser-token", NOW);
  assert.equal(fresh.ok, true);
  const stale = checkCheckoutSession(session({ created: NOW - CHECKOUT_LOGIN_TTL_SECONDS - 1 }), "browser-token", NOW);
  assert.deepEqual(stale, { ok: false, reason: "expired" });
  const future = checkCheckoutSession(session({ created: NOW + 3600 }), "browser-token", NOW);
  assert.deepEqual(future, { ok: false, reason: "expired" });
});

test("an expired session is refused without spending or signing in", async () => {
  const d = deps({ retrieveSession: async () => session({ created: NOW - CHECKOUT_LOGIN_TTL_SECONDS - 60 }) });
  assert.equal(await redeemCheckoutLogin(d, input), "sign_in_required");
  assert.equal(d.calls.established + d.calls.emailed + d.calls.provisioned, 0);
});

test("browser binding: someone holding only the URL (no or wrong cookie) is refused", async () => {
  const d = deps();
  assert.equal(await redeemCheckoutLogin(d, { sessionId: SESSION_ID, bindingToken: null }), "sign_in_required");
  assert.equal(await redeemCheckoutLogin(d, { sessionId: SESSION_ID, bindingToken: "attacker-token" }), "sign_in_required");
  assert.equal(await redeemCheckoutLogin(d, input), "signed_in", "the real browser can still redeem afterwards");
});

test("a session without a binding hash (created before this change) never signs in", () => {
  const legacy = session({ metadata: { planId: "growth" } });
  assert.deepEqual(checkCheckoutSession(legacy, "browser-token", NOW), { ok: false, reason: "binding_mismatch" });
});

test("payment states: paid and no_payment_required sign in; unpaid is pending; open/expired sessions refused", async () => {
  assert.equal(checkCheckoutSession(session({ payment_status: "paid" }), "browser-token", NOW).ok, true);
  assert.equal(checkCheckoutSession(session({ payment_status: "no_payment_required" }), "browser-token", NOW).ok, true);
  assert.deepEqual(checkCheckoutSession(session({ payment_status: "unpaid" }), "browser-token", NOW), { ok: false, reason: "unpaid" });
  assert.deepEqual(checkCheckoutSession(session({ status: "open" }), "browser-token", NOW), { ok: false, reason: "not_complete" });
  assert.deepEqual(checkCheckoutSession(session({ status: "expired" }), "browser-token", NOW), { ok: false, reason: "not_complete" });
  assert.deepEqual(checkCheckoutSession(session({ mode: "payment" }), "browser-token", NOW), { ok: false, reason: "wrong_mode" });
  const d = deps({ retrieveSession: async () => session({ payment_status: "unpaid" }) });
  assert.equal(await redeemCheckoutLogin(d, input), "payment_pending");
  assert.equal(d.calls.established, 0);
});

test("invalid sessions: malformed ids, Stripe errors, mismatched ids and missing metadata", async () => {
  for (const bad of ["", "pi_123", "cs_test_short", "cs_live_../../etc", 42, null]) {
    assert.equal(await redeemCheckoutLogin(deps(), { sessionId: bad, bindingToken: "browser-token" }), "sign_in_required");
  }
  const stripeDown = deps({ retrieveSession: async () => Promise.reject(new Error("No such checkout.session")) });
  assert.equal(await redeemCheckoutLogin(stripeDown, input), "sign_in_required");
  const swapped = deps({ retrieveSession: async () => session({ id: "cs_test_someoneElseEntirely1" }) });
  assert.equal(await redeemCheckoutLogin(swapped, input), "sign_in_required");
  const noPlan = deps({ retrieveSession: async () => session({ metadata: { bindingHash: sha256Hex("browser-token") } }) });
  assert.equal(await redeemCheckoutLogin(noPlan, input), "sign_in_required");
});

test("account takeover: an existing account for the checkout email gets an emailed link, not a session", async () => {
  const preExisting = deps({
    async provisionLoginLink() {
      return { user: { id: "victim", created_at: new Date((NOW - 86400) * 1000).toISOString(), last_sign_in_at: null }, hashedToken: "h" };
    },
  });
  assert.equal(await redeemCheckoutLogin(preExisting, input), "email_sent");
  assert.equal(preExisting.calls.established, 0);

  const hasSignedIn = deps({
    async provisionLoginLink() {
      return { user: { id: "u", created_at: new Date((NOW - 10) * 1000).toISOString(), last_sign_in_at: new Date().toISOString() }, hashedToken: "h" };
    },
  });
  assert.equal(await redeemCheckoutLogin(hasSignedIn, input), "email_sent");
  assert.equal(hasSignedIn.calls.established, 0);
});

test("admin emails are never signed in from a checkout", async () => {
  const d = deps({ retrieveSession: async () => session({ customer_details: { email: "OWNER@example.com" } }) });
  assert.equal(await redeemCheckoutLogin(d, input), "email_sent");
  assert.equal(d.calls.established, 0);
  assert.equal(d.calls.provisioned, 0);
});

test("database admins are never signed in from a checkout, whatever their email", async () => {
  const d = deps({
    async provisionLoginLink() {
      d.calls.provisioned++;
      return { user: { id: "admin-user", created_at: new Date((NOW - 30) * 1000).toISOString(), last_sign_in_at: null }, hashedToken: "h" };
    },
  });
  assert.equal(await redeemCheckoutLogin(d, input), "email_sent");
  assert.equal(d.calls.established, 0);
});

test("admin lookup failure fails closed to an emailed link", async () => {
  const d = deps({ isAdminUser: async () => Promise.reject(new Error("db down")) });
  assert.equal(await redeemCheckoutLogin(d, input), "email_sent");
  assert.equal(d.calls.established, 0);
});

test("without an email deny-list the database check alone decides", async () => {
  const d = deps({ isAdminEmail: undefined });
  assert.equal(await redeemCheckoutLogin(d, input), "signed_in");
});

test("customer mismatch: an account linked to a different subscription is not signed in", async () => {
  const other = deps({ existingSubscriptionId: async () => "sub_OTHER" });
  assert.equal(await redeemCheckoutLogin(other, input), "email_sent");
  assert.equal(other.calls.established, 0);
  const same = deps({ existingSubscriptionId: async () => "sub_123" });
  assert.equal(await redeemCheckoutLogin(same, input), "signed_in");
  const base = { user: { id: "u", created_at: new Date(NOW * 1000).toISOString() }, sessionCreated: NOW - 5, isAdminEmail: false, sessionSubscriptionId: "sub_1" };
  assert.equal(mayAutoLogin({ ...base, existingSubscriptionId: null }), true);
  assert.equal(mayAutoLogin({ ...base, existingSubscriptionId: undefined }), true);
});

test("storage failure fails closed and does not sign in", async () => {
  const d = deps({ claimRedemption: async () => Promise.reject(new Error("db down")) });
  assert.equal(await redeemCheckoutLogin(d, input), "unavailable");
  assert.equal(d.calls.established, 0);
});

test("binding tokens are random 256-bit values and only their hash is shared", () => {
  const a = newBindingToken();
  const b = newBindingToken();
  assert.notEqual(a, b);
  assert.ok(Buffer.from(a, "base64url").length === 32);
  assert.match(sha256Hex(a), /^[0-9a-f]{64}$/);
});
