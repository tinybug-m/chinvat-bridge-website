"use client";

import Image from "next/image";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Annotation } from "@/components/system/Annotation";
import { Seam } from "@/components/system/Seam";
import { ThreeStage } from "@/components/three/core/ThreeStage";
import type { StageHandle } from "@/components/three/core/types";
import { BRIDGE_POSTERS, BRIDGE_SEAM } from "@/components/three/scenes/bridge/config";
import { CURRENT_STATE_ITEMS, FUTURE_STATE_ITEMS } from "@/data/transition";
import { cn } from "@/lib/utils";
import { BridgeRows } from "./BridgeRows";
import { SeamSlider } from "./SeamSlider";

/*
 * The seam, its stage and the rows that follow it. The value is the share
 * modernised (0..100); the seam sits at (100 - value)% of the stage width,
 * drawn maquette on its left, built lattice on its right.
 *
 * Who drives it:
 *   scroll   10 -> 90 while the stage's centre crosses the viewport (GSAP
 *            ScrollTrigger, scrubbed, no pin; motion allowed only)
 *   the user once they drag, click or key the slider; scroll lets go for good
 *
 * Without WebGL, under reduced motion or before the canvas is live, two
 * posters (all drawn, all built) are split at the seam with a clip-path, so
 * the control still shows what it does.
 */

const loadBridgeScene = () => import("@/components/three/scenes/bridge");

const ROW_COUNT = CURRENT_STATE_ITEMS.length;

/** Row i flips once the seam has passed (i + 0.5) / 5. */
export function modernisedCount(value: number) {
  let count = 0;
  for (let i = 0; i < ROW_COUNT; i++) if (value / 100 + 1e-6 >= (i + 0.5) / ROW_COUNT) count++;
  return count;
}

const posterLayer = cn(
  "absolute inset-0 transition-opacity delay-300 duration-[400ms] ease-out-quart",
  "group-data-[stage-state=live]/stage:opacity-0",
);

const POSTER_SIZES = "(min-width: 90rem) 86rem, 100vw";

function Corner({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute size-4", className)}>
      <span className="absolute top-1/2 left-0 h-px w-4 bg-control" />
      <span className="absolute top-0 left-1/2 h-4 w-px bg-control" />
    </span>
  );
}

export function BridgeSeam({ className }: { className?: string }) {
  const [value, setValue] = useState<number>(BRIDGE_SEAM.initial);
  const handle = useRef<StageHandle>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const userTookOver = useRef(false);
  const releaseScroll = useRef<(() => void) | null>(null);

  const drive = useCallback((next: number) => {
    setValue(Math.round(next * 10) / 10);
    handle.current?.set("built", next / 100);
  }, []);

  useEffect(() => {
    handle.current?.set("built", BRIDGE_SEAM.initial / 100);
  }, []);

  // Scroll scrub, loaded after hydration so GSAP stays out of the first bundle.
  useEffect(() => {
    const trigger = frameRef.current;
    if (!trigger) return;
    let cancelled = false;
    let revert: (() => void) | null = null;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || userTookOver.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const proxy = { value: BRIDGE_SEAM.scrubFrom };
        const tween = gsap.to(proxy, {
          value: BRIDGE_SEAM.scrubTo,
          ease: "none",
          scrollTrigger: { trigger, start: "center bottom", end: "center top", scrub: 0.6 },
          onUpdate: () => {
            if (!userTookOver.current) drive(proxy.value);
          },
        });
        const progress = tween.scrollTrigger?.progress ?? 0;
        drive(BRIDGE_SEAM.scrubFrom + (BRIDGE_SEAM.scrubTo - BRIDGE_SEAM.scrubFrom) * progress);
      });
      revert = () => mm.revert();
      releaseScroll.current = () => {
        revert?.();
        revert = null;
      };
    });

    return () => {
      cancelled = true;
      revert?.();
      releaseScroll.current = null;
    };
  }, [drive]);

  const onUserChange = useCallback(
    (next: number) => {
      if (!userTookOver.current) {
        userTookOver.current = true;
        releaseScroll.current?.();
      }
      drive(next);
    },
    [drive],
  );

  const count = modernisedCount(value);
  const rounded = Math.round(value);
  const valueText = `Seam at ${rounded}%: ${count} of ${ROW_COUNT} modernised`;
  const seamStyle = { "--seam": `${100 - value}%` } as CSSProperties;

  return (
    <div className={className} style={seamStyle}>
      <figure className="m-0">
        <div aria-hidden="true" className="mb-4 flex justify-between gap-4">
          <Annotation>Current state</Annotation>
          <Annotation className="text-right">Future direction</Annotation>
        </div>
        <div ref={frameRef} className="relative border border-line" data-seam-value={rounded}>
          <ThreeStage
            id="bridge"
            load={loadBridgeScene}
            handleRef={handle}
            className="aspect-[4/3] max-h-[560px] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]"
            mountMargin="25% 0px"
            releaseMargin="200% 0px"
            reducedMotion="fallback"
          >
            <div data-layer="poster" className={posterLayer}>
              <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--seam))_0_0)]">
                <Image src={BRIDGE_POSTERS.drawn} alt="" fill sizes={POSTER_SIZES} className="object-cover" />
              </div>
              <div className="absolute inset-0 [clip-path:inset(0_0_0_var(--seam))]">
                <Image src={BRIDGE_POSTERS.built} alt="" fill sizes={POSTER_SIZES} className="object-cover" />
              </div>
            </div>
          </ThreeStage>

          <Corner className="-top-2 -left-2" />
          <Corner className="-top-2 -right-2" />
          <Corner className="-bottom-2 -left-2" />
          <Corner className="-right-2 -bottom-2" />

          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-(--seam)">
            <Seam node={0} className="h-full -translate-x-1/2 bg-ink" />
          </div>

          <SeamSlider
            value={value}
            min={BRIDGE_SEAM.min}
            max={BRIDGE_SEAM.max}
            valueText={valueText}
            labelledBy="approach-seam-label"
            onValueChange={onUserChange}
          />
        </div>

        <figcaption className="mt-9 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-label text-label uppercase">
          <span id="approach-seam-label" className="text-ink">
            Move the seam
          </span>
          <span className="text-ink-muted" data-testid="approach-readout">
            <span className="text-ink tabular-nums">{count}</span> of {ROW_COUNT} modernised
          </span>
        </figcaption>
      </figure>

      <BridgeRows current={CURRENT_STATE_ITEMS} next={FUTURE_STATE_ITEMS} count={count} className="mt-14 md:mt-20" />
    </div>
  );
}
