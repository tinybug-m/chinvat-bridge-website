import Image from "next/image";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/system/Button";
import { Container } from "@/components/system/Container";
import { HERO_COPY } from "@/components/home/hero/content";
import {
  POSTER_CLASSIC_SRC,
  POSTER_SRC,
} from "@/components/home/hero/HeroObject";
import "@/components/brand/logo-material.css";
import "./hero-studies.css";

/*
 * Study, MONUMENT. The rendered mark as a monument: far larger than the
 * viewport, cropped by the hero's edges, the paper half meeting the page
 * and the chrome half carrying the colour. Big type, lots of room, nothing
 * else on the page competes with it.
 *
 * Both material renders are server-rendered; <html data-logo-material>
 * picks one, and the classic one is only fetched once chosen.
 */

const rise = (delay: number) =>
  ({ "--intro-delay": `${delay}ms` }) as CSSProperties;

export function MonumentHero() {
  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="relative flex flex-col overflow-hidden"
    >
      <div
        aria-hidden="true"
        data-layer="poster"
        className="monument-mark pointer-events-none"
      >
        <div data-material="chrome" className="absolute inset-0">
          <Image
            src={POSTER_SRC}
            alt=""
            fill
            priority
            sizes="(min-width: 64rem) 75vw, 135vw"
            className="object-contain"
          />
        </div>
        <div data-material="classic" className="absolute inset-0">
          <Image
            src={POSTER_CLASSIC_SRC}
            alt=""
            fill
            sizes="(min-width: 64rem) 75vw, 135vw"
            className="object-contain"
          />
        </div>
      </div>

      <Container className="relative flex flex-col pt-[calc(4rem+2.25rem)] pb-12 lg:min-h-[clamp(46rem,100svh,62rem)] lg:pt-[calc(4.5rem+2rem)] lg:pb-16">
        <p className="intro-rise text-small text-ink-muted">
          {HERO_COPY.eyebrow}
        </p>
        <div className="mt-10 lg:mt-auto lg:max-w-[44rem]">
          <h1
            id="hero-title"
            className="intro-rise font-display text-[clamp(3rem,1.2rem+7vw,8.5rem)] leading-[0.92] font-medium tracking-[-0.035em] [font-stretch:100%] xl:[font-stretch:112%]"
            style={rise(80)}
          >
            <span className="block font-normal">{HERO_COPY.titleDrawn}</span>{" "}
            <span className="block font-semibold">{HERO_COPY.titleBuilt}</span>
          </h1>
          <div className="mt-8 flex flex-col gap-8 lg:mt-10 lg:flex-row lg:items-end lg:gap-10">
            <p
              className="intro-rise max-w-[24rem] text-lede text-pretty text-ink-soft"
              style={rise(160)}
            >
              {HERO_COPY.lede}
            </p>
            <div
              className="intro-rise flex shrink-0 flex-col gap-3 sm:flex-row"
              style={rise(220)}
            >
              <ButtonLink
                href={HERO_COPY.primary.href}
                size="lg"
                arrow="right"
                className="w-full sm:w-auto"
              >
                {HERO_COPY.primary.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
