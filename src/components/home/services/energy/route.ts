/*
 * Routing for the energy wire (EnergyFlow.tsx). Pure geometry: it takes the
 * measured layout (in the wire layer's own pixels) and returns the wire as
 * smooth segments, one per hop, from the hero's origin into a plate's in
 * port, and from each plate's out port into the next plate's in port.
 *
 * Each hop is one cubic, or a cubic into a vertical lane, the lane, and a
 * cubic out of it. Every candidate is sampled against the text and the
 * plates' artwork, and the shortest clear, least cramped one wins. Inside a
 * plate the wire is not drawn: the plate's own current carries it.
 */

export type Dir = "down" | "left" | "right";
export interface Pt {
  x: number;
  y: number;
}
export interface Port extends Pt {
  dir: Dir;
  /** Added to a route's score, so a plate can prefer one port to another. */
  penalty?: number;
}
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * A plate as the router sees it: where the wire may enter and leave, and the artwork it must not
 * cross, as one box or several (a diagonal deck is a band of boxes, leaving its empty corners free).
 */
export interface Stop {
  ins: Port[];
  outs: Port[];
  keepout: Box[];
  /**
   * Where the trigger line is when the energy arrives and when it leaves, for a stop that carries
   * the energy on its own scroll timing (the Approach seam's sweep). Default: arrive when the port
   * or the middle of the artwork reaches the line, leave when the out port does.
   */
  arriveY?: number;
  leaveY?: number;
}

export interface Segment {
  d: string;
  length: number;
  /** Where the segment starts on the wire's global length axis. */
  start: number;
  /** Polyline samples with cumulative length, for placing the head. */
  points: { x: number; y: number; at: number }[];
}

export interface Arrival {
  /** The plate this port belongs to (index into the stops). */
  stop: number;
  /** Which of the plate's ins the wire took. */
  port: number;
  x: number;
  y: number;
  /** Global length at which the energy reaches the port. */
  at: number;
}

export interface Wire {
  segments: Segment[];
  arrivals: Arrival[];
  /** Scroll keys: when the trigger line is at y, the head is at `at`. Monotonic in both. */
  keys: { y: number; at: number }[];
  total: number;
}

type Cubic = [Pt, Pt, Pt, Pt];
type Piece = { kind: "cubic"; c: Cubic } | { kind: "line"; a: Pt; b: Pt };

const UNIT: Record<Dir, Pt> = {
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
/** How far the wire stays from text and artwork (px); phones have a 20px margin to run in, so less there. */
let CLEARANCE = 14;
/** Sampling step along a candidate (px). */
const STEP = 6;
/** Vertical spans tried for the curves into and out of a lane (px). */
const SPANS = [36, 56, 80, 112, 150, 200, 270, 360];
/** Smallest horizontal run into a side port (px). */
const MIN_RUN = 14;
/**
 * A plate is powered once this share of its artwork (from the top) has reached the trigger line, so
 * it builds as it comes on screen, not once the reader is past it.
 */
const EARLY = 0.15;

/** One cubic leaving `a` along `da` and arriving at `b` along `db`. */
function connector(a: Pt, da: Dir, b: Pt, db: Dir): Cubic | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (db === "down" && dy < 1) return null;
  if (db === "right" && (dx < MIN_RUN || dy < 1)) return null;
  if (db === "left" && (-dx < MIN_RUN || dy < 1)) return null;
  const ka = (da === "down" ? Math.abs(dy) : Math.abs(dx)) * 0.55;
  const kb = (db === "down" ? Math.abs(dy) : Math.abs(dx)) * 0.55;
  return [
    a,
    { x: a.x + UNIT[da].x * ka, y: a.y + UNIT[da].y * ka },
    { x: b.x - UNIT[db].x * kb, y: b.y - UNIT[db].y * kb },
    b,
  ];
}

const bez = ([p0, p1, p2, p3]: Cubic, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

function sample(pieces: Piece[]) {
  const pts: Pt[] = [];
  for (const piece of pieces) {
    if (piece.kind === "line") {
      const n = Math.max(1, Math.ceil(Math.hypot(piece.b.x - piece.a.x, piece.b.y - piece.a.y) / STEP));
      for (let i = pts.length ? 1 : 0; i <= n; i++)
        pts.push({
          x: piece.a.x + ((piece.b.x - piece.a.x) * i) / n,
          y: piece.a.y + ((piece.b.y - piece.a.y) * i) / n,
        });
    } else {
      const [p0, p1, p2, p3] = piece.c;
      const rough =
        Math.hypot(p1.x - p0.x, p1.y - p0.y) +
        Math.hypot(p2.x - p1.x, p2.y - p1.y) +
        Math.hypot(p3.x - p2.x, p3.y - p2.y);
      const n = Math.max(2, Math.ceil(rough / STEP));
      for (let i = pts.length ? 1 : 0; i <= n; i++) pts.push(bez(piece.c, i / n));
    }
  }
  let at = 0;
  return pts.map((p, i) => {
    if (i) at += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
    return { ...p, at };
  });
}

const inside = (p: Pt, b: Box, pad: number) =>
  p.x > b.x0 - pad && p.x < b.x1 + pad && p.y > b.y0 - pad && p.y < b.y1 + pad;
const inAny = (p: Pt, boxes: Box[]) => boxes.some((b) => inside(p, b, CLEARANCE));

/**
 * Samples that hit an obstacle. The run of samples inside the plate the hop
 * leaves (or enters) is allowed: that is the wire reaching its port.
 */
function collisions(points: Pt[], obstacles: Box[], from: Box[] | null, to: Box[] | null) {
  let first = 0;
  let last = points.length - 1;
  if (from) while (first < points.length && inAny(points[first], from)) first++;
  if (to) while (last > first && inAny(points[last], to)) last--;
  let hits = 0;
  for (let i = first; i <= last; i++) for (const b of obstacles) if (inside(points[i], b, CLEARANCE)) hits++;
  return hits;
}

/** How cramped a curve looks: a long sideways run over a short drop reads as a kink. */
function cramp(c: Cubic, arrive: Dir) {
  const dx = Math.abs(c[3].x - c[0].x);
  const dy = Math.abs(c[3].y - c[0].y);
  if (arrive === "down") return Math.max(0, dx / Math.max(dy, 1) - 2.2) * 140;
  return Math.max(0, Math.max(dx, dy) / Math.max(Math.min(dx, dy), 1) - 4) * 50;
}

function toPath(pieces: Piece[]) {
  const f = (n: number) => Math.round(n * 10) / 10;
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

/** Hits of a vertical run at x from y0 to y1, in samples (so it weighs like a sampled curve). */
function runHits(x: number, y0: number, y1: number, obstacles: Box[]) {
  let hits = 0;
  for (const b of obstacles) {
    if (x <= b.x0 - CLEARANCE || x >= b.x1 + CLEARANCE) continue;
    const overlap = Math.min(y1, b.y1 + CLEARANCE) - Math.max(y0, b.y0 - CLEARANCE);
    if (overlap > 0) hits += Math.ceil(overlap / STEP);
  }
  return hits;
}

interface Curve {
  c: Cubic;
  length: number;
  cost: number;
}

/** Hits of a horizontal run at y from x0 to x1, in samples. */
function rowHits(y: number, x0: number, x1: number, obstacles: Box[]) {
  const [lo, hi] = x0 < x1 ? [x0, x1] : [x1, x0];
  let hits = 0;
  for (const b of obstacles) {
    if (y <= b.y0 - CLEARANCE || y >= b.y1 + CLEARANCE) continue;
    const overlap = Math.min(hi, b.x1 + CLEARANCE) - Math.max(lo, b.x0 - CLEARANCE);
    if (overlap > 0) hits += Math.ceil(overlap / STEP);
  }
  return hits;
}

/** Radius of a corridor's two turns (px), and the cubic handle of a quarter circle. */
const TURN = 32;
const KAPPA = 0.5523;

/**
 * The best hop from any of `outs` to any of `ins`. Tried in order of
 * simplicity: one cubic; a cubic into a vertical lane, the lane, a cubic
 * out of it; and only when neither is clear, a corridor: down one lane,
 * a quarter turn into a level run across the page, a quarter turn down
 * another lane, and out (the hop from the end of one row of plates to the
 * start of the next, under the text between them).
 *
 * A hop may run through the artwork right round its own ports (the box
 * each port is in): that is the wire reaching it. Every other box counts.
 */
function hop(outs: Port[], ins: Port[], obstacles: Box[], from: Box[] | null, to: Box[] | null, width: number, lane: number) {
  type Best = { pieces: Piece[]; score: number; port: Port };
  let best = null as Best | null;
  const consider = (pieces: Piece[], score: number, port: Port) => {
    if (!best || score < best.score) best = { pieces, score, port };
  };

  // The middle of each page margin, where a phone has its only free lanes, then every 12px between
  // them on a phone (24px wider up). Nothing nearer the screen's edge: the wire runs inside the page.
  const grid = new Set<number>([lane, width - lane]);
  for (let x = lane + 12; x <= width - lane; x += width < 640 ? 12 : 24) grid.add(x);

  for (const p of outs) {
    const f = from?.filter((b) => inside(p, b, CLEARANCE)) ?? null;
    for (const q of ins) {
      const t = to?.filter((b) => inside(q, b, CLEARANCE)) ?? null;
      const runObstacles = obstacles.filter((b) => !f?.includes(b) && !t?.includes(b));
      const curve = (c: Cubic | null, arrive: Dir, ff: Box[] | null, tt: Box[] | null): Curve | null => {
        if (!c) return null;
        const pts = sample([{ kind: "cubic", c }]);
        return {
          c,
          length: pts[pts.length - 1].at,
          cost: cramp(c, arrive) + collisions(pts, obstacles, ff, tt) * 10000,
        };
      };
      const penalty = (p.penalty ?? 0) + (q.penalty ?? 0);

      const direct = curve(connector(p, p.dir, q, q.dir), q.dir, f, t);
      if (direct) consider([{ kind: "cubic", c: direct.c }], direct.length + direct.cost + penalty, q);
      // A clear, easy curve straight in is as short as a hop gets: no lane can beat it.
      if (direct && direct.cost === 0) continue;

      // Per lane, the cheapest way into it from p and out of it into q.
      const lanes = new Set<number>([...grid, p.x, q.x - 40, q.x + 40]);
      const intoAt = new Map<number, Curve>();
      const exitAt = new Map<number, Curve>();
      for (const x of lanes) {
        if (x < lane || x > width - lane) continue;
        const intos = SPANS.map((h) => curve(connector(p, p.dir, { x, y: p.y + h }, "down"), "down", f, null));
        const cheapest = (cs: (Curve | null)[]) =>
          cs.reduce<Curve | null>((m, c) => (c && (!m || c.length + c.cost < m.length + m.cost) ? c : m), null);
        const into = cheapest(intos);
        if (into) intoAt.set(x, into);
        if (q.dir === "right" && q.x - x < MIN_RUN) continue;
        if (q.dir === "left" && x - q.x < MIN_RUN) continue;
        const exits = SPANS.map((h) => curve(connector({ x, y: q.y - h }, "down", q, q.dir), q.dir, null, t));
        const exit = cheapest(exits);
        if (exit) exitAt.set(x, exit);
        for (const i of intos) {
          if (!i) continue;
          for (const e of exits) {
            if (!e) continue;
            const a = i.c[3];
            const b = e.c[0];
            if (b.y < a.y) continue;
            const score =
              i.length + (b.y - a.y) + e.length + i.cost + e.cost + penalty + runHits(x, a.y, b.y, runObstacles) * 10000;
            consider(
              [
                { kind: "cubic", c: i.c },
                { kind: "line", a, b },
                { kind: "cubic", c: e.c },
              ],
              score,
              q,
            );
          }
        }
      }

      if (best && best.score < 10000) continue;
      // A corridor, from lane xa (clear way in) to lane xb (clear way out), level at y.
      const clear = (m: Map<number, Curve>) => [...m].filter(([, c]) => c.cost < 10000);
      for (const [xa, into] of clear(intoAt)) {
        for (const [xb, exit] of clear(exitAt)) {
          if (Math.abs(xb - xa) < 2 * TURN) continue;
          const a = into.c[3];
          const b = exit.c[0];
          const s = Math.sign(xb - xa);
          for (let y = a.y + TURN; y <= b.y - TURN; y += STEP * 2) {
            const hits =
              runHits(xa, a.y, y, obstacles) + rowHits(y, xa, xb, obstacles) + runHits(xb, y, b.y, obstacles);
            if (hits) continue;
            const k = KAPPA * TURN;
            const score =
              into.length + (y - a.y) + Math.abs(xb - xa) + (b.y - y) + exit.length + into.cost + exit.cost + penalty;
            consider(
              [
                { kind: "cubic", c: into.c },
                { kind: "line", a, b: { x: xa, y: y - TURN } },
                {
                  kind: "cubic",
                  c: [
                    { x: xa, y: y - TURN },
                    { x: xa, y: y - TURN + k },
                    { x: xa + s * (TURN - k), y },
                    { x: xa + s * TURN, y },
                  ],
                },
                { kind: "line", a: { x: xa + s * TURN, y }, b: { x: xb - s * TURN, y } },
                {
                  kind: "cubic",
                  c: [
                    { x: xb - s * TURN, y },
                    { x: xb - s * TURN + s * k, y },
                    { x: xb, y: y + TURN - k },
                    { x: xb, y: y + TURN },
                  ],
                },
                { kind: "line", a: { x: xb, y: y + TURN }, b },
                { kind: "cubic", c: exit.c },
              ],
              score,
              q,
            );
            break;
          }
        }
      }
    }
  }
  return best!;
}

/**
 * Route the wire from `origin` through every stop. A stop with no outs ends
 * the wire. `obstacles` are text boxes; each stop's keepout is added for the
 * hops that do not start or end in it. `lane` is the middle of the page
 * margin, the outermost the wire may run; `reach` is how far below the
 * trigger line a port may be when the energy reaches it (px), so the head is
 * still on screen there.
 */
export function routeWire(origin: Pt, stops: Stop[], text: Box[], width: number, lane: number, reach: number): Wire {
  CLEARANCE = width < 640 ? 7 : 14;
  const segments: Segment[] = [];
  const arrivals: Arrival[] = [];
  const keys: Wire["keys"] = [];
  let at = 0;
  let outs: Port[] = [{ ...origin, dir: "down" }];
  let from: Box[] | null = null;
  let leaveY: number | undefined;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    // Only what lies between the hop's ends can be hit: its curves and runs never leave that band.
    const top = Math.min(...outs.map((p) => p.y)) - SPANS[SPANS.length - 1] - CLEARANCE;
    const bottom = Math.max(...stop.ins.map((q) => q.y)) + CLEARANCE;
    const obstacles = [...text, ...stops.flatMap((s) => s.keepout)].filter((b) => b.y1 > top && b.y0 < bottom);
    const best = hop(outs, stop.ins, obstacles, from, stop.keepout, width, lane);
    const points = sample(best.pieces);
    const length = points[points.length - 1].at;
    segments.push({ d: toPath(best.pieces), length, start: at, points });
    // The energy arrives when the port or the top of the artwork (EARLY) reaches the line, whichever is
    // first, so a plate builds as it comes on screen; but never while its port is more than `reach`
    // below the line, so a low port (the SEO baseline) is on screen when the energy lands on it.
    const y0 = Math.min(...stop.keepout.map((b) => b.y0));
    const y1 = Math.max(...stop.keepout.map((b) => b.y1));
    const arrive = stop.arriveY ?? Math.min(best.port.y, Math.max(y0 + EARLY * (y1 - y0), best.port.y - reach));
    keys.push({ y: leaveY ?? points[0].y, at }, { y: arrive, at: at + length });
    at += length;
    arrivals.push({ stop: i, port: stop.ins.indexOf(best.port), x: best.port.x, y: best.port.y, at });
    if (!stop.outs.length) break;
    // Inside the plate the head is hidden; it spends the plate's height there.
    const out = stop.outs.reduce((a, b) => (a.y > b.y ? a : b));
    at += Math.max(24, out.y - best.port.y);
    outs = stop.outs;
    from = stop.keepout;
    leaveY = stop.leaveY;
  }

  // Keep the keys monotonic so a scroll position maps to one head position.
  for (let i = 1; i < keys.length; i++) keys[i].y = Math.max(keys[i].y, keys[i - 1].y);
  return { segments, arrivals, keys, total: at };
}

/** Head position on the global length axis for a trigger line at y. */
export function headAt(keys: Wire["keys"], y: number) {
  if (!keys.length || y <= keys[0].y) return 0;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (y <= b.y) return b.y === a.y ? b.at : a.at + ((b.at - a.at) * (y - a.y)) / (b.y - a.y);
  }
  return keys[keys.length - 1].at;
}

/** The point at global length `at`, or null between segments (inside a plate). */
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
