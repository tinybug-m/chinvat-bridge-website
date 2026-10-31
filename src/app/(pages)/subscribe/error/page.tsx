import type { Metadata } from "next";
import { ButtonLink } from "@/components/system/Button";
import { EmailLink } from "@/components/atoms/EmailLink";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
import { StatusPage } from "@/components/templates/StatusPage";

export const metadata: Metadata = {
  title: "Checkout Unavailable",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  not_configured:
    "This plan isn’t ready to accept payments yet — it hasn’t been fully set up on our end.",
  invalid_plan: "That plan couldn’t be recognised. Please choose a plan again.",
  stripe_error: "We couldn’t reach our payment provider just now.",
};

const DEFAULT_MESSAGE = "We couldn’t start checkout just now.";

interface SubscribeErrorPageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function SubscribeErrorPage({ searchParams }: SubscribeErrorPageProps) {
  const { reason } = await searchParams;
  const message = (reason && MESSAGES[reason]) || DEFAULT_MESSAGE;

  return (
    <CheckoutShell>
      <StatusPage
        bare
        eyebrow="Checkout unavailable"
        title="Something didn’t go through."
        description={message}
        contactNote={
          <>
            Try again, or contact us directly: <EmailLink />
          </>
        }
        actions={
          <>
            <ButtonLink href="/pricing" size="lg" arrow="right" className="w-full sm:w-auto">
              Back to plans
            </ButtonLink>
            <ButtonLink href="/" variant="secondary" size="lg" className="w-full sm:w-auto">
              Back to home
            </ButtonLink>
          </>
        }
      />
    </CheckoutShell>
  );
}
