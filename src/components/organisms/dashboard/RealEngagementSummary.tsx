import { CornerFrame } from "@/components/atoms/CornerFrame";
import { getPlanById } from "@/data/pricing";

interface RealEngagementSummaryProps {
  companyName: string | null;
  website: string | null;
  planId: string;
  status: string;
  nextBillingDate: string | null;
  practiceLead: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  past_due: "Payment Issue",
  cancelled: "Cancelled",
};

export async function RealEngagementSummary({
  companyName,
  website,
  planId,
  status,
  nextBillingDate,
  practiceLead,
}: RealEngagementSummaryProps) {
  const plan = await getPlanById(planId);

  const metrics = [
    { label: "Active Service", value: plan ? `SEO ${plan.name} — ${plan.priceLabel}/mo` : planId },
    { label: "Company", value: companyName ?? "—" },
    { label: "Domain", value: website ?? "—" },
    { label: "Status", value: STATUS_LABELS[status] ?? status },
    { label: "Next Billing", value: nextBillingDate ?? "—" },
    { label: "Practice Lead", value: practiceLead ?? "—" },
  ];

  return (
    <CornerFrame offset="sm" className="border border-stone-border bg-obsidian-850">
      <div className="px-6 py-5 border-b border-stone-border">
        <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-1.5">
          Client Workspace
        </span>
        <h2 className="font-serif-monument text-3xl text-parchment-50 uppercase tracking-tight">
          Your Engagement
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-stone-border [&>*:nth-child(3n+1)]:lg:border-l-0">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-5">
            <span className="block font-mono text-[9px] text-parchment-dim uppercase tracking-technical mb-1">
              {metric.label}
            </span>
            <span className="font-serif-monument text-sm text-parchment-100">{metric.value}</span>
          </div>
        ))}
      </div>
    </CornerFrame>
  );
}
