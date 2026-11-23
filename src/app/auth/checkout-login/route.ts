import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/site-origin";
import { checkoutBindingCookieName, redeemCheckoutLogin, type RedeemOutcome } from "@/lib/checkout-login";

/**
 * One-time sign-in straight after a successful Stripe checkout (rules: src/lib/checkout-login.ts).
 *
 * POST only, from the success page's own form: a GET (an old link, a mail scanner, a chat link
 * preview) never spends the authorisation and never signs anyone in. The request must come from
 * this site (Origin / Sec-Fetch-Site), carry this browser's checkout binding cookie, and the
 * Stripe session id it names is redeemed at most once. Every answer is a 303 to a fixed path on
 * this site, never to a caller-supplied URL, and nothing here logs the session id or email.
 */

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
};

const DESTINATIONS: Record<RedeemOutcome, string> = {
  signed_in: "/dashboard",
  email_sent: "/login?notice=checkout_email_sent",
  sign_in_required: "/login?notice=checkout_sign_in",
  payment_pending: "/login?notice=checkout_payment_pending",
  unavailable: "/login?notice=checkout_unavailable",
};

function redirectTo(origin: string, path: string) {
  return NextResponse.redirect(new URL(path, origin), { status: 303, headers: NO_STORE_HEADERS });
}

async function isSameOriginPost(request: Request, siteOrigin: string): Promise<boolean> {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(siteOrigin).origin;
}

export async function GET() {
  // Never sign in on GET. Old "Go to your client portal" links land on a normal sign-in page.
  return redirectTo(await getSiteOrigin(), DESTINATIONS.sign_in_required);
}

export async function POST(request: Request) {
  const siteOrigin = await getSiteOrigin();
  if (!(await isSameOriginPost(request, siteOrigin))) {
    return new NextResponse("Forbidden", { status: 403, headers: NO_STORE_HEADERS });
  }

  let sessionId: FormDataEntryValue | null = null;
  try {
    sessionId = (await request.formData()).get("session_id");
  } catch {
    return redirectTo(siteOrigin, DESTINATIONS.sign_in_required);
  }

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  const cookieName = checkoutBindingCookieName(secure);
  const bindingToken = cookieStore.get(cookieName)?.value ?? null;

  const outcome = await redeemCheckoutLogin(
    {
      nowSeconds: () => Math.floor(Date.now() / 1000),
      retrieveSession: (id) => getStripeClient().checkout.sessions.retrieve(id),
      async claimRedemption(sessionHash) {
        const { error } = await createAdminClient().from("checkout_login_redemptions").insert({ session_hash: sessionHash });
        if (!error) return true;
        if (error.code === "23505") return false; // unique violation: already redeemed
        throw new Error(`checkout redemption store failed (${error.code ?? "unknown"})`);
      },
      async isAdminUser(userId) {
        const { data, error } = await createAdminClient().from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
        if (error) throw new Error("admin lookup failed");
        return data !== null;
      },
      async provisionLoginLink(email) {
        const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "magiclink", email });
        if (error || !data.user || !data.properties?.hashed_token) return null;
        return { user: data.user, hashedToken: data.properties.hashed_token };
      },
      async existingSubscriptionId(userId) {
        const { data, error } = await createAdminClient()
          .from("customers")
          .select("stripe_subscription_id")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw new Error("customer lookup failed");
        return data ? data.stripe_subscription_id : undefined;
      },
      async establishSession(hashedToken) {
        const supabase = await createClient();
        // Replace whatever session this browser had, so it cannot end up mixed with another account.
        await supabase.auth.signOut({ scope: "local" });
        const { error } = await supabase.auth.verifyOtp({ token_hash: hashedToken, type: "magiclink" });
        return !error;
      },
      async sendEmailLink(email) {
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${siteOrigin}/auth/callback?next=/dashboard` },
        });
        return !error;
      },
    },
    { sessionId, bindingToken }
  );

  if (outcome === "signed_in" || outcome === "email_sent") {
    // Spent: the binding has done its job in this browser.
    cookieStore.delete({ name: cookieName, path: "/", secure });
  }
  if (outcome !== "signed_in") {
    console.warn(`[checkout-login] outcome=${outcome}`);
  }
  return redirectTo(siteOrigin, DESTINATIONS[outcome]);
}
