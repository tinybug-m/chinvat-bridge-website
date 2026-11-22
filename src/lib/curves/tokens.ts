/*
 * Geometry tokens of the curve system (geometry.ts). Motion is not here: what
 * draws or animates a path reads only its pieces and lengths.
 *
 * The wire's turn radius follows the page margin (--spacing-gutter in
 * tokens.css, clamp(20px, 5.714vw - 2.288px, 80px)). The approved scale is
 * 8 / 16 / 24 / 32 px at the 390 / 768 / 1024 / 1440 reference widths; in
 * between, the radius is interpolated linearly on the margin, so it changes
 * continuously as the window is resized and never jumps at a breakpoint.
 */

/** The page margin (px) at a viewport width: --spacing-gutter. */
export const gutterAt = (viewport: number) => Math.min(80, Math.max(20, -2.288 + 0.05714 * viewport));

/** [margin, radius] anchors: the approved radius at each reference width's margin. */
const WIRE_RADIUS: [number, number][] = [
  [gutterAt(390), 8],
  [gutterAt(768), 16],
  [gutterAt(1024), 24],
  [gutterAt(1440), 32],
];

/** The wire's turn radius (px) for a page margin (px): continuous, clamped to 8 - 32. */
export function wireRadius(margin: number) {
  const [first] = WIRE_RADIUS;
  if (margin <= first[0]) return first[1];
  for (let i = 1; i < WIRE_RADIUS.length; i++) {
    const [m1, r1] = WIRE_RADIUS[i];
    if (margin <= m1) {
      const [m0, r0] = WIRE_RADIUS[i - 1];
      return r0 + ((r1 - r0) * (margin - m0)) / (m1 - m0);
    }
  }
  return WIRE_RADIUS[WIRE_RADIUS.length - 1][1];
}

export const CURVE = {
  /** Straight after leaving a port and before reaching one, as a share of the radius. */
  lead: 0.5,
  /** Straight between two turns of the same hand, as a share of the radius (0 between opposite turns). */
  gap: 0.5,
  /** Headings a run may take, in degrees from vertical; a lane change may go shallower than 45 for a small offset, never steeper. */
  headings: [0, 45, 90],
} as const;
