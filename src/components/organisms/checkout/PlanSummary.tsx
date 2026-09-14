import { CornerFrame } from "@/components/atoms/CornerFrame";
import type { PricingPlan } from "@/data/pricing";

export function PlanSummary({ plan }: { plan: PricingPlan }) {
  return (
    <CornerFrame className="border border-stone-border bg-obsidian-850 rounded-sm p-6">
      <div className="border-b border-stone-border pb-4 mb-5">
        <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold block mb-1">
          Engagement Specification
        </span>
        <h2 className="font-serif-monument text-xl text-parchment-50 uppercase">{plan.name} Plan</h2>
        <p className="font-serif-monument text-sm text-parchment-muted mt-1 leading-relaxed">{plan.description}</p>
      </div>

      <div className="py-4 border-b border-stone-border flex justify-between items-baseline">
        <span className="font-mono text-[10px] text-parchment-dim uppercase tracking-technical">Monthly Rate</span>
        <div className="text-right">
          <span className="font-serif-monument text-2xl text-gold-400 font-semibold">{plan.priceLabel}</span>
          <span className="font-mono text-xs text-parchment-dim block">Billed monthly</span>
        </div>
      </div>

      <div className="py-5 border-b border-stone-border space-y-3">
        <span className="font-mono text-[10px] text-parchment-50 uppercase tracking-technical font-semibold block">
          Scope of Deliverables
        </span>
        {plan.capabilities.map((capability) => (
          <div key={capability} className="flex items-start gap-2.5">
            <span aria-hidden="true" className="text-gold-500 mt-0.5">
              &mdash;
            </span>
            <span className="font-serif-monument text-sm text-parchment-200">{capability}</span>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical font-semibold block mb-1">
          Terms
        </span>
        <p className="font-serif-monument text-sm text-parchment-muted leading-relaxed">
          No lock-in contract. Cancel any time with 30 days&rsquo; notice.
        </p>
      </div>
    </CornerFrame>
  );
}
