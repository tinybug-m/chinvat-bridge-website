import { Bay } from "@/components/molecules/Bay";

type SprintStatus = "Complete" | "In Review" | "In Progress" | "Scheduled";

interface SprintRow {
  title: string;
  detail: string;
  status: SprintStatus;
  date: string;
}

const SPRINT_ROWS: SprintRow[] = [
  { title: "Schema Markup Implementation", detail: "Structured data for key page templates", status: "Complete", date: "Example date" },
  { title: "Commercial Intent Content Brief", detail: "High-intent keyword targeting", status: "In Review", date: "Example date" },
  { title: "Core Web Vitals Optimization", detail: "Asset compression & caching rules", status: "In Progress", date: "Example date" },
  { title: "Monthly SEO Report", detail: "Executive summary & competitive shift", status: "Scheduled", date: "Example date" },
];

const STATUS_CLASSES: Record<SprintStatus, string> = {
  Complete: "border-gold-500 text-gold-400",
  "In Review": "border-stone-borderLight text-parchment-100",
  "In Progress": "border-gold-500/50 text-gold-300",
  Scheduled: "border-stone-border text-parchment-dim",
};

export function SprintLog() {
  return (
    <Bay
      numeral="II."
      title="Current Sprint"
      meta={<span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">Example Sprint</span>}
      footer={<span>Illustrative example data</span>}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-stone-border">
              <th className="py-3 px-6 font-mono text-[10px] text-gold-500 uppercase tracking-technical">Deliverable</th>
              <th className="py-3 px-4 font-mono text-[10px] text-gold-500 uppercase tracking-technical">Status</th>
              <th className="py-3 px-6 font-mono text-[10px] text-gold-500 uppercase tracking-technical">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-border">
            {SPRINT_ROWS.map((row) => (
              <tr key={row.title} className="hover:bg-obsidian-850 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-serif-monument text-sm text-parchment-100">{row.title}</div>
                  <div className="font-mono text-[10px] text-parchment-dim mt-0.5">{row.detail}</div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 border font-mono text-[10px] uppercase tracking-technical ${STATUS_CLASSES[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono text-[10px] text-parchment-dim uppercase tracking-technical">
                  {row.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Bay>
  );
}
