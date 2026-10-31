import { ButtonLink } from "@/components/system/Button";
import type { PricingPlan } from "@/data/pricing";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  plan: PricingPlan;
  /** Where the column sits, so the outer columns align with the page margin. */
  position?: "first" | "middle" | "last";
}

/**
 * One plan as a column: tier, name and price; the specs as a hairline table;
 * the capabilities; the button. On lg it is a subgrid spanning the four rows
 * Pricing defines, so every plan's blocks share a baseline. The recommended
 * plan sits on raised paper under an ink rule and takes the primary (logo
 * material) button; the others take the hairline button.
 */
export function PricingCard({ plan, position = "middle" }: PricingCardProps) {
  const featured = Boolean(plan.highlighted);

  return (
    <li
      className={cn(
        "flex flex-col gap-8 border-t border-line py-10 lg:row-span-4 lg:grid lg:grid-rows-subgrid lg:gap-y-10 lg:border-t-0 lg:px-8 lg:py-12",
        position === "first" && "border-t-0",
        position !== "first" && "lg:border-l",
        !featured && position === "first" && "lg:pl-0",
        !featured && position === "last" && "lg:pr-0",
        featured &&
          "-mx-gutter border-t-transparent bg-paper-raised px-gutter shadow-[inset_0_2px_0_var(--color-ink)] lg:mx-0 lg:px-8",
        featured && "[&+li]:border-t-transparent",
      )}
    >
      <div>
        <p className="flex items-center justify-between gap-4 text-small text-ink-muted">
          <span>{plan.tierLabel}</span>
          {featured ? (
            <span className="inline-flex items-center gap-2 font-medium text-ink">
              <span aria-hidden="true" className="size-[9px] rounded-full border-2 border-saffron-500" />
              Recommended
            </span>
          ) : null}
        </p>
        <h2 className="mt-3 font-display text-heading font-medium text-ink">{plan.name}</h2>
        <p className="mt-6 flex items-baseline gap-2">
          <span className="font-display text-title font-medium tabular-nums text-ink">{plan.priceLabel}</span>
          <span className="text-small text-ink-muted">{plan.billingPeriod}</span>
        </p>
        <p className="mt-5 max-w-[34ch] text-body text-pretty text-ink-soft">{plan.description}</p>
      </div>

      <dl className="border-t border-line-strong">
        {plan.specs.map((spec) => (
          <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-small">
            <dt className="text-ink-soft">{spec.label}</dt>
            <dd className={cn("text-right text-ink", spec.emphasized ? "font-semibold" : "font-medium")}>
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="text-small font-medium text-ink">{plan.capabilitiesLabel}</h3>
        <ul className="mt-4 space-y-3">
          {plan.capabilities.map((capability) => (
            <li key={capability} className="flex items-start gap-3 text-small text-ink-soft">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-ink-muted" />
              <span>{capability}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:self-end">
        <ButtonLink
          href={`/subscribe/details?plan=${plan.id}`}
          variant={featured ? "primary" : "secondary"}
          size="lg"
          arrow="right"
          className="w-full"
        >
          Choose {plan.name}
        </ButtonLink>
      </div>
    </li>
  );
}
