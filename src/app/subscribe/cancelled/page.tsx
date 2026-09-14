import type { Metadata } from "next";
import { Button } from "@/components/atoms/Button";
import { EmailLink } from "@/components/atoms/EmailLink";
import { StatusPage } from "@/components/templates/StatusPage";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false, follow: false },
};

export default function SubscribeCancelledPage() {
  return (
    <StatusPage
      eyebrow="Checkout Cancelled"
      title="No charge was made."
      description="You cancelled before completing checkout. If you had trouble or have questions about a plan, reach out and we'll help."
      contactNote={<EmailLink />}
      actions={
        <>
          <Button href="/pricing" size="md">
            View Plans
          </Button>
          <Button href="/" variant="outline" size="md">
            Back to Home
          </Button>
        </>
      }
    />
  );
}
