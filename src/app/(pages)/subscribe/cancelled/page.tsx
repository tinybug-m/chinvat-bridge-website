import type { Metadata } from "next";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { EmailLink } from "@/components/atoms/EmailLink";
import { CheckoutStepper } from "@/components/molecules/CheckoutStepper";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
import { StatusPage } from "@/components/templates/StatusPage";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false, follow: false },
};

export default function SubscribeCancelledPage() {
  return (
    <CheckoutShell>
      <Container className="pt-8 lg:pt-10">
        <CheckoutStepper currentStep={3} />
      </Container>
      <StatusPage
        bare
        eyebrow="Checkout cancelled"
        title="No charge was made."
        description="You cancelled before completing checkout. If you had trouble or have questions about a plan, reach out and we'll help."
        contactNote={<EmailLink />}
        actions={
          <>
            <ButtonLink href="/pricing" size="lg" arrow="right" className="w-full sm:w-auto">
              View plans
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
