import type { Metadata } from "next";
import { Button } from "@/components/atoms/Button";
import { EmailLink } from "@/components/atoms/EmailLink";
import { StatusPage } from "@/components/templates/StatusPage";

export const metadata: Metadata = {
  title: "Checkout Unavailable",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  not_configured:
    "This plan isn't ready to accept payments yet — it hasn't been fully set up on our end.",
  invalid_plan: "That plan couldn't be recognized. Please choose a plan again.",
  stripe_error: "We couldn't reach our payment provider just now.",
};

const DEFAULT_MESSAGE = "We couldn't start checkout just now.";

interface SubscribeErrorPageProps {
  searchParams: Promise<{ reason?: string }>;
}

export default async function SubscribeErrorPage({ searchParams }: SubscribeErrorPageProps) {
  const { reason } = await searchParams;
  const message = (reason && MESSAGES[reason]) || DEFAULT_MESSAGE;

  return (
    <StatusPage
      eyebrow="Checkout Unavailable"
      title="Something Didn't Go Through."
      description={message}
      contactNote={
        <>
          Try again, or contact us directly: <EmailLink />
        </>
      }
      actions={
        <>
          <Button href="/pricing" size="md">
            Back to Plans
          </Button>
          <Button href="/" variant="outline" size="md">
            Back to Home
          </Button>
        </>
      }
    />
  );
}
