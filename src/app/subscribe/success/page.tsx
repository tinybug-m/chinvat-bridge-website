import type { Metadata } from "next";
import { Button } from "@/components/atoms/Button";
import { Container } from "@/components/atoms/Container";
import { EmailLink } from "@/components/atoms/EmailLink";
import { CheckoutStepper } from "@/components/molecules/CheckoutStepper";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
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
    const plan = session.metadata?.planId ? await getPlanById(session.metadata.planId) : undefined;

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
    <CheckoutShell>
      <div className="border-b border-stone-border bg-obsidian-950 py-4">
        <Container>
          <CheckoutStepper currentStep={4} />
        </Container>
      </div>
      <StatusPage
        bare
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
          sessionId ? (
            <>
              <Button href={`/auth/checkout-login?session_id=${sessionId}`} icon="arrowForward" size="md">
                Go to Your Client Portal
              </Button>
              <Button href="/" variant="outline" size="md">
                Back to Home
              </Button>
            </>
          ) : (
            <Button href="/" size="md">
              Back to Home
            </Button>
          )
        }
      />
    </CheckoutShell>
  );
}
