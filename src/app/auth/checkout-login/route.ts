import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
  });

  if (error || !data.properties?.action_link) {
    console.error("Failed to generate portal login link:", error);
    return NextResponse.redirect(`${origin}/subscribe/success?session_id=${sessionId}`);
  }

  return NextResponse.redirect(data.properties.action_link);
}
