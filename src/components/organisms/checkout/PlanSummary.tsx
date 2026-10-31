import type { PricingPlan } from "@/data/pricing";

/** The chosen plan as a ruled card beside the details form. */
export function PlanSummary({ plan }: { plan: PricingPlan }) {
  return (
    <section
      aria-labelledby="plan-summary-title"
      className="rounded-[2px] border border-line bg-paper-raised p-6 lg:p-8"
    >
      <p className="text-small text-ink-muted">Engagement specification</p>
      <h2 id="plan-summary-title" className="mt-2 font-display text-subheading font-medium text-ink">
        {plan.name} plan
      </h2>
      <p className="mt-2 text-small text-pretty text-ink-soft">{plan.description}</p>

      <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
        <span className="text-small text-ink-muted">Monthly rate</span>
        <div className="text-right">
          <span className="font-display text-heading font-medium text-ink tabular-nums">{plan.priceLabel}</span>
          <span className="block text-small text-ink-muted">Billed monthly</span>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <p className="text-small font-medium text-ink">Scope of deliverables</p>
        <ul className="mt-3 space-y-2.5">
          {plan.capabilities.map((capability) => (
            <li key={capability} className="flex items-start gap-3 text-small text-ink-soft">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" />
              <span>{capability}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <p className="text-small font-medium text-ink">Terms</p>
        <p className="mt-1 text-small text-pretty text-ink-soft">
          No lock-in contract. Cancel any time with 30 days&rsquo; notice.
        </p>
      </div>
    </section>
  );
}
