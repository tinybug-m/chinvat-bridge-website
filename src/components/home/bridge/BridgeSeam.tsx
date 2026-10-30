"use client";

import Image from "next/image";
import { type CSSProperties, memo, useCallback, useEffect, useRef, useState } from "react";
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
 * up. The slider is a manual override: the value the visitor sets fades back
 * into the scroll position over the next stretch of scrolling (never a snap),
 * and a keyboard user on the handle is left alone. The rows under the stage
 * flip as they come into view, not while still off screen. Reduced motion and
 * no JS never scroll-drive it.
 *
 * The fractional value lives in a ref and goes straight to --seam (the line,
 * the handle, the poster split; set on the frame only) and the scene; React
 * only hears about whole steps, which is all the slider, the readout and the
 * rows need. There is exactly one ease: scroll and the slider both set a
 * target and one rAF loop carries the value to it (quicker while the visitor
 * is dragging, so the handle stays under the pointer). The scene takes that
 * eased value as is and does not smooth it again.
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
 * height and 100 once it has risen to SWEEP_TO, so the finished bridge is seen with the stage
 * whole and mid-screen. The sweep is never shorter than SWEEP_MIN_PX (landscape phones).
 */
const SWEEP_FROM = 1;
const SWEEP_TO = 0.45;
const SWEEP_MIN_PX = 420;
/** A value the visitor set fades back into the scroll position over this much scrolling (px). */
const HOLD_FADE = 320;
/** A row flips once its top is above this share of the viewport height. */
const ROW_GATE = 0.8;
/** Time constant (ms) of the ease that carries the seam to its scroll position, so wheel notches glide. */
const FOLLOW_MS = 110;
/** The same ease, tighter, while the slider is in use: the handle must stay close to the pointer. */
const DRAG_FOLLOW_MS = 45;

const seamOffset = (value: number) => `${100 - value}%`;

/** Share modernised (0..100) for a stage whose centre is `centre` px from the top of a `vh` px tall viewport. */
function sweepValue(centre: number, vh: number) {
  const span = Math.max((SWEEP_FROM - SWEEP_TO) * vh, SWEEP_MIN_PX);
  return Math.min(1, Math.max(0, (SWEEP_FROM * vh - centre) / span)) * 100;
}

/*
 * Runs while the HTML is parsed, right after the stage: puts the seam where the scroll already is
 * before the first paint. Without it the server's 50 shows until hydration (a reload part-way down
 * the page, or a jump to #approach), and the poster visibly jumps from a half split to the real one
 * once React takes over. Reduced motion and no JS keep the server value.
 */
const FIRST_SEAM = `(function(s){try{
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var f=s.previousElementSibling,r=f.getBoundingClientRect(),h=innerHeight,
n=Math.max((${SWEEP_FROM}-${SWEEP_TO})*h,${SWEEP_MIN_PX}),
v=Math.round(Math.min(1,Math.max(0,(${SWEEP_FROM}*h-(r.top+r.height/2))/n))*100);
f.style.setProperty("--seam",(100-v)+"%");}catch(e){}})(document.currentScript)`;

/** The two posters, split at --seam. Static, so scroll-driven re-renders skip it. */
const Posters = memo(function Posters() {
  return (
    <div data-layer="poster" className={posterLayer}>
      <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--seam))_0_0)]">
        <Image src={BRIDGE_POSTERS.drawn} alt="" fill sizes={POSTER_SIZES} className="object-cover" />
      </div>
      <div className="absolute inset-0 [clip-path:inset(0_0_0_var(--seam))]">
        <Image src={BRIDGE_POSTERS.built} alt="" fill sizes={POSTER_SIZES} className="object-cover" />
      </div>
    </div>
  );
});

/** Server render; constant, so React never rewrites what drive() sets. */
const INITIAL_STYLE = { "--seam": seamOffset(BRIDGE_SEAM.initial) } as CSSProperties;

export function BridgeSeam({ className }: { className?: string }) {
  const [value, setValue] = useState<number>(BRIDGE_SEAM.initial);
  const [rows, setRows] = useState(() => modernisedCount(BRIDGE_SEAM.initial));
  const handle = useRef<StageHandle>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fraction = useRef<number>(BRIDGE_SEAM.initial);
  const shown = useRef<number>(BRIDGE_SEAM.initial);
  const shownRows = useRef(rows);
  const target = useRef<number>(BRIDGE_SEAM.initial);
  /** The visitor's last value, as its distance from the scroll position at the time, and where the page was. */
  const manual = useRef<{ at: number; offset: number } | null>(null);
  /** How many rows have come into view; all of them until the scroll handler says otherwise. */
  const gate = useRef(ROW_COUNT);
  const sweepAt = useRef(() => BRIDGE_SEAM.initial as number);
  /** Starts the ease toward target (set while the effect is live); null under reduced motion, where values apply at once. */
  const startEase = useRef<((tau: number) => void) | null>(null);
  /** True while the slider's own value, not the eased one, is what the slider and the rows show. */
  const owned = useRef(false);

  // Rows follow the value, but (under scroll) only once they are in view; a visitor's own value flips them at once.
  const syncRows = useCallback(() => {
    const next = manual.current ? modernisedCount(shown.current) : Math.min(modernisedCount(shown.current), gate.current);
    if (next === shownRows.current) return;
    shownRows.current = next;
    setRows(next);
  }, []);

  const drive = useCallback(
    (next: number) => {
      if (next === fraction.current) return;
      fraction.current = next;
      frameRef.current?.style.setProperty("--seam", seamOffset(next));
      handle.current?.set("built", next / 100);
      // The slider's value was set when it moved; the eased fraction only catches up with it.
      if (owned.current) return;
      // Whole steps only: the slider, the readout and the rows follow the rounded value.
      const rounded = Math.round(next);
      if (rounded === shown.current) return;
      shown.current = rounded;
      setValue(rounded);
      syncRows();
    },
    [syncRows],
  );

  const slide = useCallback(
    (next: number) => {
      manual.current = { at: window.scrollY, offset: next - sweepAt.current() };
      target.current = next;
      // The slider and the rows take the visitor's value at once (a held key steps from it, not from the eased one).
      owned.current = true;
      shown.current = next;
      setValue(next);
      syncRows();
      if (startEase.current) startEase.current(DRAG_FOLLOW_MS);
      else drive(next);
    },
    [drive, syncRows],
  );

  useEffect(() => {
    handle.current?.set("built", BRIDGE_SEAM.initial / 100);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    const frame = frameRef.current;
    if (!root || !frame) return;
    const thumb = frame.querySelector<HTMLElement>("[role=slider]");
    const items = root.querySelectorAll("ol > li");

    // The height is kept until the width changes: a phone's address bar growing or shrinking
    // resizes the window height and would otherwise move the seam with no scrolling.
    let vh = window.innerHeight;
    let width = window.innerWidth;
    sweepAt.current = () => {
      const rect = frame.getBoundingClientRect();
      return sweepValue(rect.top + rect.height / 2, vh);
    };

    let queued = 0;
    let easing = 0;
    let last = 0;
    let tau = FOLLOW_MS;
    // Eases the fractional value toward the scroll position, so the line, the posters and the
    // scene all move smoothly together instead of in whole-percent jumps.
    const ease = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const gap = target.current - fraction.current;
      const next = Math.abs(gap) < 0.05 ? target.current : fraction.current + gap * (1 - Math.exp(-dt / tau));
      drive(next);
      easing = next === target.current ? 0 : requestAnimationFrame(ease);
    };
    const begin = (time: number) => {
      tau = time;
      if (easing) return;
      last = performance.now();
      easing = requestAnimationFrame(ease);
    };
    startEase.current = begin;
    const follow = (jump = false) => {
      queued = 0;
      gate.current = Array.from(items).filter((item) => item.getBoundingClientRect().top < vh * ROW_GATE).length;
      // Someone using the keyboard on the handle owns the value (focusing it can scroll the page a long way).
      if (thumb?.matches(":focus-visible")) return syncRows();
      let next = sweepAt.current();
      const held = manual.current;
      if (held) {
        const fade = 1 - Math.abs(window.scrollY - held.at) / HOLD_FADE;
        if (fade <= 0) manual.current = null;
        else next = Math.min(100, Math.max(0, next + held.offset * fade));
      }
      target.current = next;
      owned.current = false;
      syncRows();
      if (jump) drive(next);
      else begin(FOLLOW_MS);
    };
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(() => follow());
    };
    // Only a width change (a real re-layout) re-targets; a height-only resize is the phone's address bar.
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      vh = window.innerHeight;
      onScroll();
    };

    // Only listen while the stage or its rows are near the screen; the last call on the way out settles the end value.
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      const method = on ? "addEventListener" : "removeEventListener";
      window[method]("scroll", onScroll, { passive: true });
      window[method]("resize", onResize);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        listen(entry.isIntersecting);
        follow(true);
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(root);
    follow(true);
    return () => {
      observer.disconnect();
      listen(false);
      cancelAnimationFrame(queued);
      cancelAnimationFrame(easing);
      startEase.current = null;
    };
  }, [drive, syncRows]);

  const count = modernisedCount(value);
  const valueText = `${value}% modernised: ${count} of ${ROW_COUNT}`;

  return (
    <div ref={rootRef} className={className}>
      <figure className="m-0">
        <div aria-hidden="true" className="mb-4">
          <Container className="flex justify-between gap-4 text-small text-ink-muted">
            <span>Current state</span>
            <span className="text-right">Future direction</span>
          </Container>
        </div>
        <div ref={frameRef} className="relative overflow-x-clip" data-seam-value={value} style={INITIAL_STYLE} suppressHydrationWarning>
          <ThreeStage
            id="bridge"
            load={loadBridgeScene}
            handleRef={handle}
            className="aspect-[4/3] max-h-[560px] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]"
            mountMargin="25% 0px"
            releaseMargin="200% 0px"
            reducedMotion="fallback"
          >
            <Posters />
          </ThreeStage>

          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[clamp(0.5px,var(--seam),calc(100%_-_0.5px))]">
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
        <BridgeRows current={CURRENT_STATE_ITEMS} next={FUTURE_STATE_ITEMS} count={rows} className="mt-14 md:mt-20" />
      </Container>
    </div>
  );
}
