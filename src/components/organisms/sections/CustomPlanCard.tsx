import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/system/Button";
import { PlanPlate } from "@/components/organisms/sections/PlanPlate";
import { CONTACT_LINK, prefetchFor } from "@/components/site/nav";
import { SERVICES } from "@/data/services";
import { cn } from "@/lib/utils";

/**
 * The fourth card: a personalised package, after the plans. Ink, like the
 * hero's slabs, so it reads as part of the family but not as another tier.
 * Its plate stacks all four disciplines, still drawn: the scope is yours to set.
 * No price; the button opens the homepage conversation. From md a wide band
 * like the plans above it, the invitation beside the disciplines; from xl it
 * spans the three plans.
 */
export function CustomPlanCard() {
  return (
    <li
      style={
        {
          "--plate-ground": "var(--color-ink)",
          "--plate-ink": "var(--color-paper)",
          "--plate-fill": "var(--color-paper)",
        } as CSSProperties
      }
      className={cn(
        "flex flex-col gap-8 bg-ink px-(--pad) pb-8 text-paper",
        "[--pad:--spacing(5)] sm:[--pad:--spacing(6)] lg:[--pad:--spacing(8)]",
        "md:grid md:grid-cols-12 md:grid-rows-[auto_auto_1fr] md:gap-x-8 md:gap-y-8 lg:pb-10 xl:col-span-3",
      )}
    >
      <PlanPlate kind="custom" className="-mx-(--pad) border-b border-paper/15 md:col-span-12" />

      <div className="md:col-span-6 md:row-start-2 xl:col-span-5">
        <h2 className="font-display text-heading font-medium">Custom Solutions</h2>
        <p className="mt-4 font-display text-subheading font-medium text-paper/85">Scoped to your brief</p>
        <p className="mt-5 max-w-[40ch] text-body text-pretty text-paper/75">
          Need more than a retainer covers? Tell us what you&rsquo;re working towards and we&rsquo;ll put together a
          personalised package, with scope tailored across SEO, AI, automation and software.
        </p>
      </div>

      <div className="mt-auto md:col-span-6 md:col-start-7 md:row-span-2 md:row-start-2 md:mt-0">
        <h3 className="text-small font-medium">Ask us about</h3>
        <ul className="mt-4 grid border-t border-paper/25 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-1 xl:grid-cols-2 xl:gap-x-8">
          {SERVICES.map((service) => (
            <li key={service.title} className="border-b border-paper/15 py-3 text-small">
              <span className="block font-medium">{service.title}</span>
              <span className="block text-paper/60">{service.strapline}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-6 md:row-start-3 md:self-end xl:col-span-5">
        <ButtonLink
          href={CONTACT_LINK.href}
          prefetch={prefetchFor(CONTACT_LINK.href)}
          variant="primary"
          size="lg"
          arrow="right"
          className="w-full focus-visible:outline-paper md:w-auto"
        >
          Request a custom package
        </ButtonLink>
      </div>
    </li>
  );
}
