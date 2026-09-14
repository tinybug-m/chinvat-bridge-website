import { Icon } from "@/components/atoms/icons";
import { Bay } from "@/components/molecules/Bay";

const ARCHIVED_REPORTS = [
  { title: "Initial Baseline Technical Crawl", meta: "Example audit #1" },
  { title: "Competitor Keyword Landscape", meta: "Example benchmark report" },
];

export function ReportsArchive() {
  return (
    <Bay numeral="III." title="Reports &amp; Archive">
      <div className="p-6 space-y-4">
        <div className="p-4 bg-obsidian-850 border border-gold-500/40">
          <div className="flex justify-between items-start mb-2 gap-3">
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">
              Latest Report
            </span>
            <span className="font-mono text-[10px] text-parchment-dim shrink-0">Example date</span>
          </div>
          <h3 className="font-serif-monument text-base text-parchment-50 mb-1">Executive SEO Report</h3>
          <p className="font-serif-monument text-xs text-parchment-dim mb-4">
            Full-funnel search visibility audit and organic conversion impact.
          </p>
          <button
            type="button"
            disabled
            className="w-full border border-gold-500/50 text-parchment-200 font-mono text-[10px] tracking-technical uppercase py-2.5 px-4 flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
          >
            <span>View Example Report</span>
            <Icon name="article" className="text-sm text-gold-500" />
          </button>
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[10px] text-parchment-dim uppercase tracking-technical block">
            Historical Archive
          </span>
          {ARCHIVED_REPORTS.map((report) => (
            <div
              key={report.title}
              className="border border-stone-border bg-obsidian-950/60 p-3 flex justify-between items-center gap-3"
            >
              <div>
                <div className="font-serif-monument text-sm text-parchment-100">{report.title}</div>
                <div className="font-mono text-[10px] text-parchment-dim">{report.meta}</div>
              </div>
              <Icon name="arrowForward" className="text-parchment-dim text-sm shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Bay>
  );
}
