import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutShell } from "@/components/templates/CheckoutShell";
import { Container } from "@/components/atoms/Container";
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
      <div className="border-b border-stone-border bg-obsidian-950 py-4">
        <Container>
          <CheckoutStepper currentStep={2} />
        </Container>
      </div>
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <DetailsForm planId={plan.id} />
          </div>
          <div className="lg:col-span-4">
            <PlanSummary plan={plan} />
          </div>
        </div>
      </Container>
    </CheckoutShell>
  );
}
