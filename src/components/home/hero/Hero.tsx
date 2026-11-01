import type { CSSProperties } from "react";
import { Annotation } from "@/components/system/Annotation";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { SEAM_ANCHORS } from "@/components/three/scenes/seam/config";
import { HERO_COPY, SEAM_LABELS } from "./content";
import { DisciplineIndex } from "./DisciplineIndex";
import { HeroObject } from "./HeroObject";
import { LogoMaterialToggle } from "./LogoMaterialToggle";

/*
 * EXHIBIT layout. Text on the left (columns 1-7), the mark as an exhibit on
 * the right (columns 7-12, bleeding toward the edge) with the seam hairline
 * running through its axis and one callout where the seam leaves the object.
 * The discipline links sit quietly under the text on wide screens only: on
 * small screens Services follows straight after, so they would only repeat it.
 *
 * All text is server-rendered; .intro-rise only animates what is already
 * painted (and is off under reduced motion).
 */

const rise = (delay: number) => ({ "--intro-delay": `${delay}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section data-hero aria-labelledby="hero-title" className="relative overflow-x-clip">
      <Container className="relative grid grid-cols-1 lg:min-h-[clamp(46rem,100svh,60rem)] lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-6">
        <div className="pt-[calc(4rem+2.25rem)] lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:self-center lg:pt-[calc(4.5rem+2rem)] lg:pb-12">
          <p className="intro-rise text-small text-ink-muted">{HERO_COPY.eyebrow}</p>
          <h1
            id="hero-title"
            className="intro-rise mt-5 font-display text-display font-medium text-balance [font-stretch:100%] lg:mt-7 xl:[font-stretch:112%]"
            style={rise(80)}
          >
            <span className="block font-normal lg:whitespace-nowrap">{HERO_COPY.titleDrawn}</span>{" "}
            <span className="block font-semibold lg:whitespace-nowrap">{HERO_COPY.titleBuilt}</span>
          </h1>
          <p className="intro-rise mt-6 max-w-[34rem] text-lede text-pretty text-ink-soft lg:mt-8" style={rise(160)}>
            {HERO_COPY.lede}
          </p>
          <div
            className="intro-rise mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-10"
            style={rise(220)}
          >
            <ButtonLink href={HERO_COPY.primary.href} size="lg" arrow="right" className="w-full sm:w-auto">
              {HERO_COPY.primary.label}
            </ButtonLink>
            <ButtonLink
              href={HERO_COPY.secondary.href}
              size="lg"
              variant="secondary"
              arrow="down"
              className="w-full sm:w-auto"
            >
              {HERO_COPY.secondary.label}
            </ButtonLink>
          </div>
        </div>

        <figure className="relative mt-10 flex justify-center pt-10 pb-16 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:-mr-gutter lg:mt-0 lg:items-center lg:pl-12 lg:pt-[calc(4.5rem+3rem)] lg:pb-14">
          {/* The seam: the object's axis, from the top of the hero to the foot of the figure. */}
          {/* Its foot is where the energy wire into Services starts (data-energy-origin, see EnergyFlow). */}
          <span
            aria-hidden="true"
            data-energy-origin=""
            className="absolute inset-y-0 left-1/2 w-px bg-line-strong lg:top-18 lg:left-[calc(50%+1.5rem)]"
          />
          <HeroObject
            className="h-[38svh] max-h-[26rem] min-h-[17rem] lg:h-[min(34rem,calc(100svh-15rem))] xl:h-[min(40rem,calc(100svh-15rem))] lg:max-h-none lg:min-h-[28rem]"
            sizes="(min-width: 64rem) 40rem, 26rem"
          >
            <SeamCaption />
          </HeroObject>
          {/* Small, in the figure's bottom margin at the content edge (lg: the figure bleeds by one gutter). */}
          <LogoMaterialToggle className="intro-rise absolute right-0 bottom-1 lg:right-gutter lg:bottom-2" />
          <figcaption className="sr-only">
            The Chinvat Bridge mark, half drawn and half built: {SEAM_LABELS.drawn.label}, {SEAM_LABELS.seam.label},{" "}
            {SEAM_LABELS.built.label}.
          </figcaption>
        </figure>

        <DisciplineIndex className="hidden pb-10 lg:col-span-12 lg:block lg:row-start-2 lg:pb-12" />
      </Container>
    </section>
  );
}

/**
 * The one callout on the object, where the seam leaves it between the feet.
 * The other two states are named in the figure's screen-reader caption; on
 * screen the mark and the headline already say it.
 */
function SeamCaption() {
  const foot = SEAM_ANCHORS.seamFoot;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute -translate-x-[3px] translate-y-6"
        style={{ left: `${foot.left}%`, top: `${foot.top}%` }}
      >
        {/* Its own wrapper: the offset above uses `translate`, which the rise would replace. Lands just after the seam sweep. */}
        <div className="intro-rise" style={rise(1200)}>
          <Annotation leader="start" leaderLength="1.25rem" className="bg-paper pr-1 font-body text-small whitespace-nowrap">
            {SEAM_LABELS.seam.label}
          </Annotation>
        </div>
      </div>
    </div>
  );
}
