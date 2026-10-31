import { Chip } from "@/components/atoms/Chip";
import { Panel } from "@/components/portal/Panel";
import { ProgressRow } from "@/components/portal/ProgressRow";
import { getPlanById } from "@/data/pricing";
import { createClient } from "@/lib/supabase/server";

interface RealProjectProgressProps {
  customerId: string;
  planId: string;
}

export async function RealProjectProgress({ customerId, planId }: RealProjectProgressProps) {
  const supabase = await createClient();
  const [{ data: progressItems }, plan] = await Promise.all([
    supabase
      .from("customer_progress_items")
      .select("*")
      .eq("customer_id", customerId)
      .order("sort_order"),
    getPlanById(planId),
  ]);

  if (progressItems && progressItems.length > 0) {
    return (
      <Panel title="Project progress" footer={<span>Updated by your consultant as work progresses.</span>}>
        <ul className="divide-y divide-line">
          {progressItems.map((item) => (
            <ProgressRow
              key={item.id}
              label={`${item.label}: ${item.status_label}`}
              percentLabel={item.percent_label}
              totalSteps={item.total_steps}
              completedSteps={item.completed_steps}
              note={item.note}
            />
          ))}
        </ul>
      </Panel>
    );
  }

  // No progress has been posted yet — fall back to an honest view of what's committed under
  // the plan, rather than either fabricating numbers or showing nothing at all.
  const scopeItems = plan?.capabilities ?? [];

  return (
    <Panel
      title="Project progress"
      meta={plan ? <span className="text-small text-ink-muted">{plan.capabilitiesLabel}</span> : null}
      footer={<span>Your consultant will update this as work begins on each item.</span>}
    >
      <ul className="divide-y divide-line">
        {scopeItems.map((item) => (
          <li key={item} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <span className="text-small text-ink">{item}</span>
            <Chip>Not started</Chip>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
