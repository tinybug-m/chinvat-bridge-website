/*
 * Frame-rate independent damping and the motion tokens from tokens.css as JS
 * easing functions, so shader uniforms move with the same curves as the DOM.
 */

/** Moves `current` toward `target`; `lambda` is the rate in 1/s (higher is snappier). */
export function damp(current: number, target: number, lambda: number, deltaMs: number) {
  return current + (target - current) * (1 - Math.exp((-lambda * deltaMs) / 1000));
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/** CSS cubic-bezier() as a function of progress 0..1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < 1e-5) break;
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    // Bisection fallback for flat regions.
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20 && Math.abs(sampleX(t) - x) > 1e-5; i++) {
      if (sampleX(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sampleY(t);
  };
}

/** Same curves as --ease-* in tokens.css. */
export const EASE = {
  outExpo: cubicBezier(0.16, 1, 0.3, 1),
  outQuart: cubicBezier(0.25, 1, 0.5, 1),
  inOutQuint: cubicBezier(0.83, 0, 0.17, 1),
  drawn: cubicBezier(0.45, 0, 0.2, 1),
} as const;
