import { Panel } from "@/components/portal/Panel";
import { Button } from "@/components/system/Button";

const ARCHIVED_REPORTS = [
  { title: "Initial baseline technical crawl", meta: "Example audit #1" },
  { title: "Competitor keyword landscape", meta: "Example benchmark report" },
];

export function ReportsArchive() {
  return (
    <Panel title="Reports & archive">
      <div className="space-y-6 px-5 py-5 sm:px-6">
        <div className="rounded-[2px] border border-line-strong bg-paper p-5">
          <div className="flex items-baseline justify-between gap-3 text-small">
            <span className="font-medium text-ink-soft">Latest report</span>
            <span className="shrink-0 text-ink-muted">Example date</span>
          </div>
          <h3 className="mt-3 text-body font-medium text-ink">Executive SEO report</h3>
          <p className="mt-1 text-small text-pretty text-ink-soft">
            Full-funnel search visibility audit and organic conversion impact.
          </p>
          <Button variant="secondary" disabled className="mt-5 w-full border border-dashed border-line-strong text-ink-muted shadow-none disabled:opacity-100">
            View example report (coming soon)
          </Button>
        </div>

        <div>
          <h3 className="text-small font-medium text-ink-soft">Historical archive</h3>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {ARCHIVED_REPORTS.map((report) => (
              <li key={report.title} className="py-3">
                <div className="text-small font-medium text-ink">{report.title}</div>
                <div className="text-small text-ink-muted">{report.meta}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
