import { Bay } from "@/components/molecules/Bay";
import { Chip } from "@/components/atoms/Chip";
import { getPlanById } from "@/data/pricing";

export function RealProjectProgress({ planId }: { planId: string }) {
  const plan = getPlanById(planId);
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
