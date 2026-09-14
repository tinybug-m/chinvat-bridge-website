import type { Metadata } from "next";
import { Button } from "@/components/atoms/Button";
import { EmailLink } from "@/components/atoms/EmailLink";
import { StatusPage } from "@/components/templates/StatusPage";
import { getStripeClient } from "@/lib/stripe";
import { getPlanById } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Subscription Confirmed",
  robots: { index: false, follow: false },
};

interface SubscribeSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function getConfirmedEngagement(sessionId: string | undefined) {
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return null;

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const plan = session.metadata?.planId ? getPlanById(session.metadata.planId) : undefined;

    return {
      plan,
      email: session.customer_details?.email ?? session.customer_email ?? undefined,
    };
  } catch {
    return null;
  }
}

export default async function SubscribeSuccessPage({ searchParams }: SubscribeSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  const engagement = await getConfirmedEngagement(sessionId);

  return (
    <StatusPage
      tone="celebratory"
      eyebrow="Subscription Confirmed"
      title="Welcome to Chinvat Bridge."
      description={
        engagement?.plan
          ? `Your ${engagement.plan.name} plan (${engagement.plan.priceLabel}${engagement.plan.billingPeriod}) is now active. We'll be in touch${
              engagement.email ? ` at ${engagement.email}` : ""
            } to begin onboarding.`
          : "Your subscription is active. We'll be in touch at the email you provided during checkout to kick off the work."
      }
      contactNote={
        <>
          Questions in the meantime? <EmailLink />
        </>
      }
      actions={
        <Button href="/" size="md">
          Back to Home
        </Button>
      }
    />
  );
}
