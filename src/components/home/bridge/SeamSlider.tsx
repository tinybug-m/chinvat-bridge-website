"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/*
 * The seam control: components/ui/slider restyled as a handle on the stage's
 * bottom edge. Local because the shared Slider does not pass props to its
 * thumb (aria-valuetext, aria-labelledby).
 *
 * The root overhangs the stage by half the thumb (14px) on each side, which
 * cancels Radix's in-bounds offset: the thumb's centre sits exactly at the
 * value's share of the stage width, under the seam line. `inverted`: the
 * value is the share built, measured from the right, so dragging left builds.
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
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={1}
      inverted
      onValueChange={([next]) => onValueChange(next)}
      className={cn(
        "absolute -inset-x-3.5 bottom-0 flex h-11 translate-y-1/2 cursor-pointer touch-none items-center select-none",
        className,
      )}
    >
      <SliderPrimitive.Track className="relative mx-3.5 h-px grow bg-transparent">
        <SliderPrimitive.Range className="absolute h-[2px] -translate-y-px bg-ink" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-labelledby={labelledBy}
        aria-valuetext={valueText}
        className={cn(
          "relative grid size-7 cursor-grab place-items-center rounded-full border-[1.5px] border-ink bg-paper-raised text-ink",
          "transition-[background-color,scale] duration-200 ease-out-quart before:absolute before:-inset-2 before:content-['']",
          "hover:bg-haze active:cursor-grabbing active:scale-95",
        )}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-3.5">
          <path d="M6 4 2 8l4 4M10 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
}
