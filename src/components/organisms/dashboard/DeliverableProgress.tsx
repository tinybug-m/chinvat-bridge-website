import { Bay } from "@/components/molecules/Bay";
import { SteppedProgressBar } from "@/components/atoms/SteppedProgressBar";

const PROGRESS_ITEMS = [
  {
    label: "Content Assets: 6 / 15 Completed",
    percentLabel: "40% Complete",
    totalSteps: 15,
    completedSteps: 6,
    note: "6 published guides, 9 in the editorial pipeline this month.",
  },
  {
    label: "Technical SEO: In Progress",
    percentLabel: "80% Complete",
    totalSteps: 5,
    completedSteps: 4,
    note: "Site crawl complete. Schema deployment underway; 4 of 5 targets cleared.",
  },
  {
    label: "Link Building: 1 Active Campaign",
    percentLabel: "100% Deployed",
    totalSteps: 4,
    completedSteps: 4,
    note: "Outreach campaign live, with placements in final review.",
  },
];

export function DeliverableProgress() {
  return (
    <Bay
      numeral="I."
      title="Monthly Cycle Progress"
      meta={<span className="font-mono text-[10px] text-parchment-dim uppercase tracking-technical">Example Cycle</span>}
      footer={
        <>
          <span>Illustrative example data</span>
          <span>Last updated: example only</span>
        </>
      }
    >
      <div className="p-6 space-y-6">
        {PROGRESS_ITEMS.map((item, index) => (
          <div key={item.label} className={index > 0 ? "pt-6 border-t border-stone-border space-y-2" : "space-y-2"}>
            <div className="flex justify-between items-end gap-3">
              <span className="font-mono text-[11px] text-parchment-100 uppercase tracking-technical">
                {item.label}
              </span>
              <span className="font-mono text-[11px] text-gold-400 font-semibold shrink-0">{item.percentLabel}</span>
            </div>
            <SteppedProgressBar totalSteps={item.totalSteps} completedSteps={item.completedSteps} />
            <p className="font-serif-monument text-xs text-parchment-dim">{item.note}</p>
          </div>
        ))}
      </div>
    </Bay>
  );
}
