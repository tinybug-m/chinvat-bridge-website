/*
 * Shared numbers for the illustrated Nine Spears studies: the same order of
 * widening as the 3D one (centre spear first, then each pair outward), a
 * seeded random so every render draws the same stars and rocks, and small
 * path helpers. No React, no three.
 */

export const SPEARS = 9;

/** 0..1 smoothstep. */
export function smooth(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Each spear's rank (-4..4) and progress for the share built: the bridge widens from its centre line. */
export function widening(built: number, spread = 1.2) {
  return Array.from({ length: SPEARS }, (_, index) => {
    const rank = index - (SPEARS - 1) / 2;
    const order = Math.abs(rank) / ((SPEARS - 1) / 2);
    return { rank, p: smooth(built * (1 + spread) - order * spread) };
  });
}

/** Seeded PRNG (mulberry32): the same picture on the server and the client. */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Point = [number, number];

/** Point on a quadratic Bézier. */
export function quad(a: Point, c: Point, b: Point, t: number): Point {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
}

/** Rounded to 0.1 so server and client print identical path data. */
export const r = (n: number) => Math.round(n * 10) / 10;

/** A polyline as path data. */
export function polyline(points: Point[], close = false) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${r(x)} ${r(y)}`).join("") + (close ? "Z" : "");
}

/** The knife section of a spear (flat top and bottom, knife edges), unit size, as (across, up). */
export const KNIFE: Point[] = [
  [0.5, 0.1],
  [0.42, 0.5],
  [-0.42, 0.5],
  [-0.5, 0.1],
  [-0.4, -0.5],
  [0.4, -0.5],
];
