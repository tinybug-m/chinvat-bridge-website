import type { CSSProperties } from "react";
import { Annotation } from "@/components/system/Annotation";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { SEAM_ANCHORS } from "@/components/three/scenes/seam/config";
import { HERO_COPY, SEAM_LABELS } from "./content";
import { DisciplineIndex } from "./DisciplineIndex";
import { HeroObject } from "./HeroObject";

/*
 * EXHIBIT layout. Text on the left (columns 1-7), the mark as an exhibit on
 * the right (columns 7-12, bleeding toward the edge) with the seam hairline
 * running the full height of the hero through its axis, and the discipline
 * index closing the first viewport on a rule that carries a ring node where
 * the seam crosses it. On small screens: text, then the object, then the
 * index as a 2 x 2 grid.
 *
 * All text is server-rendered; .intro-rise only animates what is already
 * painted (and is off under reduced motion).
 */

const rise = (delay: number) => ({ "--intro-delay": `${delay}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section data-hero aria-labelledby="hero-title" className="relative overflow-x-clip">
      <Container className="relative grid grid-cols-1 lg:min-h-[max(100svh,46rem)] lg:grid-cols-12 lg:grid-rows-[1fr_auto] lg:gap-x-6">
        <div className="pt-[calc(4rem+2.25rem)] lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:self-center lg:pt-[calc(4.5rem+2rem)] lg:pb-12">
          <p className="intro-rise font-label text-label text-ink-muted uppercase">{HERO_COPY.eyebrow}</p>
          <h1
            id="hero-title"
            className="intro-rise mt-5 font-display text-display font-medium text-balance [font-stretch:100%] lg:mt-7 lg:[font-stretch:112%]"
            style={rise(80)}
          >
            <span className="block text-ink-muted">{HERO_COPY.titleDrawn}</span>{" "}
            <span className="block text-ink">{HERO_COPY.titleBuilt}</span>
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
          {/* The seam: the object's axis, from the top of the hero to the rule above the index. */}
          <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px bg-line-strong lg:top-18 lg:left-[calc(50%+1.5rem)]" />
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 z-10 size-[11px] lg:left-[calc(50%+1.5rem)] -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-saffron-500 bg-paper"
          />
          <HeroObject
            className="h-[38svh] max-h-[26rem] min-h-[17rem] lg:h-[min(40rem,calc(100svh-15rem))] lg:max-h-none lg:min-h-[28rem]"
            sizes="(min-width: 64rem) 40rem, 26rem"
          >
            <SeamCaption />
          </HeroObject>
          <figcaption className="sr-only">
            The Chinvat Bridge mark, half drawn and half built: {SEAM_LABELS.drawn.label}, {SEAM_LABELS.seam.label},{" "}
            {SEAM_LABELS.built.label}.
          </figcaption>
        </figure>

        <div className="border-t border-line lg:col-span-12 lg:row-start-2">
          <DisciplineIndex />
        </div>
      </Container>
    </section>
  );
}

/** The drawing's callouts, placed in the object's frame so they stay on it at every size. */
function SeamCaption() {
  const foot = SEAM_ANCHORS.seamFoot;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Above the object, split by the seam: drawn on the left, built on the right. */}
      <div className="absolute inset-x-0 flex -translate-y-full justify-center" style={{ top: "0%" }}>
        <span className="flex w-1/2 justify-end pr-2.5 sm:pr-3">
          <Annotation index={SEAM_LABELS.drawn.index} className="whitespace-nowrap">
            {SEAM_LABELS.drawn.label}
          </Annotation>
        </span>
        <span className="flex w-1/2 justify-start pl-2.5 sm:pl-3">
          <Annotation index={SEAM_LABELS.built.index} className="whitespace-nowrap">
            {SEAM_LABELS.built.label}
          </Annotation>
        </span>
      </div>
      {/* Where the seam leaves the object, between the feet. */}
      <div
        className="absolute -translate-x-[3px] translate-y-6"
        style={{ left: `${foot.left}%`, top: `${foot.top}%` }}
      >
        <Annotation index={SEAM_LABELS.seam.index} leader="start" leaderLength="1.25rem" className="whitespace-nowrap bg-paper pr-1">
          {SEAM_LABELS.seam.label}
        </Annotation>
      </div>
    </div>
  );
}

