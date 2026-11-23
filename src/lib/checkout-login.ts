/*
 * Post-checkout sign-in: the rules that decide whether a finished Stripe Checkout may sign a
 * browser straight into the client portal. Pure apart from node:crypto, so the security tests
 * (tests/unit/checkout-login.test.mjs) run it directly; the route handler at
 * src/app/auth/checkout-login/route.ts supplies Stripe, Supabase and the cookie.
 *
 * Why it is strict: the email typed at checkout is not proof of owning that inbox. Signing a
 * browser in from it is only safe when all of this holds:
 *  - the browser is the one that started this checkout (a random token in an HttpOnly cookie,
 *    whose SHA-256 is fixed into the Stripe session's metadata when the session is created);
 *  - Stripe says the checkout is a complete subscription and paid (or needs no payment);
 *  - the session is recent (measured from Stripe's own `created` timestamp);
 *  - the authorisation has never been used (one database insert decides, atomically);
 *  - the account was created for this checkout and has never signed in, is not an admin, and is
 *    not already linked to a different subscription. "Admin" is the database's answer
 *    (public.admin_users by user id), not an email list.
 * Anything else falls back to a normal emailed sign-in link, which does prove the inbox.
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** How long after Stripe created the session its one-time sign-in stays usable. */
export const CHECKOUT_LOGIN_TTL_SECONDS = 60 * 60;
/** Clock tolerance for a session `created` in the future (Stripe's clock against ours). */
const CLOCK_SKEW_SECONDS = 5 * 60;
/** Subscription checkouts that are paid now; "unpaid" (e.g. a bank debit still clearing) is not. */
export const LOGIN_PAYMENT_STATUSES: readonly string[] = ["paid", "no_payment_required"];

export function checkoutBindingCookieName(secure: boolean): string {
  // __Host- pins the cookie to this exact host, Secure and Path=/ (browsers enforce it).
  return secure ? "__Host-cb-checkout" : "cb-checkout";
}

export function newBindingToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(value);
}

function sameHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]{64}$/.test(a) || !/^[0-9a-f]{64}$/.test(b)) return false;
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/** True when this browser's binding cookie matches the hash fixed into the Stripe session. */
export function bindingMatches(metadata: Record<string, string> | null | undefined, token: string | null | undefined): boolean {
  const expected = metadata?.bindingHash;
  if (!expected || !token) return false;
  return sameHex(sha256Hex(token), expected);
}

/** The parts of a Stripe Checkout Session this flow reads. */
export interface CheckoutSessionLike {
  id: string;
  created: number;
  mode: string | null;
  status: string | null;
  payment_status: string;
  customer_email: string | null;
  customer_details?: { email?: string | null } | null;
  subscription: string | { id: string } | null;
  metadata: Record<string, string> | null;
}

export type SessionRejection =
  | "wrong_mode"
  | "not_complete"
  | "binding_mismatch"
  | "expired"
  | "unpaid"
  | "missing_metadata"
  | "missing_email";

export type SessionCheck =
  | { ok: true; email: string; subscriptionId: string | null; created: number }
  | { ok: false; reason: SessionRejection };

export function checkCheckoutSession(
  session: CheckoutSessionLike,
  bindingToken: string | null | undefined,
  nowSeconds: number,
  ttlSeconds = CHECKOUT_LOGIN_TTL_SECONDS
): SessionCheck {
  if (session.mode !== "subscription") return { ok: false, reason: "wrong_mode" };
  if (session.status !== "complete") return { ok: false, reason: "not_complete" };
  // Binding first: someone holding only the URL learns nothing about the session's state.
  if (!bindingMatches(session.metadata, bindingToken)) return { ok: false, reason: "binding_mismatch" };
  if (!Number.isFinite(session.created) || nowSeconds - session.created > ttlSeconds || session.created - nowSeconds > CLOCK_SKEW_SECONDS) {
    return { ok: false, reason: "expired" };
  }
  if (!LOGIN_PAYMENT_STATUSES.includes(session.payment_status)) return { ok: false, reason: "unpaid" };
  if (!session.metadata?.planId) return { ok: false, reason: "missing_metadata" };
  const email = (session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase();
  if (!email) return { ok: false, reason: "missing_email" };
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);
  return { ok: true, email, subscriptionId, created: session.created };
}

export interface AuthUserLike {
  id: string;
  created_at: string;
  last_sign_in_at?: string | null;
}

/**
 * Whether the account behind the checkout email may be signed in without an email round-trip.
 * `existingSubscriptionId`: undefined when there is no customer row yet (the webhook may not
 * have arrived), null when the row has no subscription, otherwise the row's subscription id.
 */
export function mayAutoLogin(input: {
  user: AuthUserLike;
  sessionCreated: number;
  isAdminEmail: boolean;
  sessionSubscriptionId: string | null;
  existingSubscriptionId: string | null | undefined;
}): boolean {
  const { user, sessionCreated, isAdminEmail, sessionSubscriptionId, existingSubscriptionId } = input;
  if (isAdminEmail) return false;
  if (user.last_sign_in_at) return false;
  const createdMs = Date.parse(user.created_at);
  if (!Number.isFinite(createdMs) || createdMs < sessionCreated * 1000) return false;
  if (existingSubscriptionId !== undefined && existingSubscriptionId !== null && existingSubscriptionId !== sessionSubscriptionId) {
    return false;
  }
  return true;
}

export interface RedeemDeps {
  retrieveSession(sessionId: string): Promise<CheckoutSessionLike>;
  /** Atomically records the redemption; true only for the first caller for this hash. Throws on storage failure. */
  claimRedemption(sessionHash: string): Promise<boolean>;
  /** Optional extra deny-list by address, checked before any account is touched. */
  isAdminEmail?(email: string): boolean;
  /** Whether this account is an administrator (public.admin_users). Throws on lookup failure. */
  isAdminUser(userId: string): Promise<boolean>;
  /** Finds or creates the auth user for the email and returns a one-time token for it. */
  provisionLoginLink(email: string): Promise<{ user: AuthUserLike; hashedToken: string } | null>;
  existingSubscriptionId(userId: string): Promise<string | null | undefined>;
  /** Verifies the token and writes the session cookies; true on success. */
  establishSession(hashedToken: string): Promise<boolean>;
  /** Emails a normal sign-in link to the address (proves inbox ownership). */
  sendEmailLink(email: string): Promise<boolean>;
  nowSeconds(): number;
}

export type RedeemOutcome = "signed_in" | "email_sent" | "sign_in_required" | "payment_pending" | "unavailable";

export async function redeemCheckoutLogin(
  deps: RedeemDeps,
  input: { sessionId: unknown; bindingToken: string | null | undefined }
): Promise<RedeemOutcome> {
  const { sessionId, bindingToken } = input;
  if (!isCheckoutSessionId(sessionId) || !bindingToken) return "sign_in_required";

  let session: CheckoutSessionLike;
  try {
    session = await deps.retrieveSession(sessionId);
  } catch {
    return "sign_in_required";
  }
  if (session.id !== sessionId) return "sign_in_required";

  const check = checkCheckoutSession(session, bindingToken, deps.nowSeconds());
  if (!check.ok) return check.reason === "unpaid" ? "payment_pending" : "sign_in_required";

  let claimed: boolean;
  try {
    claimed = await deps.claimRedemption(sha256Hex(sessionId));
  } catch {
    return "unavailable";
  }
  if (!claimed) return "sign_in_required";

  // The authorisation is spent from here on: every failure below ends in an emailed link.
  const emailFallback = async (): Promise<RedeemOutcome> => {
    try {
      return (await deps.sendEmailLink(check.email)) ? "email_sent" : "unavailable";
    } catch {
      return "unavailable";
    }
  };

  if (deps.isAdminEmail?.(check.email)) return emailFallback();

  try {
    const link = await deps.provisionLoginLink(check.email);
    if (!link) return emailFallback();
    // Administrators always prove their inbox; a lookup failure throws and ends in an emailed link.
    const isAdminEmail = await deps.isAdminUser(link.user.id);
    if (isAdminEmail) return emailFallback();
    const existingSubscriptionId = await deps.existingSubscriptionId(link.user.id);
    const allowed = mayAutoLogin({
      user: link.user,
      sessionCreated: check.created,
      isAdminEmail,
      sessionSubscriptionId: check.subscriptionId,
      existingSubscriptionId,
    });
    if (!allowed) return emailFallback();
    return (await deps.establishSession(link.hashedToken)) ? "signed_in" : emailFallback();
  } catch {
    return emailFallback();
  }
}
