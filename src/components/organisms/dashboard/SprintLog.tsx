import { Chip } from "@/components/atoms/Chip";
import { Panel } from "@/components/portal/Panel";
import { SprintTable } from "@/components/portal/SprintTable";

type SprintStatus = "Complete" | "In Review" | "In Progress" | "Scheduled";

interface SprintRow {
  title: string;
  detail: string;
  status: SprintStatus;
  date: string;
}

const SPRINT_ROWS: SprintRow[] = [
  { title: "Schema markup implementation", detail: "Structured data for key page templates", status: "Complete", date: "Example date" },
  { title: "Commercial intent content brief", detail: "High-intent keyword targeting", status: "In Review", date: "Example date" },
  { title: "Core Web Vitals optimization", detail: "Asset compression & caching rules", status: "In Progress", date: "Example date" },
  { title: "Monthly SEO report", detail: "Executive summary & competitive shift", status: "Scheduled", date: "Example date" },
];

export function SprintLog() {
  return (
    <Panel title="Current sprint" meta={<Chip>Example sprint</Chip>} footer={<span>Illustrative example data</span>}>
      <SprintTable rows={SPRINT_ROWS.map((row) => ({ key: row.title, ...row }))} />
    </Panel>
  );
}
