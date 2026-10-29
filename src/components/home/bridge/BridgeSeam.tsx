"use client";

import Image from "next/image";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/system/Container";
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
 * loose stone slabs on its left, one level deck on its right.
 *
 * Only the visitor moves it, by dragging or keying the slider; scrolling
 * the page never does.
 *
 * The fractional value lives in a ref and goes straight to --seam (the line,
 * the handle, the poster split) and the scene; React only hears about whole
 * steps, which is all the slider, the readout and the rows need.
 *
 * Without WebGL, under reduced motion or before the canvas is live, two
 * posters (all drawn, all built) are split at the seam with a clip-path, so
 * the control still shows what it does. They are cover-fitted, and the scene
 * crops its view the same way, so poster and canvas show the same picture.
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

const seamOffset = (value: number) => `${100 - value}%`;

/** Server render; constant, so React never rewrites what drive() sets. */
const INITIAL_STYLE = { "--seam": seamOffset(BRIDGE_SEAM.initial) } as CSSProperties;

export function BridgeSeam({ className }: { className?: string }) {
  const [value, setValue] = useState<number>(BRIDGE_SEAM.initial);
  const handle = useRef<StageHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fraction = useRef<number>(BRIDGE_SEAM.initial);
  const shown = useRef<number>(BRIDGE_SEAM.initial);

  const drive = useCallback((next: number) => {
    if (next === fraction.current) return;
    fraction.current = next;
    rootRef.current?.style.setProperty("--seam", seamOffset(next));
    handle.current?.set("built", next / 100);
    // Whole steps only: the slider, the readout and the rows follow the rounded value.
    const rounded = Math.round(next);
    if (rounded === shown.current) return;
    shown.current = rounded;
    setValue(rounded);
  }, []);

  useEffect(() => {
    handle.current?.set("built", BRIDGE_SEAM.initial / 100);
  }, []);

  const count = modernisedCount(value);
  const valueText = `${value}% modernised: ${count} of ${ROW_COUNT}`;

  return (
    <div ref={rootRef} className={className} style={INITIAL_STYLE}>
      <figure className="m-0">
        <div aria-hidden="true" className="mb-4">
          <Container className="flex justify-between gap-4 text-small text-ink-muted">
            <span>Current state</span>
            <span className="text-right">Future direction</span>
          </Container>
        </div>
        <div className="relative" data-seam-value={value}>
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

          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-(--seam)">
            <Seam node={0} className="h-full -translate-x-1/2 bg-ink" />
          </div>

          <SeamSlider
            value={value}
            min={BRIDGE_SEAM.min}
            max={BRIDGE_SEAM.max}
            valueText={valueText}
            labelledBy="approach-seam-label"
            onValueChange={drive}
          />
        </div>

        <Container as="figcaption" className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-small">
          <span id="approach-seam-label" className="font-medium text-ink">
            Move the seam
          </span>
          <span className="text-ink-muted" data-testid="approach-readout">
            {count === 0 ? "Everything as it is today" : count === ROW_COUNT ? "Everything improved" : "Partly improved"}
          </span>
        </Container>
      </figure>

      <Container>
        <p className="mt-6 max-w-measure text-pretty text-small text-ink-muted">
          A later Pahlavi tradition describes the bridge as narrow as a razor or nine lances wide, depending on who
          crosses. We borrow only the picture: friction narrows the way, better systems widen it.
          <span className="mt-1.5 block font-label text-label uppercase">
            Later tradition: Dadestan i Denig 21.5; Denkard 809
          </span>
        </p>
        <BridgeRows current={CURRENT_STATE_ITEMS} next={FUTURE_STATE_ITEMS} count={count} className="mt-14 md:mt-20" />
      </Container>
    </div>
  );
}
