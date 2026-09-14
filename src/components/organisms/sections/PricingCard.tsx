import { Button } from "@/components/atoms/Button";
import type { PricingPlan } from "@/data/pricing";

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className={`flex flex-col justify-between rounded-sm card-border-glow ${
        plan.highlighted
          ? "border-2 border-gold-500/70 bg-obsidian-900 shadow-xl shadow-gold-500/5"
          : "border border-stone-border bg-obsidian-850"
      }`}
    >
      <div>
        {plan.highlighted ? (
          <div className="bg-gold-500 text-obsidian-950 px-4 py-1.5 flex justify-between items-center text-[10px] font-mono font-bold tracking-technical uppercase">
            <span>Recommended</span>
            <span>{plan.tierLabel}</span>
          </div>
        ) : null}
        <div className="p-6 border-b border-stone-border/80">
          <div className="flex justify-between items-center mb-2">
            <span className="font-cinzel text-[11px] tracking-technical text-gold-400 uppercase font-medium">
              {plan.tierLabel}
            </span>
          </div>
          <h3 className="font-serif-monument text-2xl text-parchment-50 uppercase tracking-wide">{plan.name}</h3>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-serif-monument text-4xl text-parchment-50">{plan.priceLabel}</span>
            <span className="font-mono text-xs text-parchment-dim tracking-technical uppercase">
              {plan.billingPeriod}
            </span>
          </div>
          <p className="font-serif-monument text-sm text-parchment-muted mt-3 leading-relaxed">{plan.description}</p>
        </div>
        <div className="p-6 space-y-6">
          <dl className="space-y-2.5 border-b border-stone-border/80 pb-5">
            {plan.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-3 text-sm">
                <dt className="font-mono text-[11px] text-parchment-dim uppercase tracking-technical">
                  {spec.label}
                </dt>
                <dd
                  className={`font-mono text-xs font-semibold text-right ${
                    spec.emphasized ? "text-gold-400" : "text-parchment-100"
                  }`}
                >
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-gold-500 uppercase tracking-technical block">
              {plan.capabilitiesLabel}
            </span>
            <ul className="space-y-2.5">
              {plan.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex items-start gap-2.5 font-serif-monument text-sm text-parchment-200"
                >
                  <span aria-hidden="true" className="text-gold-500 mt-0.5">
                    &mdash;
                  </span>
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <Button
          href={`/subscribe/details?plan=${plan.id}`}
          icon="arrowForward"
          variant={plan.highlighted ? "solid" : "outline"}
          size="md"
          className="w-full"
        >
          Choose {plan.name}
        </Button>
      </div>
    </div>
  );
}
