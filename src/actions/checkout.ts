"use server";

import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";
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

function fieldValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
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
    email: fieldValue(formData, "email"),
    phone: fieldValue(formData, "phone"),
    website: fieldValue(formData, "website"),
    country: fieldValue(formData, "country") || "UK",
    targetMarket: fieldValue(formData, "targetMarket").slice(0, 500),
    improvements: fieldValue(formData, "improvements").slice(0, 500),
  };

  if (!values.fullName || !values.companyName || !values.email || !values.phone || !values.website) {
    return {
      status: "error",
      message: "Please fill in all required fields before continuing.",
      values,
    };
  }

  const origin = await getSiteOrigin();

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
      metadata: { planId: plan.id, ...values },
    });
    sessionUrl = session.url;
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    redirect("/subscribe/error?reason=stripe_error");
  }

  if (!sessionUrl) {
    redirect("/subscribe/error?reason=stripe_error");
  }

  redirect(sessionUrl);
}
