import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/system/Button";
import { PlanPlate, type PlanPlateKind } from "@/components/organisms/sections/PlanPlate";
import type { PricingPlan } from "@/data/pricing";
import { cn } from "@/lib/utils";

interface Tier {
  /** The engraved scene at the head of the card. */
  plate: PlanPlateKind;
  /** The plate's ground, its lines and its built slabs; the accent marks the bullets. */
  colors: CSSProperties;
  /** The plan in the light: a chrome frame, a sheen across its plate and the chrome button; the others sit back. */
  shine?: boolean;
}

/**
 * Each plan's identity, from the logo's palette: ink on pale stone for the
 * foundations, paper on cerulean as it grows, saffron on deep cobalt at full
 * scope.
 */
const TIERS: Tier[] = [
  {
    plate: "foundation",
    colors: {
      "--plate-ground": "var(--color-slab-end)",
      "--plate-ink": "var(--color-ink)",
      "--plate-fill": "var(--color-ink)",
      "--tier": "var(--color-ink-muted)",
    } as CSSProperties,
  },
  {
    plate: "growth",
    colors: {
      "--plate-ground": "var(--color-azure-500)",
      "--plate-ink": "var(--color-paper)",
      "--plate-fill": "var(--color-paper)",
      "--tier": "var(--color-azure-400)",
    } as CSSProperties,
  },
  {
    plate: "scale",
    colors: {
      "--plate-ground": "var(--color-cobalt-900)",
      "--plate-ink": "var(--color-saffron-300)",
      "--plate-fill": "var(--color-saffron-500)",
      "--tier": "var(--color-saffron-500)",
    } as CSSProperties,
    shine: true,
  },
];

const TIER_BY_ID: Record<string, Tier> = { starter: TIERS[0], growth: TIERS[1], scale: TIERS[2] };

/** A known plan keeps its identity; any other takes the one for its place in the list. */
const tierFor = (id: string, index: number) => TIER_BY_ID[id] ?? TIERS[Math.min(index, TIERS.length - 1)];

interface PricingCardProps {
  plan: PricingPlan;
  /** Place in the list, for plans without an identity of their own. */
  index: number;
}

/**
 * One plan as a card on raised paper, headed by its engraved plate (the
 * stack built as far as the plan goes, in the plan's own colours); then
 * name, price and description; the specs as a
 * hairline table; the capabilities; the button. From md to xl the card is a
 * wide row, the specs beside the rest; from xl it is a subgrid spanning the
 * five rows Pricing defines, so the three cards share a baseline. Scale is
 * the plan in the light (chrome frame, sheen, chrome button); the others sit
 * back on translucent paper with their plates dimmed until hovered. The
 * highlighted plan adds a quiet "Recommended" note.
 */
export function PricingCard({ plan, index }: PricingCardProps) {
  const tier = tierFor(plan.id, index);

  return (
    <li
      style={tier.colors}
      className={cn(
        "group/card flex flex-col gap-8 border px-(--pad) pb-8 transition-colors duration-200 motion-reduce:transition-none",
        tier.shine
          ? "pc-shine border-2 border-transparent"
          : "border-line bg-paper-raised/45 hover:border-line-strong hover:bg-paper-raised focus-within:border-line-strong focus-within:bg-paper-raised",
        "[--pad:--spacing(5)] sm:[--pad:--spacing(6)] lg:[--pad:--spacing(8)]",
        "md:grid md:grid-cols-2 md:grid-rows-[auto_auto_1fr_auto] md:gap-x-10 md:gap-y-8 lg:pb-10",
        "xl:row-span-5 xl:grid-cols-1 xl:grid-rows-subgrid",
      )}
    >
      <PlanPlate
        kind={tier.plate}
        className={cn(
          "-mx-(--pad) md:col-span-2 xl:col-span-1",
          tier.shine
            ? "pc-sheen"
            : "opacity-55 saturate-50 transition-[opacity,filter] duration-300 group-hover/card:opacity-100 group-hover/card:saturate-100 group-focus-within/card:opacity-100 group-focus-within/card:saturate-100 motion-reduce:transition-none",
        )}
      />

      <div className="md:col-start-1">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-heading font-medium text-ink">{plan.name}</h2>
          {plan.highlighted ? (
            <p className="inline-flex shrink-0 items-center gap-2 text-small text-ink-soft">
              <span aria-hidden="true" className="size-2 rounded-full border-[1.5px] border-(--tier)" />
              Recommended
            </p>
          ) : null}
        </div>
        <p className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-title font-medium tabular-nums text-ink">{plan.priceLabel}</span>
          <span className="text-small text-ink-muted">{plan.billingPeriod}</span>
        </p>
        <p className="mt-5 max-w-[36ch] text-body text-pretty text-ink-soft">{plan.description}</p>
      </div>

      <dl className="border-t border-line-strong md:col-start-2 md:row-span-3 md:row-start-2 xl:col-start-1 xl:row-span-1 xl:row-start-auto">
        {plan.specs.map((spec) => (
          <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-small">
            <dt className="text-ink-soft">{spec.label}</dt>
            <dd className={cn("text-right text-ink", spec.emphasized ? "font-semibold" : "font-medium")}>
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="md:col-start-1">
        <h3 className="text-small font-medium text-ink">{plan.capabilitiesLabel}</h3>
        <ul className="mt-4 space-y-3">
          {plan.capabilities.map((capability) => (
            <li key={capability} className="flex items-start gap-3 text-small text-ink-soft">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-(--tier)" />
              <span>{capability}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-start-1 md:self-end">
        <ButtonLink
          href={`/subscribe/details?plan=${plan.id}`}
          variant={tier.shine ? "primary" : "secondary"}
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
