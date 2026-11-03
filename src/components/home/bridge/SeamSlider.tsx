"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import { type CSSProperties, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import "./bridge.css";

/*
 * The seam control: a Radix slider restyled as a handle riding the
 * seam line, halfway up the stage. Local so the thumb can take
 * props (aria-valuetext, aria-labelledby).
 *
 * Radix gets the rounded value (aria-valuenow stays an integer) and would
 * place the thumb on whole steps; the thumb wrapper is pinned to --seam
 * instead, the fractional position the seam line itself uses, so handle and
 * line stay together; the handle alone is kept its own radius inside the stage,
 * so at 0 and 100 it does not hang past the screen edge and add a sideways scroll. The root spans the stage exactly, so a pointer at x
 * still maps to a seam at x. Only the thumb takes pointers: the strip across
 * the image neither jumps the seam on a stray tap nor blocks page scrolling.
 * `inverted`: the value is the share built, measured from the right, so
 * dragging left builds.
 */

interface SeamSliderProps {
  value: number;
  min: number;
  max: number;
  valueText: string;
  labelledBy: string;
  onValueChange: (value: number) => void;
  className?: string;
}

export function SeamSlider({ value, min, max, valueText, labelledBy, onValueChange, className }: SeamSliderProps) {
  const thumb = useRef<HTMLSpanElement>(null);

  // The chevrons part once (bridge.css) the first time the handle is mostly on screen.
  useEffect(() => {
    const el = thumb.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.hint = "";
        observer.disconnect();
      },
      { threshold: 0.9 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={1}
      inverted
      onValueChange={([next]) => onValueChange(next)}
      className={cn(
        "pointer-events-none absolute inset-x-0 top-1/2 flex h-11 -translate-y-1/2 items-center select-none",
        "[&>span:has([role=slider])]:right-auto! [&>span:has([role=slider])]:left-[clamp(1.25rem,var(--seam),calc(100%_-_1.25rem))]!",
        className,
      )}
    >
      <SliderPrimitive.Track className="relative h-px grow" />
      <SliderPrimitive.Thumb
        ref={thumb}
        aria-labelledby={labelledBy}
        aria-valuetext={valueText}
        className={cn(
          "pointer-events-auto relative grid size-10 cursor-grab touch-pan-y place-items-center rounded-full border-[1.5px] border-ink bg-paper-raised text-ink",
          "transition-[background-color,scale] duration-200 ease-out-quart before:absolute before:-inset-2 before:content-['']",
          "hover:bg-haze active:cursor-grabbing active:scale-95",
        )}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          <path className="seam-chevron" style={{ "--part": -1 } as CSSProperties} d="M6 4 2 8l4 4" />
          <path className="seam-chevron" style={{ "--part": 1 } as CSSProperties} d="M10 4l4 4-4 4" />
        </svg>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
}
