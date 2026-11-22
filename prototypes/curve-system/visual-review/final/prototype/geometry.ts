/*
 * The curve system's geometry: pure functions, no DOM, no imports.
 *
 * A line that carries the current is straight runs joined by TURNS. A turn
 * is two mirrored cubics whose curvature rises linearly from zero, peaks at
 * exactly 1/R at the apex and falls back to zero: a close fit (under 2% up
 * to 90 degrees) to an Euler spiral, the transition curve of railway and
 * road alignment. Because a turn starts and ends with zero curvature, it
 * meets a straight run, or a turn the other way, with continuous curvature:
 * nothing jolts where a straight becomes a bend.
 *
 * fillet() turns a polyline into such a path: every interior vertex becomes
 * a turn of one radius. Topology (which polyline) belongs to the caller, so
 * geometry and motion stay separate: this module returns pieces; how they
 * are drawn or animated is someone else's business.
 */

export interface Pt {
  x: number;
  y: number;
}
export type Cubic = [Pt, Pt, Pt, Pt];
export type Piece = { kind: "cubic"; c: Cubic } | { kind: "line"; a: Pt; b: Pt };

const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
const dot = (a: Pt, b: Pt) => a.x * b.x + a.y * b.y;
const cross = (a: Pt, b: Pt) => a.x * b.y - a.y * b.x;
const mag = (a: Pt) => Math.hypot(a.x, a.y);
const unit = (a: Pt) => mul(a, 1 / mag(a));

const DEG = Math.PI / 180;
/** Never sharper than a quarter turn (a little slack for rounding). */
const MAX_TURN = 90.5 * DEG;

/** First and second derivatives of a cubic at t. */
function d1(c: Cubic, t: number): Pt {
  const u = 1 - t;
  return {
    x: 3 * u * u * (c[1].x - c[0].x) + 6 * u * t * (c[2].x - c[1].x) + 3 * t * t * (c[3].x - c[2].x),
    y: 3 * u * u * (c[1].y - c[0].y) + 6 * u * t * (c[2].y - c[1].y) + 3 * t * t * (c[3].y - c[2].y),
  };
}
function d2(c: Cubic, t: number): Pt {
  const u = 1 - t;
  return {
    x: 6 * u * (c[2].x - 2 * c[1].x + c[0].x) + 6 * t * (c[3].x - 2 * c[2].x + c[1].x),
    y: 6 * u * (c[2].y - 2 * c[1].y + c[0].y) + 6 * t * (c[3].y - 2 * c[2].y + c[1].y),
  };
}

/** Signed curvature of a cubic at t (1/px). */
export function curvature(c: Cubic, t: number) {
  const v = d1(c, t);
  const m = mag(v);
  return m < 1e-9 ? 0 : cross(v, d2(c, t)) / (m * m * m);
}

/** Unit tangent of a cubic at t. */
export function tangent(c: Cubic, t: number): Pt {
  return unit(d1(c, Math.min(1 - 1e-6, Math.max(1e-6, t))));
}

interface Shape {
  /** Apex depth from the vertex, as a share of the extent. */
  mr: number;
  /** First handle, as a share of the way from the tangent point to the second. */
  h: number;
  /** Peak radius of a turn whose extent is 1. */
  rPerE: number;
}

const shapes = new Map<number, Shape>();

function rawTurn(V: Pt, u: Pt, w: Pt, e: number, shape: Omit<Shape, "rPerE">) {
  const tM = unit(add(u, w));
  const n = unit(sub(w, u));
  const m = shape.mr * e;
  const M = add(V, mul(n, m));
  const s = (m * cross(n, u)) / cross(tM, u);
  const P2 = sub(M, mul(tM, s));
  const T0 = sub(V, mul(u, e));
  const P1 = add(T0, mul(sub(P2, T0), shape.h));
  const T1 = add(V, mul(w, e));
  const k1 = mag(sub(V, P1));
  const k2 = mag(sub(V, P2));
  const cubics: [Cubic, Cubic] = [
    [T0, P1, P2, M],
    [M, add(V, mul(w, k2)), add(V, mul(w, k1)), T1],
  ];
  return { T0, T1, cubics };
}

/**
 * A turn's proportions for a deflection theta (radians), fitted so its curvature is linear in
 * arc length. rPerE is measured once per tenth of a degree and cached.
 */
function turnShape(theta: number): Shape {
  const key = Math.round(theta / (0.1 * DEG));
  const cached = shapes.get(key);
  if (cached) return cached;
  const q = theta / (Math.PI / 2);
  const base = { mr: (0.66 + 0.06 * q * q) * Math.tan(theta / 4), h: 0.5 - 0.1 * q * q };
  const { cubics } = rawTurn({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: Math.cos(theta), y: Math.sin(theta) }, 1, base);
  let peak = 0;
  for (let i = 0; i <= 200; i++) peak = Math.max(peak, Math.abs(curvature(cubics[0], i / 200)));
  const shape = { ...base, rPerE: 1 / peak };
  shapes.set(key, shape);
  return shape;
}

const angleBetween = (u: Pt, w: Pt) => Math.acos(Math.max(-1, Math.min(1, dot(u, w))));

/**
 * How far along each leg a turn of deflection theta (radians) and peak radius R runs: 1.84 R at
 * 90 degrees, 0.83 R at 45.
 */
export function turnExtent(theta: number, R: number) {
  return theta < 1e-4 ? 0 : R / turnShape(theta).rPerE;
}

/** A turn at vertex V from unit heading u to unit heading w, peak radius R. */
export function turn(V: Pt, u: Pt, w: Pt, R: number) {
  const theta = angleBetween(u, w);
  const shape = turnShape(theta);
  return rawTurn(V, u, w, R / shape.rPerE, shape);
}

export interface FilletOptions {
  /** Straight before the first turn and after the last (px). */
  lead?: number;
  /** Straight between two turns of the same hand, so they never merge into one lumpy bend. */
  gap?: number;
}

/**
 * Polyline to pieces: every interior vertex becomes a turn of peak radius R. Each straight run
 * must hold the turns at its ends, plus `lead` at either end of the line and `gap` between two
 * turns of the same hand (two opposite turns may touch: both have zero curvature there). Returns
 * null when the polyline cannot carry the radius, or turns sharper than 90 degrees.
 */
export function fillet(verts: Pt[], R: number, { lead = 0, gap = 0 }: FilletOptions = {}): Piece[] | null {
  const pts: Pt[] = [];
  for (const v of verts) if (!pts.length || mag(sub(v, pts[pts.length - 1])) > 0.01) pts.push(v);
  // Drop vertices that do not turn.
  for (let i = 1; i < pts.length - 1; ) {
    const a = unit(sub(pts[i], pts[i - 1]));
    const b = unit(sub(pts[i + 1], pts[i]));
    if (Math.abs(cross(a, b)) < 1e-6 && dot(a, b) > 0) pts.splice(i, 1);
    else i++;
  }
  const n = pts.length;
  if (n < 2) return null;
  const dirs: Pt[] = [];
  const lens: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const d = sub(pts[i + 1], pts[i]);
    lens.push(mag(d));
    dirs.push(unit(d));
  }
  const extent = new Array<number>(n).fill(0);
  const hand = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const theta = angleBetween(dirs[i - 1], dirs[i]);
    if (theta > MAX_TURN) return null;
    extent[i] = turnExtent(theta, R);
    hand[i] = Math.sign(cross(dirs[i - 1], dirs[i]));
  }
  for (let j = 0; j < n - 1; j++) {
    const a = j === 0 ? lead : extent[j];
    const b = j + 1 === n - 1 ? lead : extent[j + 1];
    const between = j > 0 && j + 1 < n - 1 && hand[j] === hand[j + 1] ? gap : 0;
    if (lens[j] + 1e-6 < a + b + between) return null;
  }
  const pieces: Piece[] = [];
  let cur = pts[0];
  for (let i = 1; i < n - 1; i++) {
    const t = turn(pts[i], dirs[i - 1], dirs[i], R);
    if (mag(sub(t.T0, cur)) > 0.01) pieces.push({ kind: "line", a: cur, b: t.T0 });
    pieces.push({ kind: "cubic", c: t.cubics[0] }, { kind: "cubic", c: t.cubics[1] });
    cur = t.T1;
  }
  if (mag(sub(pts[n - 1], cur)) > 0.01) pieces.push({ kind: "line", a: cur, b: pts[n - 1] });
  return pieces;
}
