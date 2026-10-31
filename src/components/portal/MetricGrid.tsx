import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: string;
}

const COLUMNS = {
  3: "lg:grid-cols-3",
  5: "lg:grid-cols-5",
} as const;

/**
 * Engagement facts as a definition list in a hairline grid. The lines are the
 * 1px gaps over a line-coloured ground, so they stay even at every breakpoint.
 */
export function MetricGrid({ metrics, columns }: { metrics: Metric[]; columns: keyof typeof COLUMNS }) {
  const oddOnTwo = metrics.length % 2 === 1;
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-line bg-line sm:grid-cols-2",
        COLUMNS[columns],
      )}
    >
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={cn(
            "bg-paper-raised px-5 py-4 sm:px-6 sm:py-5",
            oddOnTwo && index === metrics.length - 1 && "sm:col-span-2 lg:col-span-1",
          )}
        >
          <dt className="text-small text-ink-muted">{metric.label}</dt>
          <dd className="mt-1 text-body font-medium text-pretty break-words text-ink">{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}
