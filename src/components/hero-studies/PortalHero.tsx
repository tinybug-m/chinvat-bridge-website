import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/system/Button";
import { HERO_COPY } from "@/components/home/hero/content";
import "./hero-studies.css";

/*
 * Study, PORTAL. After the doorway painting in maybe-ideas: a dark stage,
 * one lit doorway, two pillars and the light the door throws across the
 * floor. The pillars are the mark's two halves: drawn (an outline) and
 * built (the logo material). Nothing else.
 *
 * The stage is inset under the fixed header, whose ink text needs paper
 * behind it. All text is server-rendered; only the light animates.
 */

const rise = (delay: number) =>
  ({ "--intro-delay": `${delay}ms` }) as CSSProperties;

export function PortalHero() {
  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="px-2 pt-16 sm:px-3 lg:pt-18"
    >
      <div className="portal relative isolate flex min-h-[clamp(40rem,calc(100svh-5rem),60rem)] flex-col overflow-hidden rounded-[6px] text-paper">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="portal-floor" />
          <div className="portal-path" />
          <div className="portal-pillar" data-side="drawn" />
          <div className="portal-pillar bg-material" data-side="built" />
          <div className="portal-door" />
        </div>

        <p className="intro-rise px-6 pt-6 text-small text-paper/60 sm:px-10 sm:pt-8">
          {HERO_COPY.eyebrow}
        </p>

        <div className="mt-auto grid gap-8 px-6 pt-[17rem] pb-8 lg:pt-0 sm:px-10 sm:pb-10 lg:grid-cols-12 lg:items-end lg:gap-x-6">
          <h1
            id="hero-title"
            className="intro-rise font-display text-display font-medium text-balance [font-stretch:100%] lg:col-span-7 xl:[font-stretch:112%]"
            style={rise(80)}
          >
            <span className="block font-normal text-paper/75">
              {HERO_COPY.titleDrawn}
            </span>{" "}
            <span className="block font-semibold">{HERO_COPY.titleBuilt}</span>
          </h1>
          <div
            className="intro-rise lg:col-span-4 lg:col-start-9"
            style={rise(160)}
          >
            <p className="max-w-[26rem] text-lede text-pretty text-paper/75">
              {HERO_COPY.lede}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink
                href={HERO_COPY.primary.href}
                size="lg"
                arrow="right"
                className="w-full sm:w-auto"
              >
                {HERO_COPY.primary.label}
              </ButtonLink>
              <ButtonLink
                href={HERO_COPY.secondary.href}
                size="lg"
                variant="secondary"
                arrow="down"
                className="portal-secondary w-full sm:w-auto"
              >
                {HERO_COPY.secondary.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
