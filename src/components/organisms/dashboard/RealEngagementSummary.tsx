import { MetricGrid } from "@/components/portal/MetricGrid";
import type { PricingPlan } from "@/data/pricing";

interface RealEngagementSummaryProps {
  companyName: string | null;
  website: string | null;
  planId: string;
  /** Read once by the dashboard page and shared with RealProjectProgress. */
  plan: PricingPlan | undefined;
  status: string;
  nextBillingDate: string | null;
  practiceLead: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  past_due: "Payment issue",
  cancelled: "Cancelled",
  pending: "Awaiting payment",
  paused: "Paused",
};

/** The customer's engagement facts. The dashboard's PageHeader carries the heading. */
export function RealEngagementSummary({
  companyName,
  website,
  planId,
  plan,
  status,
  nextBillingDate,
  practiceLead,
}: RealEngagementSummaryProps) {

  const metrics = [
    { label: "Active service", value: plan ? `SEO ${plan.name} — ${plan.priceLabel}/mo` : planId },
    { label: "Company", value: companyName ?? "—" },
    { label: "Domain", value: website ?? "—" },
    { label: "Status", value: STATUS_LABELS[status] ?? status },
    { label: "Next billing", value: nextBillingDate ?? "—" },
    { label: "Practice lead", value: practiceLead ?? "—" },
  ];

  return (
    <section aria-label="Engagement summary">
      <MetricGrid metrics={metrics} columns={3} />
    </section>
  );
}
