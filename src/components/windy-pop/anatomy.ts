/*
 * Windy Pup's anatomy: a Shih Tzu x West Highland White Terrier, as pure data and functions
 * (no imports, so tests can read it directly).
 *
 * Space: y up, +z towards the nose, x lateral; the ground is y = 0. Head and ear shapes are in
 * their own local space so the scene can move them.
 *
 *   Shih Tzu: broad round skull, short full muzzle, wide-set dark eyes, scruffy moustache,
 *             compact body.
 *   Westie:   sturdy terrier legs, rounded head coat, alert carriage, raised tail.
 * Proportions and ears follow the owner's photograph of a real dog of this mix: a short soft
 * trim, and warm-coloured ears that stand at the root and fold over.
 */

export type Vec3 = [number, number, number];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a: Vec3): Vec3 => {
  const l = length(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export type Sdf = (p: Vec3) => number;

// --- Signed distance primitives -----------------------------------------------------------

function ellipsoid(p: Vec3, c: Vec3, r: Vec3): number {
  const x = p[0] - c[0];
  const y = p[1] - c[1];
  const z = p[2] - c[2];
  const k0 = Math.hypot(x / r[0], y / r[1], z / r[2]);
  const k1 = Math.hypot(x / (r[0] * r[0]), y / (r[1] * r[1]), z / (r[2] * r[2]));
  return k1 === 0 ? -Math.min(r[0], r[1], r[2]) : (k0 * (k0 - 1)) / k1;
}

/** A capsule whose radius tapers from `ra` at `a` to `rb` at `b`. */
function taper(p: Vec3, a: Vec3, b: Vec3, ra: number, rb: number): number {
  const ab = sub(b, a);
  const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / dot(ab, ab)));
  return length(sub(p, add(a, mul(ab, t)))) - (ra + (rb - ra) * t);
}

function smin(a: number, b: number, k: number): number {
  const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k));
  return b + (a - b) * h - k * h * (1 - h);
}

export function gradient(sdf: Sdf, p: Vec3): Vec3 {
  const e = 0.004;
  return normalize([
    sdf([p[0] + e, p[1], p[2]]) - sdf([p[0] - e, p[1], p[2]]),
    sdf([p[0], p[1] + e, p[2]]) - sdf([p[0], p[1] - e, p[2]]),
    sdf([p[0], p[1], p[2] + e]) - sdf([p[0], p[1], p[2] - e]),
  ]);
}

/** Moves a point near the surface onto it. */
export function project(sdf: Sdf, p: Vec3, iterations = 3): Vec3 {
  let q = p;
  for (let i = 0; i < iterations; i += 1) q = sub(q, mul(gradient(sdf, q), sdf(q)));
  return q;
}

/** First surface hit walking from `from` along `dir`; used to seat features on the face. */
export function raycast(sdf: Sdf, from: Vec3, dir: Vec3, maxDistance = 3): Vec3 {
  const d = normalize(dir);
  let travelled = 0;
  let p = from;
  for (let i = 0; i < 200 && travelled < maxDistance; i += 1) {
    const distance = sdf(p);
    if (distance < 0.0015) break;
    const step = Math.max(distance * 0.8, 0.001);
    travelled += step;
    p = add(from, mul(d, travelled));
  }
  return p;
}

// --- Head (local space: origin at the skull centre) ---------------------------------------

export const EYE = { x: 0.176, y: 0.052, radius: 0.056 } as const;
export const NOSE = { center: [0, -0.08, 0.498] as Vec3, radii: [0.092, 0.062, 0.048] as Vec3 };

/**
 * The closed mouth, drawn on the face in head-space x and y: a short philtrum down from the nose,
 * then on each side an upper lip that curves down and out and lifts again at the corner. The
 * dog's "ω": a soft, content mouth, never a level or falling line.
 */
export const MOUTH = { philtrum: -0.176, halfWidth: 0.12, drop: 0.046 } as const;
/** One side of the lip as a cubic Bézier in units of (halfWidth, drop), from the philtrum out. */
const LIP: readonly (readonly [number, number])[] = [
  [0.03, 0],
  [0.03, -1.1],
  [0.6, -1.26],
  [1, -0.36],
];

/** A point on the upper lip; `t` runs from -1 (left corner) through 0 (the philtrum) to 1. */
export function lipPoint(t: number): [number, number] {
  const u = Math.min(1, Math.abs(t));
  const s = 1 - u;
  const [a, b, c, d] = LIP;
  const x = s * s * s * a[0] + 3 * s * s * u * b[0] + 3 * s * u * u * c[0] + u * u * u * d[0];
  const y = s * s * s * a[1] + 3 * s * s * u * b[1] + 3 * s * u * u * c[1] + u * u * u * d[1];
  return [Math.sign(t || 1) * x * MOUTH.halfWidth, MOUTH.philtrum + y * MOUTH.drop];
}

/** The lip's height at `x` (the corner's height beyond the corners). */
export function lipY(x: number): number {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 22; i += 1) {
    const mid = (low + high) / 2;
    if (lipPoint(mid)[0] < Math.abs(x)) low = mid;
    else high = mid;
  }
  return lipPoint(low)[1];
}

/**
 * How far the jaw drops at `x`, from 1 in the middle to 0 at the mouth corners. The power keeps
 * the sides of the open mouth round instead of square.
 */
export const jawOpening = (x: number) => Math.pow(Math.max(0, 1 - (x / (MOUTH.halfWidth * 1.04)) ** 2), 0.45);

/** The lower lip: a soft curve from corner to corner, tucked behind the upper lips when closed. */
export function lowerLipY(x: number): number {
  const t = Math.min(1, Math.abs(x) / MOUTH.halfWidth);
  return lipPoint(1)[1] - 0.032 * (1 - t * t);
}

const ramp = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** How far a head-space point travels with the lower jaw when the mouth opens (0..1). */
export const jawWeight = ([x, y, z]: Vec3) => ramp(lowerLipY(x) + 0.004, lowerLipY(x) - 0.022, y) * ramp(0.1, 0.28, z) * jawOpening(x);

/** The skull, cheeks, short muzzle and chin, before the eye sockets. */
function headMass(p: Vec3): number {
  const x = Math.abs(p[0]);
  const m: Vec3 = [x, p[1], p[2]];
  // A skull broader than it is tall, widest low at the cheeks.
  let d = ellipsoid(m, [0, 0.03, -0.04], [0.4, 0.355, 0.37]);
  d = smin(d, ellipsoid(m, [0.185, -0.135, 0.07], [0.24, 0.19, 0.21]), 0.1);
  // Upper jaw: very short and broad, as flat-faced as a Shih Tzu with a little Westie length.
  d = smin(d, ellipsoid(m, [0, -0.13, 0.32], [0.175, 0.125, 0.18]), 0.06);
  // The two broad moustache pads either side of the nose.
  d = smin(d, taper(m, [0.07, -0.15, 0.4], [0.18, -0.2, 0.31], 0.1, 0.086), 0.08);
  // Lower jaw: a small, soft chin tucked under the moustache, rounded rather than square.
  d = smin(d, ellipsoid(m, [0, -0.268, 0.36], [0.1, 0.062, 0.075]), 0.07);
  d = smin(d, ellipsoid(m, [0, -0.262, 0.25], [0.16, 0.08, 0.16]), 0.07);
  // The soft width of the coat at the cheeks.
  d = smin(d, taper(m, [0.24, -0.1, 0.05], [0.31, -0.23, 0.04], 0.15, 0.095), 0.1);
  return d;
}

export const EYE_Z = raycast(headMass, [EYE.x, EYE.y, 1.2], [0, 0, -1])[2];

export const headSdf: Sdf = (p) => {
  const d = headMass(p);
  const socket = Math.hypot(Math.abs(p[0]) - EYE.x, p[1] - EYE.y, p[2] - (EYE_Z + 0.045)) - EYE.radius * 1.08;
  return -smin(-d, socket, 0.04); // smooth subtraction
};

export const HEAD_BOUNDS = { min: [-0.56, -0.48, -0.52] as Vec3, max: [0.56, 0.52, 0.66] as Vec3 };

// --- Body (model space) ---------------------------------------------------------------------

export const bodySdf: Sdf = (p) => {
  const m: Vec3 = [Math.abs(p[0]), p[1], p[2]];
  // Torso: deep chest, level back, a terrier's tuck-up behind the ribs.
  let d = ellipsoid(m, [0, 0.885, 0.25], [0.375, 0.42, 0.39]);
  d = smin(d, taper(m, [0, 0.89, 0.2], [0, 0.97, -0.4], 0.35, 0.285), 0.11);
  d = smin(d, ellipsoid(m, [0, 0.945, -0.47], [0.345, 0.34, 0.33]), 0.1);
  // Neck, carried upright like a terrier.
  d = smin(d, taper(m, [0, 1.03, 0.32], [0, 1.47, 0.5], 0.27, 0.2), 0.11);
  // Shoulder and haunch muscle.
  d = smin(d, taper(m, [0.2, 1.08, 0.22], [0.225, 0.72, 0.4], 0.14, 0.125), 0.07);
  d = smin(d, taper(m, [0.2, 1.03, -0.5], [0.255, 0.68, -0.4], 0.17, 0.13), 0.07);
  // The hang of the coat: a full chest and a soft line under the belly.
  d = smin(d, taper(m, [0.06, 0.98, 0.46], [0.08, 0.72, 0.5], 0.17, 0.09), 0.12);
  d = smin(d, taper(m, [0.17, 0.76, 0.24], [0.17, 0.77, -0.3], 0.17, 0.14), 0.12);
  // Short, straight forelegs with a defined wrist.
  d = smin(d, taper(m, [0.22, 0.78, 0.4], [0.232, 0.27, 0.44], 0.14, 0.104), 0.06);
  d = smin(d, taper(m, [0.232, 0.27, 0.44], [0.24, 0.1, 0.47], 0.104, 0.104), 0.03);
  // Hind legs: stifle forward, hock back.
  d = smin(d, taper(m, [0.245, 0.72, -0.42], [0.278, 0.44, -0.58], 0.172, 0.11), 0.06);
  d = smin(d, taper(m, [0.278, 0.44, -0.58], [0.28, 0.27, -0.69], 0.108, 0.082), 0.04);
  d = smin(d, taper(m, [0.28, 0.27, -0.69], [0.28, 0.1, -0.64], 0.082, 0.092), 0.03);
  // Paws with toes.
  for (const [x, z] of [
    [0.242, 0.505],
    [0.28, -0.6],
  ] as const) {
    d = smin(d, ellipsoid(m, [x, 0.074, z], [0.126, 0.074, 0.142]), 0.04);
    for (const toe of [-0.072, 0, 0.072]) d = smin(d, ellipsoid(m, [x + toe, 0.045, z + (toe ? 0.1 : 0.122)], [0.048, 0.048, 0.056]), 0.016);
  }
  return Math.max(d, -p[1]); // stand flat on the ground
};

export const BODY_BOUNDS = { min: [-0.6, -0.04, -0.98] as Vec3, max: [0.6, 1.76, 0.82] as Vec3 };

/**
 * The terrier's stance: shorter legs and a broader barrel than the shapes above are drawn at.
 * Applied to everything that lives in model space.
 */
export const settle = (p: Vec3): Vec3 => [p[0] * 1.08, p[1] < 0.7 ? p[1] * 0.83 : p[1] - 0.119, p[2]];

// --- Placement ------------------------------------------------------------------------------

/** Where the head turns (top of the neck), and the skull centre relative to it. */
export const HEAD_PIVOT: Vec3 = [0, 1.43, 0.48];
export const HEAD_OFFSET: Vec3 = [0, 0.22, 0.12];
export const HEAD_CENTER: Vec3 = add(HEAD_PIVOT, HEAD_OFFSET);
/** An adult's head to body ratio; a larger head reads as a puppy. */
export const HEAD_SCALE = 0.86;

// --- Ears -------------------------------------------------------------------------------------

/**
 * The ear's spine leaves the skull at `rootAngle` from vertical (leaning outwards) and has turned
 * to `tipAngle` by `turn` of its length: a drop ear. Set tipAngle equal to rootAngle (about 0.35)
 * for the fully upright, pricked Westie ear.
 */
export const EAR = { length: 0.54, halfWidth: 0.172, base: [0.29, 0.215, -0.03] as Vec3, rootAngle: 1.05, tipAngle: 2.95, turn: 0.55 } as const;

const earAngle = (v: number) => {
  const t = Math.min(1, v / EAR.turn);
  return EAR.rootAngle + (EAR.tipAngle - EAR.rootAngle) * t * t * (3 - 2 * t);
};

/** The spine of the ear: the sum of its heading over the first v of the length. */
function earSpine(v: number): Vec3 {
  const steps = 24;
  const ds = (v * EAR.length) / steps;
  let x = 0;
  let y = 0;
  for (let i = 0; i < steps; i += 1) {
    const angle = earAngle(((i + 0.5) / steps) * v);
    x += Math.sin(angle) * ds;
    y += Math.cos(angle) * ds;
  }
  return [x, y, 0.1 * v * v];
}

/**
 * The right ear (x outwards) as a parametric leaf: u across (-1..1), v from root to tip.
 * `front` is the face seen from outside, otherwise the side against the head.
 */
export function earPoint(u: number, v: number, front: boolean): Vec3 {
  const half = EAR.halfWidth * Math.pow(Math.max(0, 1 - v), 0.55) * (1 + 0.22 * Math.sin(Math.PI * v));
  const angle = earAngle(v);
  // Across the leaf: partly in the plane of the fold, partly front to back, so it presents forwards.
  const across = normalize([Math.cos(angle) * 0.6, -Math.sin(angle) * 0.6, 0.8]);
  const outward = normalize(cross(across, [Math.sin(angle), Math.cos(angle), 0]));
  const dome = (1 - u * u) * (1 - v * 0.7);
  return add(add(earSpine(v), mul(across, u * half)), mul(outward, (front ? 0.03 : -0.012) * dome));
}

/** Ear space to head space; `side` is -1 or 1. */
export function earToHead(p: Vec3, side: number): Vec3 {
  return [side * (p[0] + EAR.base[0]), p[1] + EAR.base[1], p[2] + EAR.base[2]];
}

// --- Tail ---------------------------------------------------------------------------------------

/** Raised from the rump and curling gently forward: between a Westie carrot and a Shih Tzu plume. */
export const TAIL_CURVE: [Vec3, Vec3, Vec3, Vec3] = [
  [0, 1.08, -0.7],
  [0, 1.35, -1.04],
  [0, 1.74, -1.03],
  [0, 1.83, -0.72],
];

export function tailPoint(t: number): Vec3 {
  const [a, b, c, d] = TAIL_CURVE;
  const s = 1 - t;
  return [0, 1, 2].map((i) => s * s * s * a[i] + 3 * s * s * t * b[i] + 3 * s * t * t * c[i] + t * t * t * d[i]) as Vec3;
}

/** Full in the middle like a brushed plume, closing to a soft tip. */
export const tailRadius = (t: number) => 0.11 * (1 - t) + 0.032 * t + 0.07 * Math.sin(Math.PI * t);

/** A point on the tail surface: t along it, angle around it. */
export function tailSurface(t: number, angle: number): { p: Vec3; n: Vec3 } {
  const c = tailPoint(t);
  const tangent = normalize(sub(tailPoint(Math.min(1, t + 0.01)), tailPoint(Math.max(0, t - 0.01))));
  const side: Vec3 = [1, 0, 0];
  const up = normalize(cross(tangent, side));
  const n = add(mul(side, Math.cos(angle)), mul(up, Math.sin(angle)));
  return { p: add(c, mul(n, tailRadius(t))), n };
}
