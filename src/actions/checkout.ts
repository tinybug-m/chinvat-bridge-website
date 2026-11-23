"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";
import { CHECKOUT_LOGIN_TTL_SECONDS, checkoutBindingCookieName, newBindingToken, sha256Hex } from "@/lib/checkout-login";
import { getSiteOrigin } from "@/lib/site-origin";
import { getPlanById } from "@/data/pricing";

export interface CheckoutFormValues {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  targetMarket: string;
  improvements: string;
}

export interface CheckoutFormState {
  status: "error";
  message: string;
  values: CheckoutFormValues;
}

/** Stripe rejects metadata values over 500 characters; these also bound what the portal stores. */
function fieldValue(formData: FormData, name: string, max = 200): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function createCheckoutSession(
  _prevState: CheckoutFormState | null,
  formData: FormData
): Promise<CheckoutFormState | null> {
  const planIdValue = formData.get("planId");

  if (typeof planIdValue !== "string") {
    redirect("/subscribe/error?reason=invalid_plan");
  }

  const plan = await getPlanById(planIdValue);

  if (!plan) {
    redirect("/subscribe/error?reason=invalid_plan");
  }

  if (!plan.stripePriceId) {
    redirect(`/subscribe/error?reason=not_configured&plan=${plan.id}`);
  }

  const values: CheckoutFormValues = {
    fullName: fieldValue(formData, "fullName"),
    companyName: fieldValue(formData, "companyName"),
    email: fieldValue(formData, "email", 254),
    phone: fieldValue(formData, "phone", 40),
    website: fieldValue(formData, "website", 300),
    country: fieldValue(formData, "country") || "UK",
    targetMarket: fieldValue(formData, "targetMarket", 500),
    improvements: fieldValue(formData, "improvements", 500),
  };

  if (!values.fullName || !values.companyName || !values.email || !values.phone || !values.website) {
    return {
      status: "error",
      message: "Please fill in all required fields before continuing.",
      values,
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return { status: "error", message: "Please enter a valid email address.", values };
  }

  const origin = await getSiteOrigin();
  // Binds the post-checkout sign-in to this browser (src/lib/checkout-login.ts): the token stays
  // in an HttpOnly cookie, and only its hash goes to Stripe.
  const bindingToken = newBindingToken();

  let sessionUrl: string | null;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe/cancelled`,
      customer_email: values.email,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: { planId: plan.id, ...values, bindingHash: sha256Hex(bindingToken) },
      // Marks the subscription as this site's, so the webhook knows to wait for its checkout event
      // (src/lib/stripe-sync.ts). Plan id only: no personal data on the subscription.
      subscription_data: { metadata: { planId: plan.id } },
    });
    sessionUrl = session.url;
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String((error as { code?: unknown }).code) : "unknown";
    console.error(`Stripe checkout session creation failed (code=${code})`);
    redirect("/subscribe/error?reason=stripe_error");
  }

  if (!sessionUrl) {
    redirect("/subscribe/error?reason=stripe_error");
  }

  const secure = process.env.NODE_ENV === "production";
  (await cookies()).set(checkoutBindingCookieName(secure), bindingToken, {
    httpOnly: true,
    secure,
    sameSite: "lax", // sent on the top-level return from Stripe, never on cross-site POSTs
    path: "/",
    maxAge: CHECKOUT_LOGIN_TTL_SECONDS,
  });

  redirect(sessionUrl);
}
