/*
 * PROTOTYPE (visual review, not production). The proposed router for the energy wire.
 *
 * Same curve language as Phase 1 (src/lib/curves: 0/45/90 headings, Euler-spiral turns of one
 * radius), same public interface. What changes is what the router sees and what it prefers:
 *
 * 1. It sees the artwork as drawn. The plates' visible strokes and fills (ink.ts) are rasterised
 *    with the text into a distance field. Each artwork is closed (gaps under CLOSE px filled) and
 *    its holes filled, so the wire never threads between a drawing's parts. The plate keepout
 *    rectangles are no longer used for the SVG plates.
 * 2. No blanket exemption for a plate's own artwork. Only the straight stub along a port's heading
 *    that is needed to get clear of the artwork is exempt; after that the wire must keep clear of
 *    its own plate like any other (Phase 1 let the opening and closing runs cross it).
 * 3. Spacing is a cost, not just a limit. Every pixel of wire closer than COMFORT to anything
 *    costs, so lane changes sit in the middle of gaps and long runs keep their distance.
 * 4. Gentler topology. Turns cost by the square of their angle, so two 45 degree turns beat one
 *    90; a side port may be entered or left through a 45 degree chamfer; level runs may be
 *    chamfered; fussy shallow S-jogs cost extra.
 * 5. Phones get their own port preferences (Port.phone), so the wire keeps to one side of the
 *    column, and enters each plate from it, instead of crossing the column at every plate.
 */

import { fillet, turnExtent, type Cubic, type Piece, type Pt } from "@/lib/curves/geometry";
import { CURVE, wireRadius } from "@/lib/curves/tokens";
import type { Ink } from "./ink";

export type { Pt };
export type Dir = "down" | "left" | "right";
export interface Port extends Pt {
  dir: Dir;
  /** Added to a route's score, so a plate can prefer one port to another. */
  penalty?: number;
  /** The penalty on a phone (single column, under 640px), when it differs. */
  phone?: number;
  /** The penalty this router uses on larger screens, when it differs from `penalty` (prototype data). */
  next?: number;
}
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
export interface Stop {
  ins: Port[];
  outs: Port[];
  keepout: Box[];
  arriveY?: number;
  leaveY?: number;
}
export interface Segment {
  d: string;
  length: number;
  start: number;
  points: { x: number; y: number; at: number }[];
}
export interface Arrival {
  stop: number;
  port: number;
  x: number;
  y: number;
  at: number;
}
export interface Wire {
  segments: Segment[];
  arrivals: Arrival[];
  keys: { y: number; at: number }[];
  total: number;
}

const DEG = Math.PI / 180;
const HEADING: Record<Dir, Pt> = {
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const STEP = 6;
const LEVEL_STEP = 6;
const LEVEL_STEP_TWO = 16;
const DIAGONAL = CURVE.headings[1] * DEG;
const MIN_SCALE = 0.5;
const SCALE_STEPS = 6;
const PORT_WEIGHT = 40;
const HIT = 10000;
const GRID_FROM = 1004;
const GRID_GAP = 24;
const EARLY = 0.15;

/** Per-layout tuning: set at the top of routeWire from the width. */
interface Tuning {
  phone: boolean;
  /** Hard clearance from text and artwork (px). */
  clear: number;
  /** Closer than this costs (px), running down the page... */
  comfort: number;
  /** ...and across it (a lane change sits in the middle of the gap it crosses). */
  across: number;
  /** Gaps in an artwork narrower than twice this are filled (px). */
  close: number;
  /** Raster cell (px). */
  cell: number;
  /** What a quarter turn costs (px of route). */
  turn: number;
  /** What reversing sideways costs (px of route): a hook. */
  reversal: number;
}
let T: Tuning = { phone: false, clear: 14, comfort: 44, across: 56, close: 18, cell: 4, turn: 128, reversal: 576 };
/** The best score found so far in the current hop: a candidate that cannot beat it is dropped early. */
let BOUND = Infinity;

/** Tuning from the layout: a turn or a hook costs in proportion to the page, not to the radius. */
function tune(width: number, lane: number, R: number): Tuning {
  const phone = width < 640;
  return {
    phone,
    clear: phone ? 8 : 14,
    // Running down the middle of the page margin is comfortable by definition.
    comfort: phone ? 1.5 * lane : Math.max(36, Math.min(44, 1.5 * lane)),
    across: phone ? 36 : 56,
    close: phone ? 10 : 18,
    cell: phone ? 2 : 4,
    turn: Math.max(W.turn * R, W.turnPage * width),
    reversal: W.reversal * width,
  };
}

/** Score weights. */
const W = {
  /** A quarter turn costs this many radii (scaled by the square of the turn's share of 90 degrees). */
  turn: 4,
  offGrid: 1,
  /** Px of route per px of wire at zero spacing (falls off with the square of the spacing). */
  comfort: 2.4,
  /** The same for runs across the page: a cramped crossing is the most visible kind. */
  acrossW: 3,
  /** Px of route per px of wire across decoration (the automation dot canvas). */
  deco: 1,
  /** A lane change shallower than 45 degrees (an S), in radii. */
  shallow: 3,
  /** A lane change of less than 3 radii sideways costs this many px per px short of it: make it decisive or not at all. */
  smallJog: 3,
  /** A quarter turn never costs less than this share of the page width. */
  turnPage: 0.12,
  /** A sideways reversal (a hook), as a share of the page width. */
  reversal: 0.4,
};

// ---------------------------------------------------------------------------------------------
// The field: distance from every cell to the nearest text or artwork, in px.

interface Field {
  y0: number;
  w: number;
  h: number;
  cell: number;
  d: Float32Array;
  deco: Uint8Array;
}
let F: Field | null = null;
/** Where the page's background changes: a run across the page keeps its distance from these too. */
let EDGES: number[] = [];
const edgeAt = (y: number) => {
  let d = 999;
  for (const e of EDGES) d = Math.min(d, Math.abs(y - e));
  return d;
};

function edt(mask: Uint8Array, w: number, h: number) {
  const INF = 1e12;
  const f = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) f[i] = mask[i] ? 0 : INF;
  const n = Math.max(w, h);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  const g = new Float64Array(n);
  const pass = (count: number, len: number, idx: (a: number, q: number) => number) => {
    for (let a = 0; a < count; a++) {
      for (let q = 0; q < len; q++) g[q] = f[idx(a, q)];
      let k = 0;
      v[0] = 0;
      z[0] = -INF;
      z[1] = INF;
      for (let q = 1; q < len; q++) {
        let s = (g[q] + q * q - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) {
          k--;
          s = (g[q] + q * q - (g[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        }
        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < len; q++) {
        while (z[k + 1] < q) k++;
        d[q] = (q - v[k]) * (q - v[k]) + g[v[k]];
      }
      for (let q = 0; q < len; q++) f[idx(a, q)] = d[q];
    }
  };
  pass(w, h, (x, y) => y * w + x);
  pass(h, w, (y, x) => y * w + x);
  return f;
}

function buildField(width: number, yTop: number, yBottom: number, text: Box[], solids: Box[], art: Ink[]): Field {
  const { cell, close } = T;
  const w = Math.ceil(width / cell) + 1;
  const h = Math.ceil((yBottom - yTop) / cell) + 1;
  const ink = new Uint8Array(w * h);
  const deco = new Uint8Array(w * h);
  const cx = (x: number) => Math.max(0, Math.min(w - 1, Math.floor(x / cell)));
  const cy = (y: number) => Math.max(0, Math.min(h - 1, Math.floor((y - yTop) / cell)));
  for (const a of art) {
    const target = a.faint ? deco : ink;
    const r = Math.max(a.r, cell / 2);
    for (let y = cy(a.y - r); y <= cy(a.y + r); y++) for (let x = cx(a.x - r); x <= cx(a.x + r); x++) target[y * w + x] = 1;
  }
  // Close the artwork: grow it by `close`, then shrink it back.
  const grown = edt(ink, w, h);
  const c2 = (close / cell) ** 2;
  const outside = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) outside[i] = grown[i] > c2 ? 1 : 0;
  const shrink = edt(outside, w, h);
  const solid = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = ink[i] || shrink[i] > c2 ? 1 : 0;
  // Fill holes: whatever free space cannot be reached from the edge of the field.
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (i: number) => {
    if (!seen[i] && !solid[i]) {
      seen[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }
  for (let i = 0; i < w * h; i++) if (!seen[i]) solid[i] = 1;
  for (const b of [...text, ...solids])
    for (let y = cy(b.y0); y <= cy(b.y1); y++) for (let x = cx(b.x0); x <= cx(b.x1); x++) solid[y * w + x] = 1;
  const dist = edt(solid, w, h);
  const d = new Float32Array(w * h);
  // Distance from a cell's centre to the nearest solid cell's nearest edge, roughly.
  for (let i = 0; i < w * h; i++) d[i] = Math.max(0, Math.sqrt(dist[i]) * cell - cell / 2);
  return { y0: yTop, w, h, cell, d, deco };
}

function fieldAt(x: number, y: number) {
  const f = F!;
  const i = Math.floor(x / f.cell);
  const j = Math.floor((y - f.y0) / f.cell);
  if (i < 0 || j < 0 || i >= f.w || j >= f.h) return { d: 999, deco: 0 };
  const k = j * f.w + i;
  return { d: f.d[k], deco: f.deco[k] };
}

/** How far the wire must run straight along a port's heading (from the port outward) to be clear. */
function escape(p: Pt, toward: Pt) {
  // Plus one clearance: what lies right beside the port is part of the port.
  for (let s = 0; s < 240; s += 2) if (fieldAt(p.x + toward.x * s, p.y + toward.y * s).d >= T.clear) return s + T.clear;
  return 240;
}

// ---------------------------------------------------------------------------------------------

const bez = ([p0, p1, p2, p3]: Cubic, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

function sampleAt(pieces: Piece[], step: number) {
  const pts: Pt[] = [];
  for (const piece of pieces) {
    if (piece.kind === "line") {
      const n = Math.max(1, Math.ceil(Math.hypot(piece.b.x - piece.a.x, piece.b.y - piece.a.y) / step));
      for (let i = pts.length ? 1 : 0; i <= n; i++)
        pts.push({ x: piece.a.x + ((piece.b.x - piece.a.x) * i) / n, y: piece.a.y + ((piece.b.y - piece.a.y) * i) / n });
    } else {
      const [p0, p1, p2, p3] = piece.c;
      const rough = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y) + Math.hypot(p3.x - p2.x, p3.y - p2.y);
      const n = Math.max(4, Math.ceil(rough / step));
      for (let i = pts.length ? 1 : 0; i <= n; i++) pts.push(bez(piece.c, i / n));
    }
  }
  let at = 0;
  return pts.map((p, i) => {
    if (i) at += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
    return { ...p, at };
  });
}
const sample = (pieces: Piece[]) => sampleAt(pieces, STEP);

function toPath(pieces: Piece[]) {
  const f = (n: number) => Math.round(n * 100) / 100;
  let d = "";
  for (const p of pieces) {
    if (p.kind === "line") d += `${d ? "" : `M${f(p.a.x)} ${f(p.a.y)}`}L${f(p.b.x)} ${f(p.b.y)}`;
    else {
      const [a, b, c, e] = p.c;
      d += `${d ? "" : `M${f(a.x)} ${f(a.y)}`}C${f(b.x)} ${f(b.y)} ${f(c.x)} ${f(c.y)} ${f(e.x)} ${f(e.y)}`;
    }
  }
  return d;
}

function along(a: Pt, b: Pt, dir: Dir) {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  return ((b.x - a.x) * HEADING[dir].x + (b.y - a.y) * HEADING[dir].y) / length > 0.999;
}

interface Tokens {
  R: number;
  lead: number;
  gap: number;
}

interface Hop {
  outs: Port[];
  ins: Port[];
  width: number;
  lane: number;
  grid: number[];
}

interface Candidate {
  pieces: Piece[];
  hits: number;
  score: number;
  port: Port;
}

const better = (a: Candidate | null, b: Candidate | null) => {
  if (b && b.score < BOUND) BOUND = b.score;
  return !b ? a : !a || b.score < a.score ? b : a;
};

interface Pairing extends Tokens {
  p: Port;
  q: Port;
  /** The straight stubs at either end that may cross artwork (px). */
  free0: number;
  free1: number;
  penalty: number;
  grid: number[];
}

type Jog = [Pt, Pt];

/** Score a polyline on its true curve against the field. */
function judge(pair: Pairing, raw: Pt[], jogs: Jog[], partial = false): Candidate | null {
  const { R, lead, gap, p, q, penalty, grid } = pair;
  const verts: Pt[] = [];
  for (const v of raw) {
    const last = verts[verts.length - 1];
    if (!last || Math.hypot(v.x - last.x, v.y - last.y) > 0.01) verts.push(v);
  }
  if (verts.length < 2) return null;
  if (!along(verts[0], verts[1], p.dir)) return null;
  if (!partial && !along(verts[verts.length - 2], verts[verts.length - 1], q.dir)) return null;
  // The exempt stubs must lie on the straight runs at either end.
  if (Math.hypot(verts[1].x - verts[0].x, verts[1].y - verts[0].y) < pair.free0) return null;
  const n = verts.length - 1;
  if (!partial && Math.hypot(verts[n].x - verts[n - 1].x, verts[n].y - verts[n - 1].y) < pair.free1) return null;
  let turning = 0;
  let polyLength = 0;
  for (let j = 0; j < n; j++) polyLength += Math.hypot(verts[j + 1].x - verts[j].x, verts[j + 1].y - verts[j].y);
  for (let j = 1; j < n; j++) {
    const ux = verts[j].x - verts[j - 1].x;
    const uy = verts[j].y - verts[j - 1].y;
    const wx = verts[j + 1].x - verts[j].x;
    const wy = verts[j + 1].y - verts[j].y;
    const a = Math.acos(Math.max(-1, Math.min(1, (ux * wx + uy * wy) / (Math.hypot(ux, uy) * Math.hypot(wx, wy)))));
    turning += (a / (Math.PI / 2)) ** 2;
  }
  // Sideways reversals: the route heads one way across the page, then back.
  let reversals = 0;
  let side = 0;
  for (let j = 0; j < n; j++) {
    const dx = verts[j + 1].x - verts[j].x;
    if (Math.abs(dx) < 0.5) continue;
    if (side && Math.sign(dx) !== side) reversals++;
    side = Math.sign(dx);
  }
  let shallow = 0;
  let small = 0;
  for (const [a, b] of jogs) {
    const ang = Math.atan2(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    if (ang > 1 * DEG && ang < 44 * DEG) shallow++;
    small += Math.max(0, 3 * R - Math.abs(b.x - a.x));
  }
  const offGrid = verts.filter((v, i) => i > 0 && i < n && v.x !== p.x && v.x !== q.x && !grid.includes(Math.round(v.x))).length;
  const fixed =
    turning * T.turn + reversals * T.reversal + shallow * W.shallow * R + small * W.smallJog + offGrid * W.offGrid * R + penalty * PORT_WEIGHT;
  // A turn shortens the line by well under a radius: what the polyline costs bounds what the curve costs.
  let bound = fixed + polyLength - (n - 1) * R;
  if (!partial && bound > BOUND) return null;
  // The straight parts of the runs (clear of the turns at their ends) are where the curve and the
  // polyline coincide: judge them first, coarsely, before building the curve.
  {
    let at = 0;
    const step = 2 * T.cell;
    for (let j = 0; j < n; j++) {
      const a = verts[j];
      const b = verts[j + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const lo = j === 0 ? 0 : turnExtent(Math.PI / 2, R);
      const hi = j === n - 1 ? len : len - turnExtent(Math.PI / 2, R);
      const steep = Math.abs(b.y - a.y) > 0.92 * len;
      const C = steep ? T.comfort : T.across;
      for (let t = lo; t < hi; t += step) {
        const s0 = at + t;
        if (s0 < pair.free0 || (!partial && s0 > polyLength - pair.free1)) continue;
        const y = a.y + ((b.y - a.y) * t) / len;
        const f = fieldAt(a.x + ((b.x - a.x) * t) / len, y);
        if (f.d < T.clear) {
          if (partial || BOUND < HIT) return null;
          bound += HIT;
        }
        const d = steep ? f.d : Math.min(f.d, edgeAt(y));
        if (d < C) bound += ((C - d) / C) ** 2 * step * (steep ? W.comfort : W.acrossW) * 0.9;
      }
      at += len;
    }
    if (!partial && bound > BOUND) return null;
  }

  const pieces = fillet(verts, R, { lead, gap });
  if (!pieces) return null;
  let hits = 0;
  let L = 0;
  for (const piece of pieces) {
    if (piece.kind === "line") L += Math.hypot(piece.b.x - piece.a.x, piece.b.y - piece.a.y);
    else {
      const [p0, p1, p2, p3] = piece.c;
      L += (Math.hypot(p3.x - p0.x, p3.y - p0.y) + Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y) + Math.hypot(p3.x - p2.x, p3.y - p2.y)) / 2;
    }
  }
  let cost = fixed + L;
  let at = 0;
  let px = verts[0].x;
  let py = verts[0].y;
  const visit = (x: number, y: number) => {
    const ds = Math.hypot(x - px, y - py);
    const steep = Math.abs(y - py) > 0.92 * ds;
    px = x;
    py = y;
    at += ds;
    if (at < pair.free0 || (!partial && at > L - pair.free1)) return true;
    const f = fieldAt(x, y);
    if (f.d < T.clear) {
      hits++;
      cost += HIT;
      if (partial) return false;
    }
    const C = steep ? T.comfort : T.across;
    const d = steep ? f.d : Math.min(f.d, edgeAt(y));
    if (d < C) cost += ((C - d) / C) ** 2 * ds * (steep ? W.comfort : W.acrossW);
    if (f.deco) cost += ds * W.deco;
    return partial || cost <= BOUND;
  };
  for (const piece of pieces) {
    if (piece.kind === "line") {
      const len = Math.hypot(piece.b.x - piece.a.x, piece.b.y - piece.a.y);
      const k = Math.max(1, Math.ceil(len / T.cell));
      for (let i = 1; i <= k; i++)
        if (!visit(piece.a.x + ((piece.b.x - piece.a.x) * i) / k, piece.a.y + ((piece.b.y - piece.a.y) * i) / k)) return null;
    } else {
      const [p0, p1, p2, p3] = piece.c;
      const rough = Math.hypot(p1.x - p0.x, p1.y - p0.y) + Math.hypot(p2.x - p1.x, p2.y - p1.y) + Math.hypot(p3.x - p2.x, p3.y - p2.y);
      const k = Math.max(3, Math.ceil(rough / T.cell));
      for (let i = 1; i <= k; i++) {
        const t = i / k;
        const u = 1 - t;
        const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
        const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
        if (!visit(x, y)) return null;
      }
    }
  }
  const score = cost;
  return { pieces, hits, score, port: q };
}

function jogAngles(dx: number, R: number) {
  const angles = [90 * DEG];
  const fits = (a: number) => dx / Math.sin(a) >= 2 * turnExtent(a, R);
  if (fits(DIAGONAL)) angles.push(DIAGONAL);
  else if (fits(1 * DEG)) {
    let lo = 1 * DEG;
    let hi = DIAGONAL;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid;
      else hi = mid;
    }
    angles.push(lo);
  }
  return angles;
}

const dropOf = (dx: number, a: number) => (a >= 89.9 * DEG ? 0 : Math.abs(dx) / Math.tan(a));

function levels(yA: number, yB: number, drop: number, a: number, step: number, { R, lead, gap }: Tokens) {
  const last = yB - drop;
  if (last < yA) return [];
  const e90 = turnExtent(90 * DEG, R);
  const ea = turnExtent(a, R);
  const fits = [lead + ea, e90 + ea, e90 + ea + gap];
  const ys = new Set<number>();
  for (let y = yA; y <= last; y += step) ys.add(y);
  for (const o of fits) {
    if (yA + o <= last) ys.add(yA + o);
    if (last - o >= yA) ys.add(last - o);
  }
  ys.add(last);
  return [...ys].sort((u, v) => u - v);
}

/** The smallest chamfer (px along each axis) whose diagonal holds two 45 degree turns. */
const chamferMin = (R: number) => Math.ceil((2 * turnExtent(45 * DEG, R)) / Math.SQRT2) + 1;

/** Ways into the first lane x: straight down, out sideways, or out sideways through a chamfer. */
function heads(p: Port, x: number, R: number): Pt[][] {
  if (p.dir === "down") return [[p]];
  const out = [[p, { x, y: p.y }]];
  const s = Math.sign(x - p.x);
  for (const k of [1, 2]) {
    const c = chamferMin(R) * k;
    if (Math.abs(x - p.x) > c + 2 * turnExtent(45 * DEG, R)) out.push([p, { x: x - s * c, y: p.y }, { x, y: p.y + c }]);
  }
  return out;
}

/** Ways out of the last lane x into q: straight down, or down then sideways in, or through a chamfer. */
function tails(q: Port, x: number, R: number): Pt[][] {
  if (q.dir === "down") return [[q]];
  const out = [[{ x, y: q.y }, q]];
  const s = Math.sign(q.x - x);
  for (const k of [1, 2]) {
    const c = chamferMin(R) * k;
    if (Math.abs(q.x - x) > c + 2 * turnExtent(45 * DEG, R)) out.push([{ x, y: q.y - c }, { x: x + s * c, y: q.y }, q]);
  }
  return out;
}

/** A route with at most one lane change, from lane x1 to lane xn. */
function oneChange(pair: Pairing, x1: number, xn: number) {
  let best: Candidate | null = null;
  for (const start of heads(pair.p, x1, pair.R))
    for (const end of tails(pair.q, xn, pair.R)) {
      if (x1 === xn) {
        best = better(best, judge(pair, [...start, ...end], []));
        continue;
      }
      const yA = start[start.length - 1].y;
      const yB = end[0].y;
      const dx = xn - x1;
      for (const a of jogAngles(Math.abs(dx), pair.R)) {
        const drop = dropOf(dx, a);
        for (const y of levels(yA, yB, drop, a, LEVEL_STEP, pair)) {
          const j0 = { x: x1, y };
          const j1 = { x: xn, y: y + drop };
          best = better(best, judge(pair, [...start, j0, j1, ...end], [[j0, j1]]));
        }
      }
      // A level run with chamfered corners: down, 45, across, 45, down.
      const c = chamferMin(pair.R);
      const s = Math.sign(dx);
      if (Math.abs(dx) > 2 * c + 2 * turnExtent(45 * DEG, pair.R)) {
        for (const y of levels(yA, yB, 2 * c, DIAGONAL, LEVEL_STEP * 2, pair)) {
          const route = [...start, { x: x1, y }, { x: x1 + s * c, y: y + c }, { x: xn - s * c, y: y + c }, { x: xn, y: y + 2 * c }, ...end];
          best = better(best, judge(pair, route, []));
        }
      }
    }
  return best;
}

/** A route with two lane changes, through a middle lane. The first change is judged once per start. */
function twoChanges(pair: Pairing, x1: number, xn: number, lanes: number[]) {
  const { R } = pair;
  const stub = turnExtent(90 * DEG, R) + pair.lead + R;
  let best: Candidate | null = null;
  const ends = tails(pair.q, xn, R);
  const yB = Math.max(...ends.map((e) => e[0].y));
  for (const start of heads(pair.p, x1, R).slice(0, 2)) {
    const yA = start[start.length - 1].y;
    for (const xm of lanes) {
      if (xm === x1 || xm === xn) continue;
      const firsts: { j0: Pt; j1: Pt; score: number }[] = [];
      for (const a of jogAngles(Math.abs(xm - x1), R)) {
        const drop = dropOf(xm - x1, a);
        for (const y of levels(yA, yB, drop, a, LEVEL_STEP_TWO, pair)) {
          const j0 = { x: x1, y };
          const j1 = { x: xm, y: y + drop };
          const first = judge(pair, [...start, j0, j1, { x: xm, y: j1.y + stub }], [[j0, j1]], true);
          if (first && first.hits === 0) firsts.push({ j0, j1, score: first.score });
        }
      }
      if (!firsts.length) continue;
      firsts.sort((u, v) => u.score - v.score);
      for (const end of ends.slice(0, 2)) {
        const yE = end[0].y;
        for (const a of jogAngles(Math.abs(xn - xm), R)) {
          const drop = dropOf(xn - xm, a);
          for (const y of levels(yA, yE, drop, a, LEVEL_STEP_TWO, pair).reverse()) {
            const k0 = { x: xm, y };
            const k1 = { x: xn, y: y + drop };
            let tried = 0;
            for (const f of firsts) {
              if (f.j1.y >= y) continue;
              best = better(best, judge(pair, [...start, f.j0, f.j1, k0, k1, ...end], [[f.j0, f.j1], [k0, k1]]));
              if (++tried >= 3) break;
            }
          }
        }
      }
    }
  }
  return best;
}

const exact = (n: number) => Math.round(n * 1024) / 1024;

const penaltyOf = (p: Port) => (T.phone && p.phone !== undefined ? p.phone : (p.next ?? p.penalty ?? 0));

function hop({ outs, ins, width, lane, grid }: Hop, tk: Tokens) {
  BOUND = Infinity;
  const e90 = turnExtent(90 * DEG, tk.R);
  const fine: number[] = [];
  for (let x = lane; x <= width - lane; x += width < 640 ? 12 : 24) fine.push(Math.round(x));
  let best: Candidate | null = null;

  for (const p of outs) {
    const free0 = escape(p, HEADING[p.dir]);
    for (const q of ins) {
      const back = HEADING[q.dir];
      const free1 = escape(q, { x: -back.x, y: -back.y });
      const pair: Pairing = { ...tk, p, q, free0, free1, penalty: penaltyOf(p) + penaltyOf(q), grid };
      const room = tk.lead + e90;
      const side = (xs: number[], port: Port, before: boolean) => xs.filter((x) => (before ? x <= port.x - room : x >= port.x + room));
      const starts = (xs: number[]) => (p.dir === "down" ? [p.x] : side(xs, p, p.dir === "left"));
      const ends = (xs: number[]) => (q.dir === "down" ? [q.x] : side(xs, q, q.dir === "right"));
      const lanes = [...new Set([...grid, p.x, q.x, ...fine])].filter((x) => x >= lane && x <= width - lane).sort((a, b) => a - b);
      let local: Candidate | null = null;
      for (const x1 of starts(lanes)) for (const xn of ends(lanes)) local = better(local, oneChange(pair, x1, xn));
      // Two changes when one cannot get clear, or is crowded.
      if (!local || local.hits || local.score > 1.6 * Math.hypot(q.x - p.x, q.y - p.y) + 4 * tk.R) {
        const mids = [...new Set([...grid, p.x, q.x, ...fine.filter((_, i) => i % 2 === 0)])].filter((x) => x >= lane && x <= width - lane);
        for (const x1 of starts(lanes)) for (const xn of ends(lanes)) local = better(local, twoChanges(pair, x1, xn, mids));
      }
      best = better(best, local);
    }
  }
  return best;
}

function gridLanes(width: number, lane: number, margin: number) {
  const xs = new Set([lane, Math.round(width - lane), Math.round(width / 2)]);
  if (width >= GRID_FROM) {
    const inner = width - 2 * margin;
    const column = (inner - 11 * GRID_GAP) / 12;
    for (let k = 1; k < 12; k++) xs.add(Math.round(margin + k * (column + GRID_GAP) - GRID_GAP / 2));
  }
  return [...xs].sort((a, b) => a - b);
}

/** Same contract as route.ts, plus the plates' sampled artwork. */
export function routeWire(
  origin: Pt,
  stops: Stop[],
  text: Box[],
  width: number,
  lane: number,
  reach: number,
  below: number,
  margin = lane * 2,
  art: Ink[] = [],
  edges: number[] = [],
  groups: Box[] = [],
): Wire {
  EDGES = edges;
  const R = wireRadius(margin);
  T = tune(width, lane, R);
  const grid = gridLanes(width, lane, margin);
  // Stops without sampled artwork (the Approach stage, a 3D render) keep their keepout boxes.
  const drawn = new Set(art.map((a) => a.stop));
  const solids = [...stops.flatMap((s, i) => (drawn.has(i) ? [] : s.keepout)), ...groups];
  const yTop = origin.y - 200;
  const yBottom = Math.max(...stops.flatMap((s) => s.keepout.map((b) => b.y1)), ...stops.flatMap((s) => s.ins.map((p) => p.y))) + 400;
  F = buildField(width, yTop, yBottom, text, solids, art);

  const segments: Segment[] = [];
  const arrivals: Arrival[] = [];
  const keys: Wire["keys"] = [];
  let at = 0;
  let outs: Port[] = [{ ...origin, dir: "down" }];
  let leaveY: number | undefined;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const job: Hop = { outs, ins: stop.ins, width, lane, grid };
    // On a phone the straight before a turn is halved, so a plate's side port close to the margin can still be reached.
    const lead = (T.phone ? CURVE.lead / 2 : CURVE.lead) * R;
    const routeAt = (scale: number) => hop(job, { R: R * scale, lead: lead * scale, gap: CURVE.gap * R * scale });
    let best = routeAt(1);
    if (!best || best.hits) {
      const least = routeAt(MIN_SCALE);
      if (least && !least.hits) {
        let [lo, hi] = [MIN_SCALE, 1];
        best = least;
        for (let k = 0; k < SCALE_STEPS; k++) {
          const mid = (lo + hi) / 2;
          const r = routeAt(mid);
          if (r && !r.hits) [best, lo] = [r, mid];
          else hi = mid;
        }
      } else if (least && (!best || least.hits < best.hits)) best = least;
    }
    const chosen = best ?? { pieces: [{ kind: "line" as const, a: outs[0], b: stop.ins[0] }], port: stop.ins[0], hits: 0, score: 0 };
    const points = sample(chosen.pieces);
    const length = exact(points[points.length - 1].at);
    segments.push({ d: toPath(chosen.pieces), length, start: at, points });
    const y0 = Math.min(...stop.keepout.map((b) => b.y0));
    const y1 = Math.max(...stop.keepout.map((b) => b.y1));
    const arrive = stop.arriveY ?? Math.min(chosen.port.y, Math.max(y0 + EARLY * (y1 - y0), chosen.port.y - reach), y1 - below);
    keys.push({ y: leaveY ?? points[0].y, at }, { y: arrive, at: at + length });
    at += length;
    arrivals.push({ stop: i, port: stop.ins.indexOf(chosen.port), x: chosen.port.x, y: chosen.port.y, at });
    if (!stop.outs.length) break;
    const out = stop.outs.reduce((a, b) => (a.y > b.y ? a : b));
    at += exact(Math.max(24, out.y - chosen.port.y));
    outs = stop.outs;
    leaveY = stop.leaveY;
  }

  for (let i = 1; i < keys.length; i++) keys[i].y = Math.max(keys[i].y, keys[i - 1].y);
  F = null;
  return { segments, arrivals, keys, total: at };
}

export function headAt(keys: Wire["keys"], y: number) {
  if (!keys.length || y <= keys[0].y) return 0;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (y <= b.y) return b.y === a.y ? b.at : a.at + ((b.at - a.at) * (y - a.y)) / (b.y - a.y);
  }
  return keys[keys.length - 1].at;
}

export function pointAt(segments: Segment[], at: number): Pt | null {
  for (const s of segments) {
    if (at < s.start || at > s.start + s.length) continue;
    const local = at - s.start;
    const pts = s.points;
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].at < local) lo = mid;
      else hi = mid;
    }
    const a = pts[lo];
    const b = pts[hi];
    const k = b.at === a.at ? 0 : (local - a.at) / (b.at - a.at);
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
  }
  return null;
}

/** PROTOTYPE debugging: score one polyline for a given pair of ports. */
export function debugJudge(width: number, margin: number, text: Box[], stops: Stop[], art: Ink[], origin: Pt, p: Port, q: Port, poly: Pt[]) {
  const R = wireRadius(margin);
  T = tune(width, margin / 2, R);
  const drawn = new Set(art.map((a) => a.stop));
  const solids = stops.flatMap((s, i) => (drawn.has(i) ? [] : s.keepout));
  const yBottom = Math.max(...stops.flatMap((s) => s.keepout.map((b) => b.y1))) + 400;
  F = buildField(width, origin.y - 200, yBottom, text, solids, art);
  const back = HEADING[q.dir];
  const pair: Pairing = { R, lead: CURVE.lead * R, gap: CURVE.gap * R, p, q, free0: escape(p, HEADING[p.dir]), free1: escape(q, { x: -back.x, y: -back.y }), penalty: penaltyOf(p) + penaltyOf(q), grid: [] };
  BOUND = Infinity;
  const c = judge(pair, poly, []);
  return { free0: pair.free0, free1: pair.free1, score: c?.score, hits: c?.hits, field: F };
}
