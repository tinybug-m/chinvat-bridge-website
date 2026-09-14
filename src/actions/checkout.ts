"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";
import { getStripePriceId, PRICING_PLANS, type PlanId } from "@/data/pricing";

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

function isPlanId(value: FormDataEntryValue | null): value is PlanId {
  return typeof value === "string" && PRICING_PLANS.some((plan) => plan.id === value);
}

function fieldValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function getSiteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function createCheckoutSession(
  _prevState: CheckoutFormState | null,
  formData: FormData
): Promise<CheckoutFormState | null> {
  const planId = formData.get("planId");

  if (!isPlanId(planId)) {
    redirect("/subscribe/error?reason=invalid_plan");
  }

  const priceId = getStripePriceId(planId);

  if (!priceId) {
    redirect(`/subscribe/error?reason=not_configured&plan=${planId}`);
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
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe/cancelled`,
      customer_email: values.email,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: { planId, ...values },
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
