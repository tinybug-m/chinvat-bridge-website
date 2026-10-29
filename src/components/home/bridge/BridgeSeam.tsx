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
 * Scrolling moves it: as the stage rises through the viewport the seam
 * sweeps from today (0) to the future (100), and back as the page scrolls
 * up. The slider is a manual override: while the visitor has just dragged
 * or keyed it, scrolling leaves it alone until the page has moved on by
 * a good stretch. Reduced motion and no JS never scroll-drive it.
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

/*
 * The stage runs edge to edge, so the poster is always as wide as the viewport. A narrower "sizes"
 * (it used to say 86rem from 90rem up) makes the browser lay out object-cover against a smaller
 * intrinsic size than the box it fills, and the poster then shows larger and lower than the canvas.
 */
const POSTER_SIZES = "100vw";

/**
 * Scroll sweep: the value is 0 while the stage's centre is at or below SWEEP_FROM of the viewport
 * height and 100 once it has risen to SWEEP_TO (a little over half a screen of scrolling).
 */
const SWEEP_FROM = 0.9;
const SWEEP_TO = 0.22;
/** After a manual change, scrolling is ignored until the page has moved this far (px). */
const MANUAL_HOLD = 160;
/** Time constant (ms) of the ease that carries the seam to its scroll position, so wheel notches glide. */
const FOLLOW_MS = 110;

const seamOffset = (value: number) => `${100 - value}%`;

/** Share modernised (0..100) for a stage whose centre sits at `centre` of the viewport height. */
function sweepValue(centre: number) {
  const sweep = (SWEEP_FROM - centre) / (SWEEP_FROM - SWEEP_TO);
  return Math.min(1, Math.max(0, sweep)) * 100;
}

/*
 * Runs while the HTML is parsed, right after the stage: puts the seam where the scroll already is
 * before the first paint. Without it the server's 50 shows until hydration (a reload part-way down
 * the page, or a jump to #approach), and the poster visibly jumps from a half split to the real one
 * once React takes over. Reduced motion and no JS keep the server value.
 */
const FIRST_SEAM = `(function(s){try{
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var f=s.previousElementSibling,r=f.getBoundingClientRect(),c=(r.top+r.height/2)/innerHeight,
v=Math.round(Math.min(1,Math.max(0,(${SWEEP_FROM}-c)/(${SWEEP_FROM}-${SWEEP_TO})))*100);
s.parentElement.parentElement.style.setProperty("--seam",(100-v)+"%");}catch(e){}})(document.currentScript)`;

/** Server render; constant, so React never rewrites what drive() sets. */
const INITIAL_STYLE = { "--seam": seamOffset(BRIDGE_SEAM.initial) } as CSSProperties;

export function BridgeSeam({ className }: { className?: string }) {
  const [value, setValue] = useState<number>(BRIDGE_SEAM.initial);
  const handle = useRef<StageHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const manualAt = useRef<number | null>(null);
  const fraction = useRef<number>(BRIDGE_SEAM.initial);
  const shown = useRef<number>(BRIDGE_SEAM.initial);
  const target = useRef<number>(BRIDGE_SEAM.initial);

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

  const slide = useCallback(
    (next: number) => {
      manualAt.current = window.scrollY;
      target.current = next;
      drive(next);
    },
    [drive],
  );

  useEffect(() => {
    handle.current?.set("built", BRIDGE_SEAM.initial / 100);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frame = frameRef.current;
    if (!frame) return;

    let queued = 0;
    let easing = 0;
    let last = 0;
    // Eases the fractional value toward the scroll position, so the line, the posters and the
    // scene all move smoothly together instead of in whole-percent jumps.
    const ease = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const gap = target.current - fraction.current;
      const next = Math.abs(gap) < 0.05 ? target.current : fraction.current + gap * (1 - Math.exp(-dt / FOLLOW_MS));
      drive(next);
      easing = next === target.current ? 0 : requestAnimationFrame(ease);
    };
    const follow = (jump = false) => {
      queued = 0;
      if (manualAt.current !== null) {
        if (Math.abs(window.scrollY - manualAt.current) < MANUAL_HOLD) return;
        manualAt.current = null;
      }
      const rect = frame.getBoundingClientRect();
      target.current = sweepValue((rect.top + rect.height / 2) / window.innerHeight);
      if (jump) drive(target.current);
      else if (!easing) {
        last = performance.now();
        easing = requestAnimationFrame(ease);
      }
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(() => follow());
    };
    follow(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(queued);
      cancelAnimationFrame(easing);
    };
  }, [drive]);

  const count = modernisedCount(value);
  const valueText = `${value}% modernised: ${count} of ${ROW_COUNT}`;

  return (
    <div ref={rootRef} className={className} style={INITIAL_STYLE} suppressHydrationWarning>
      <figure className="m-0">
        <div aria-hidden="true" className="mb-4">
          <Container className="flex justify-between gap-4 text-small text-ink-muted">
            <span>Current state</span>
            <span className="text-right">Future direction</span>
          </Container>
        </div>
        <div ref={frameRef} className="relative overflow-x-clip" data-seam-value={value}>
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
            onValueChange={slide}
          />
        </div>
        <script dangerouslySetInnerHTML={{ __html: FIRST_SEAM }} />

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
