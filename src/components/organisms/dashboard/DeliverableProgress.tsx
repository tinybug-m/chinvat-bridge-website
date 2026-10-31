import { Chip } from "@/components/atoms/Chip";
import { Panel } from "@/components/portal/Panel";
import { ProgressRow } from "@/components/portal/ProgressRow";

const PROGRESS_ITEMS = [
  {
    label: "Content assets: 6 / 15 completed",
    percentLabel: "40% complete",
    totalSteps: 15,
    completedSteps: 6,
    note: "6 published guides, 9 in the editorial pipeline this month.",
  },
  {
    label: "Technical SEO: in progress",
    percentLabel: "80% complete",
    totalSteps: 5,
    completedSteps: 4,
    note: "Site crawl complete. Schema deployment underway; 4 of 5 targets cleared.",
  },
  {
    label: "Link building: 1 active campaign",
    percentLabel: "100% deployed",
    totalSteps: 4,
    completedSteps: 4,
    note: "Outreach campaign live, with placements in final review.",
  },
];

export function DeliverableProgress() {
  return (
    <Panel
      title="Monthly cycle progress"
      meta={<Chip>Example cycle</Chip>}
      footer={
        <>
          <span>Illustrative example data</span>
          <span>Last updated: example only</span>
        </>
      }
    >
      <ul className="divide-y divide-line">
        {PROGRESS_ITEMS.map((item) => (
          <ProgressRow key={item.label} {...item} />
        ))}
      </ul>
    </Panel>
  );
}
