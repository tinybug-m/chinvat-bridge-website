import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Passwordless auto-login right after a successful Stripe checkout.
 * Verifies the completed checkout session server-side, then generates a Supabase
 * magic link for that email and redirects the customer's browser straight through
 * it — no email round-trip needed for this first login.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/pricing`);
  }

  let email: string | null | undefined;
  let isPaid = false;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    email = session.customer_details?.email ?? session.customer_email;
    isPaid = session.payment_status === "paid";
  } catch (error) {
    console.error("Failed to retrieve checkout session for portal login:", error);
    return NextResponse.redirect(`${origin}/subscribe/error?reason=stripe_error`);
  }

  if (!isPaid || !email) {
    return NextResponse.redirect(`${origin}/subscribe/success?session_id=${sessionId}`);
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data.properties?.hashed_token) {
    console.error("Failed to generate portal login link:", error);
    return NextResponse.redirect(`${origin}/subscribe/success?session_id=${sessionId}`);
  }

  // generateLink() is admin-initiated — no browser ever ran signInWithOtp() to store a
  // PKCE code_verifier for it, so Supabase can only hand back an implicit-flow link
  // (tokens in a URL hash fragment), which a server-side route can't read at all. Verifying
  // the token_hash directly here instead establishes the session server-side and writes
  // the auth cookie via this same response, so no redirect-through-Supabase step is needed.
  const authClient = await createClient();
  const { error: verifyError } = await authClient.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });

  if (verifyError) {
    console.error("Failed to verify portal login token:", verifyError);
    return NextResponse.redirect(`${origin}/subscribe/success?session_id=${sessionId}`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
