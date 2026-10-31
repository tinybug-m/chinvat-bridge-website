"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * The row under a stage: the today-to-future slider (Radix directly, like
 * SeamSlider, so the thumb carries its own label and valuetext) and the
 * view buttons. Purely controlled.
 */

interface ViewControlsProps {
  /** Labels for the two ends of the slider. */
  states: [string, string];
  built: number;
  onBuiltChange: (built: number) => void;
  /** Absent for flat illustrations, which do not turn or zoom. */
  onReset?: () => void;
  onZoom?: (factor: number) => void;
  /** Present when the stage can go full screen. */
  onFullscreen?: () => void;
  /** Names what the slider moves, for screen readers. */
  label: string;
  className?: string;
}

export function ViewControls({ states, built, onBuiltChange, onReset, onZoom, onFullscreen, label, className }: ViewControlsProps) {
  const value = Math.round(built * 100);
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-4 text-small text-ink-muted sm:max-w-md">
        <button type="button" onClick={() => onBuiltChange(0)} className="shrink-0 py-2 hover:text-ink">
          {states[0]}
        </button>
        <SliderPrimitive.Root
          value={[value]}
          min={0}
          max={100}
          step={1}
          onValueChange={([next]) => onBuiltChange(next / 100)}
          className="relative flex min-h-11 grow touch-none items-center select-none"
        >
          <SliderPrimitive.Track className="relative h-px grow bg-line-strong">
            <SliderPrimitive.Range className="absolute h-full bg-ink" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-label={label}
            aria-valuetext={`${value}% built: ${value < 50 ? states[0] : states[1]}`}
            className="relative block size-5 rounded-full border-2 border-ink bg-paper transition-[background-color] duration-200 before:absolute before:-inset-3 before:content-[''] hover:bg-haze focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt-700"
          />
        </SliderPrimitive.Root>
        <button type="button" onClick={() => onBuiltChange(1)} className="shrink-0 py-2 hover:text-ink">
          {states[1]}
        </button>
      </div>
      <div className="flex items-center gap-1 self-end sm:self-auto">
        {onZoom ? (
          <>
            <IconButton label="Zoom out" onClick={() => onZoom(1.15)}>
              <path d="M3 8h10" />
            </IconButton>
            <IconButton label="Zoom in" onClick={() => onZoom(1 / 1.15)}>
              <path d="M3 8h10M8 3v10" />
            </IconButton>
          </>
        ) : null}
        {onReset ? (
          <IconButton label="Reset view" onClick={onReset}>
            <path d="M3.5 6.5A5 5 0 1 1 3 9" />
            <path d="M3 3v3.5h3.5" />
          </IconButton>
        ) : null}
        {onFullscreen ? (
          <IconButton label="Full screen" onClick={onFullscreen}>
            <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-[2px] text-ink transition-[background-color,box-shadow] duration-200 ease-out-quart hover:bg-haze hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)] focus-visible:outline-2 focus-visible:outline-cobalt-700"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
        {children}
      </svg>
    </button>
  );
}
