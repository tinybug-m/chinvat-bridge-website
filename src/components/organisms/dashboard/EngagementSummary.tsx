import { CornerFrame } from "@/components/atoms/CornerFrame";

const METRICS = [
  { label: "Active Service", value: "SEO Growth — £499/mo" },
  { label: "Domain", value: "example-client.co.uk" },
  { label: "Status", value: "Active" },
  { label: "Next Billing", value: "1st of each month" },
  { label: "Practice Lead", value: "Sr. Technical SEO Consultant" },
];

export function EngagementSummary() {
  return (
    <CornerFrame offset="sm" className="border border-stone-border bg-obsidian-850">
      <div className="px-6 py-5 border-b border-stone-border flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block mb-1.5">
            &sect; IV // Client Workspace &mdash; Example Preview
          </span>
          <h1 className="font-serif-monument text-3xl text-parchment-50 uppercase tracking-tight">
            Client Engagement Portal
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-obsidian-950 border border-gold-500/40">
          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-gold-400 motion-safe:animate-pulse" />
          <span className="font-mono text-[10px] text-gold-400 uppercase tracking-technical font-semibold">
            Example Data
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-stone-border">
        {METRICS.map((metric) => (
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
