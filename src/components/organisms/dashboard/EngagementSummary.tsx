import { MetricGrid } from "@/components/portal/MetricGrid";

const METRICS = [
  { label: "Active service", value: "SEO Growth — £499/mo" },
  { label: "Domain", value: "example-client.co.uk" },
  { label: "Status", value: "Active" },
  { label: "Next billing", value: "1st of each month" },
  { label: "Practice lead", value: "Sr. Technical SEO Consultant" },
];

/** The preview's engagement facts. The page's PageHeader carries the h1. */
export function EngagementSummary() {
  return (
    <section aria-label="Engagement summary">
      <MetricGrid metrics={METRICS} columns={5} />
    </section>
  );
}
