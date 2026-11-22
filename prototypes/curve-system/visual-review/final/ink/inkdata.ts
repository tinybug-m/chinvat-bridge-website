/*
 * PROTOTYPE: the plates' artwork ink from data generated at build time (generate-ink.mjs), so the browser does not
 * walk every SVG element on every layout. It reproduces ink.ts's `artwork()` point for point: same elements, same
 * order, same count (a step of 6 screen px along each outline, a 6 px grid inside each fill), same radii.
 *
 * The data holds, per plate, each drawn element's outline in the SVG's own units (a polyline with the arc length at
 * each vertex, exact for lines, within 0.004 units for curves) and its static style. At run time only the plate's
 * scale and offset (its screen matrix) are applied.
 */
export interface Ink {
  x: number;
  y: number;
  r: number;
  stop: number;
  faint: boolean;
}

export interface InkElement {
  /** Stroke half-width in SVG units (0 when the element has no stroke). */
  sw: number;
  fill: boolean;
  faint: boolean;
  /** getTotalLength() in SVG units. */
  len: number;
  /** getBBox(): x, y, width, height. */
  bb: [number, number, number, number];
  /** Outline subpaths, each flat [arcLength, x, y, arcLength, x, y, ...]. */
  sp: number[][];
  /** Fill rule is evenodd (else nonzero). */
  eo?: boolean;
}

export interface InkPlate {
  sig: string;
  elements: InkElement[];
}

export interface InkData {
  version: 1;
  step: number;
  /** SHA-256 of the files the artwork and its styles come from, by path (checked by the unit test, not at run time). */
  sources: Record<string, string>;
  plates: InkPlate[];
}

import { ELEMENTS, signature } from "./ink-signature.ts";

export { signature };
export const STEP = 6;

function pointAt(sp: number[][], t: number, cursor: { j: number; k: number }, out: number[]) {
  // t only increases along an element, so the cursor only moves forward.
  for (;;) {
    const a = sp[cursor.j];
    const last = a.length - 3;
    if (t > a[last] && cursor.j < sp.length - 1) {
      cursor.j++;
      cursor.k = 0;
      continue;
    }
    while (cursor.k < last - 3 && a[cursor.k + 3] < t) cursor.k += 3;
    const k = cursor.k;
    if (last === 0) {
      out[0] = a[1];
      out[1] = a[2];
      return;
    }
    const s0 = a[k];
    const s1 = a[k + 3];
    const u = s1 > s0 ? Math.min(1, Math.max(0, (t - s0) / (s1 - s0))) : 0;
    out[0] = a[k + 1] + (a[k + 4] - a[k + 1]) * u;
    out[1] = a[k + 2] + (a[k + 5] - a[k + 2]) * u;
    return;
  }
}

/** Is (x, y) in the fill? Points on the outline count as inside, as in the browser's isPointInFill. */
function inside(sp: number[][], eo: boolean, x: number, y: number): boolean {
  let winding = 0;
  let crossings = 0;
  for (const a of sp) {
    const n = a.length;
    if (n < 9) continue;
    let px = a[n - 2];
    let py = a[n - 1];
    for (let k = 1; k < n; k += 3) {
      const qx = a[k];
      const qy = a[k + 1];
      const ex = qx - px;
      const ey = qy - py;
      // On the edge (within 0.001 units)?
      const cross = ex * (y - py) - ey * (x - px);
      if ((ex !== 0 || ey !== 0) && Math.abs(cross) <= 0.001 * Math.hypot(ex, ey)) {
        const dot = ex * (x - px) + ey * (y - py);
        if (dot >= -1e-3 && dot <= ex * ex + ey * ey + 1e-3) return true;
      }
      if (py <= y !== qy <= y) {
        const t = (y - py) / (qy - py);
        if (px + t * (qx - px) > x) {
          crossings++;
          winding += qy > py ? 1 : -1;
        }
      }
      px = qx;
      py = qy;
    }
  }
  return eo ? (crossings & 1) === 1 : winding !== 0;
}

/** One plate's ink, given its screen matrix [a, b, c, d, e, f]. DOM free. */
export function inkForPlate(
  plate: InkPlate,
  m: { a: number; b: number; c: number; d: number; e: number; f: number },
  stop: number,
  toLayer: (x: number, y: number) => { x: number; y: number },
  step: number,
  ink: Ink[],
): void {
  const pt = [0, 0];
  const scale = Math.hypot(m.a, m.b);
  for (const el of plate.elements) {
    const put = (x: number, y: number, r: number) => {
      const q = toLayer(m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f);
      ink.push({ x: q.x, y: q.y, r, stop, faint: el.faint });
    };
    const half = Math.max(0.75, (el.sw * scale) / 2);
    const n = Math.max(1, Math.ceil((el.len * scale) / step));
    const cursor = { j: 0, k: 0 };
    for (let i = 0; i <= n; i++) {
      pointAt(el.sp, (el.len * i) / n, cursor, pt);
      put(pt[0], pt[1], half);
    }
    if (el.fill) {
      const [bx, by, bw, bh] = el.bb;
      const nx = Math.ceil((bw * scale) / step);
      const ny = Math.ceil((bh * scale) / step);
      for (let i = 1; i < nx; i++)
        for (let j = 1; j < ny; j++) {
          const x = bx + (bw * i) / nx;
          const y = by + (bh * j) / ny;
          if (inside(el.sp, !!el.eo, x, y)) put(x, y, step / 2);
        }
    }
  }
}

/**
 * Ink for every plate that has data; `missing` are the plate SVGs that do not (new or changed artwork), which the
 * caller samples the slow way.
 */
export function inkFromData(
  nodes: (Element | null)[],
  toLayer: (x: number, y: number) => { x: number; y: number },
  data: InkData,
): { ink: Ink[]; missing: number[] } {
  const bySig = new Map(data.plates.map((p) => [p.sig, p]));
  const ink: Ink[] = [];
  const missing: number[] = [];
  nodes.forEach((node, stop) => {
    if (!node || node.namespaceURI !== "http://www.w3.org/2000/svg") return;
    const svg = node as SVGSVGElement;
    const plate = bySig.get(signature(svg));
    const m = svg.getScreenCTM();
    if (!plate || !m) {
      missing.push(stop);
      return;
    }
    inkForPlate(plate, m, stop, toLayer, data.step, ink);
  });
  return { ink, missing };
}
