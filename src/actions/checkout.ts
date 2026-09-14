"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";
import { getStripePriceId, PRICING_PLANS, type PlanId } from "@/data/pricing";

function isPlanId(value: FormDataEntryValue | null): value is PlanId {
  return typeof value === "string" && PRICING_PLANS.some((plan) => plan.id === value);
}

function requiredField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function optionalField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, 500) : "";
}

async function getSiteOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function createCheckoutSession(formData: FormData): Promise<void> {
  const planId = formData.get("planId");

  if (!isPlanId(planId)) {
    redirect("/subscribe/error?reason=invalid_plan");
  }

  const priceId = getStripePriceId(planId);

  if (!priceId) {
    redirect(`/subscribe/error?reason=not_configured&plan=${planId}`);
  }

  const fullName = requiredField(formData, "fullName");
  const companyName = requiredField(formData, "companyName");
  const email = requiredField(formData, "email");
  const phone = requiredField(formData, "phone");
  const website = requiredField(formData, "website");
  const country = requiredField(formData, "country");

  if (!fullName || !companyName || !email || !phone || !website || !country) {
    redirect(`/subscribe/details?plan=${planId}&error=missing_fields`);
  }

  const targetMarket = optionalField(formData, "targetMarket");
  const improvements = optionalField(formData, "improvements");

  const origin = await getSiteOrigin();
  const stripe = getStripeClient();

  let sessionUrl: string | null;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe/cancelled`,
      customer_email: email,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: {
        planId,
        fullName,
        companyName,
        phone,
        website,
        country,
        targetMarket,
        improvements,
      },
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
