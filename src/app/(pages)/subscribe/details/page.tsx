import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
import { Container } from "@/components/system/Container";
import { CheckoutStepper } from "@/components/molecules/CheckoutStepper";
import { DetailsForm } from "@/components/organisms/checkout/DetailsForm";
import { PlanSummary } from "@/components/organisms/checkout/PlanSummary";
import { getPlanById } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Business Details",
  robots: { index: false, follow: false },
};

interface SubscribeDetailsPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function SubscribeDetailsPage({ searchParams }: SubscribeDetailsPageProps) {
  const { plan: planIdParam } = await searchParams;
  const plan = planIdParam ? await getPlanById(planIdParam) : undefined;

  if (!plan) {
    redirect("/pricing");
  }

  return (
    <CheckoutShell>
      <Container className="pt-8 lg:pt-10">
        <CheckoutStepper currentStep={2} />
      </Container>
      <Container className="grid grid-cols-1 items-start gap-y-14 pt-12 pb-section lg:grid-cols-12 lg:gap-x-6 lg:pt-20">
        <div className="lg:col-span-7">
          <DetailsForm planId={plan.id} />
        </div>
        <div className="lg:sticky lg:top-8 lg:col-span-4 lg:col-start-9">
          <PlanSummary plan={plan} />
        </div>
      </Container>
    </CheckoutShell>
  );
}
