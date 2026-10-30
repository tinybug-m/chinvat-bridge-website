import type { CSSProperties } from "react";

interface DrawOptions {
  /** Index for the shared stagger (--i). */
  i?: number;
  /** Delay in ms, replacing the phase + stagger delay (--draw-delay). */
  delay?: number;
  /** Duration in ms, replacing --motion-draw (--draw-duration). */
  duration?: number;
}

/**
 * Props that make a solid <path>/<line> draw on once its [data-reveal]
 * ancestor is revealed (see the .draw helper in styles/motion.css). Spread
 * them on the element. `strokeWidth` is the authored stroke in px; inside a
 * Services figure the CSS needs it as a number to keep the stroke width exact.
 */
export function drawProps(strokeWidth = 1.5, { i, delay, duration }: DrawOptions = {}) {
  const style: Record<string, string | number> = { "--sw": strokeWidth };
  if (i !== undefined) style["--i"] = i;
  if (delay !== undefined) style["--draw-delay"] = `${delay}ms`;
  if (duration !== undefined) style["--draw-duration"] = `${duration}ms`;
  return { className: "draw", pathLength: 1, strokeWidth, style: style as CSSProperties };
}
