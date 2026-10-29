import { MARK_AXIS_X, MARK_BOUNDS } from "@/components/brand/mark-geometry";
import { MARK_POLYGONS } from "@/components/brand/mark-polygons";

/*
 * The welded brand mark as clean 2D rings, shared by the 3D extrusion, the
 * baked shadow and the SVG line drawing. Pure data: no three.js here, so
 * server components can import it.
 */

export type Point = readonly [number, number];
export type Ring = readonly Point[];

/** The mark is built 10 world units tall; this converts source pixels to units. */
export const MARK_HEIGHT_UNITS = 10;
export const UNITS_PER_PX = MARK_HEIGHT_UNITS / (MARK_BOUNDS.maxY - MARK_BOUNDS.minY);

/** Centre of the mark in source pixels. x is the mirror axis, the seam. */
export const MARK_CENTRE_PX = {
  x: MARK_AXIS_X,
  y: (MARK_BOUNDS.minY + MARK_BOUNDS.maxY) / 2,
} as const;

/** Mark width in world units (it is slightly wider than tall). */
export const MARK_WIDTH_UNITS = (MARK_BOUNDS.maxX - MARK_BOUNDS.minX) * UNITS_PER_PX;

/**
 * Drops the slivers the boolean weld leaves behind: points closer than
 * `minEdge` px to the previous one, and points where the outline doubles
 * back on itself. Bevels turn both into spikes.
 */
function cleanRing(ring: Ring, minEdge = 0.75): Point[] {
  let points = ring.slice();
  let changed = true;
  while (changed && points.length > 3) {
    changed = false;
    const next: Point[] = [];
    for (let i = 0; i < points.length; i++) {
      const prev = next.length ? next[next.length - 1] : points[points.length - 1];
      const p = points[i];
      const after = points[(i + 1) % points.length];
      const ax = p[0] - prev[0];
      const ay = p[1] - prev[1];
      const bx = after[0] - p[0];
      const by = after[1] - p[1];
      const la = Math.hypot(ax, ay);
      const lb = Math.hypot(bx, by);
      if (la < minEdge) {
        changed = true;
        continue;
      }
      // A turn of more than ~150 degrees is a spike, not a corner.
      if (lb > 0 && (ax * bx + ay * by) / (la * lb) < -0.86) {
        changed = true;
        continue;
      }
      next.push(p);
    }
    points = next;
  }
  return points;
}

/** [outer, ...holes] in source pixels, cleaned. */
export const MARK_RINGS: Ring[] = MARK_POLYGONS[0].map((ring) => cleanRing(ring));

/** Even-odd SVG path of the welded outline, in source pixels. */
export const MARK_OUTLINE_PATH = MARK_RINGS.map(
  (ring) => "M" + ring.map(([x, y]) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`).join(" ") + "Z",
).join("");

/** Converts a source-pixel point to world units, centred on the mark, y up. */
export function pxToWorld(x: number, y: number): [number, number] {
  return [(x - MARK_CENTRE_PX.x) * UNITS_PER_PX, (MARK_CENTRE_PX.y - y) * UNITS_PER_PX];
}

export interface Frame {
  /** Left, top, width and height in source pixels: an SVG viewBox. */
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A frame around the mark, symmetric about the axis so the seam stays centred. */
export function markFrame(padX: number, padTop: number, padBottom: number): Frame {
  const halfWidth = Math.max(MARK_AXIS_X - MARK_BOUNDS.minX, MARK_BOUNDS.maxX - MARK_AXIS_X) + padX;
  return {
    x: MARK_AXIS_X - halfWidth,
    y: MARK_BOUNDS.minY - padTop,
    width: halfWidth * 2,
    height: MARK_BOUNDS.maxY - MARK_BOUNDS.minY + padTop + padBottom,
  };
}

/** Position of a source-pixel point inside a frame, as percentages. */
export function framePercent(frame: Frame, x: number, y: number) {
  return { left: ((x - frame.x) / frame.width) * 100, top: ((y - frame.y) / frame.height) * 100 };
}
