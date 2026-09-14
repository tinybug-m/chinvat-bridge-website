import { Bay } from "@/components/molecules/Bay";
import { Chip } from "@/components/atoms/Chip";
import { SteppedProgressBar } from "@/components/atoms/SteppedProgressBar";
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
      <Bay numeral="I." title="Project Progress" footer={<span>Updated by your consultant as work progresses.</span>}>
        <div className="p-6 space-y-6">
          {progressItems.map((item, index) => (
            <div key={item.id} className={index > 0 ? "pt-6 border-t border-stone-border space-y-2" : "space-y-2"}>
              <div className="flex justify-between items-end gap-3">
                <span className="font-mono text-[11px] text-parchment-100 uppercase tracking-technical">
                  {item.label}: {item.status_label}
                </span>
                <span className="font-mono text-[11px] text-gold-400 font-semibold shrink-0">
                  {item.percent_label}
                </span>
              </div>
              <SteppedProgressBar totalSteps={item.total_steps} completedSteps={item.completed_steps} />
              {item.note ? <p className="font-serif-monument text-xs text-parchment-dim">{item.note}</p> : null}
            </div>
          ))}
        </div>
      </Bay>
    );
  }

  // No progress has been posted yet — fall back to an honest view of what's committed under
  // the plan, rather than either fabricating numbers or showing nothing at all.
  const scopeItems = plan?.capabilities ?? [];

  return (
    <Bay
      numeral="I."
      title="Project Progress"
      meta={
        plan ? (
          <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold">
            {plan.capabilitiesLabel}
          </span>
        ) : null
      }
      footer={<span>Your consultant will update this as work begins on each item.</span>}
    >
      <div className="divide-y divide-stone-border">
        {scopeItems.map((item) => (
          <div key={item} className="p-6 flex items-center justify-between gap-4">
            <span className="font-serif-monument text-sm text-parchment-100">{item}</span>
            <Chip>Not Started</Chip>
          </div>
        ))}
      </div>
    </Bay>
  );
}
