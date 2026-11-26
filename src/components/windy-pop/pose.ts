/*
 * The sitting pose, as a bend of the standing dog (no imports, so tests can read it). Each point
 * is carried by the bones near it, so particles and lines keep their places as the dog rises.
 * All movement is in the y-z plane, in the finished model's space (after `settle`).
 */

type Point = [number, number, number];
/** [y, z] */
type Joint = readonly [number, number];

/** How far the trunk tips back about the shoulders to put the rump on the ground. */
export const SIT_PITCH = 0.75;
const SHOULDER: Joint = [0.82, 0.28];
/** The neck stays nearly upright: it takes only part of the trunk's tip. */
const NECK_ROOT: Joint = [0.98, 0.37];
const NECK_PITCH = SIT_PITCH * 0.28;

/** Rotation that carries +z (forwards) up towards +y. */
function rotate([y, z]: Joint, about: Joint, angle: number): Joint {
  const dy = y - about[0];
  const dz = z - about[1];
  return [about[0] + dy * Math.cos(angle) + dz * Math.sin(angle), about[1] + dz * Math.cos(angle) - dy * Math.sin(angle)];
}

const HIP: Joint = [0.78, -0.45];
const STIFLE: Joint = [0.37, -0.58];
const HOCK: Joint = [0.2, -0.68];
const PAW: Joint = [0.07, -0.61];
/** How far forward the hind paw slides to lie beside the forepaws. */
const FOOT_REACH = 0.74;

interface Bone {
  from: Joint;
  to: Joint;
  /** How thick the flesh round this bone is; points within it belong to it strongly. */
  radius: number;
  move: (p: Joint) => Joint;
  turn: number;
}

const trunk = (p: Joint) => rotate(p, SHOULDER, SIT_PITCH);
const neckBase = trunk(NECK_ROOT);

const BONES: Bone[] = [
  // The forelegs stay planted.
  { from: [0.58, 0.43], to: [0.06, 0.47], radius: 0.13, turn: 0, move: (p) => p },
  { from: [0.8, 0.28], to: [0.82, -0.42], radius: 0.34, turn: SIT_PITCH, move: trunk },
  {
    from: [1.08, 0.39],
    to: [1.38, 0.5],
    radius: 0.22,
    turn: NECK_PITCH,
    move: (p) => {
      const [y, z] = rotate(p, NECK_ROOT, NECK_PITCH);
      return [y + neckBase[0] - NECK_ROOT[0], z + neckBase[1] - NECK_ROOT[1]];
    },
  },
  // The haunch rolls down with the rump. The foot only slides, so no surface is ever twisted.
  { from: HIP, to: STIFLE, radius: 0.17, turn: SIT_PITCH, move: trunk },
  { from: HOCK, to: PAW, radius: 0.12, turn: 0, move: ([y, z]) => [y * 0.8, z + FOOT_REACH] },
];

function weights(y: number, z: number): number[] {
  const raw = BONES.map(({ from, to, radius }) => {
    const by = to[0] - from[0];
    const bz = to[1] - from[1];
    const t = Math.min(1, Math.max(0, ((y - from[0]) * by + (z - from[1]) * bz) / (by * by + bz * bz)));
    const outside = Math.max(0, Math.hypot(y - from[0] - by * t, z - from[1] - bz * t) - radius);
    return 1 / Math.pow(outside + 0.045, 3.4);
  });
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => w / total);
}

/** Where a point of the standing dog is when it sits. */
export function sitPoint([x, y, z]: Point): Point {
  const w = weights(y, z);
  let sy = 0;
  let sz = 0;
  let hind = 0;
  BONES.forEach((bone, i) => {
    const [my, mz] = bone.move([y, z]);
    sy += my * w[i];
    sz += mz * w[i];
    if (i >= 3) hind += w[i];
  });
  // Sitting haunches spread very slightly, and whatever meets the ground rests flat on it.
  return [x * (1 + 0.16 * hind * Math.min(1, Math.abs(x) / 0.2)), Math.max(y > 0.003 ? 0.006 : y, sy), sz];
}

/** The same bend applied to a surface normal at `at`. */
export function sitNormal([, y, z]: Point, [nx, ny, nz]: Point): Point {
  const w = weights(y, z);
  const turn = BONES.reduce((sum, bone, i) => sum + bone.turn * w[i], 0);
  const [ry, rz] = rotate([ny, nz], [0, 0], turn);
  return [nx, ry, rz];
}

// --- The walk ------------------------------------------------------------------------------------

/*
 * A small dog's trot: diagonal pairs of legs swing together about the shoulder and the hip, the
 * paw folding up as it comes forward. The swing itself is a vertex-shader bend (shaders.ts); this
 * decides, once per point, which leg carries it and how firmly, so the coat stays one piece.
 * Legs: 0 front left, 1 front right, 2 hind left, 3 hind right (left is -x). Trot pairs: 0 with 3,
 * 1 with 2.
 */
export const GAIT = {
  /**
   * [y, z] of the pivots, in the finished model's space: above the paws rather than at the
   * anatomical joints, so a paw rises by the same amount swung forwards or back.
   */
  shoulder: [0.68, 0.47] as Joint,
  hip: [0.66, -0.57] as Joint,
  /** Swing each way at a full trot, radians. */
  swing: 0.34,
  /** How high a paw lifts as it comes forward. */
  lift: 0.1,
  /** Strides per second. */
  cadence: 2.0,
} as const;

/** Pivot to ground: the leg's length, for keeping stance paws planted. */
export const LEG_LENGTH = (GAIT.shoulder[0] + GAIT.hip[0]) / 2;

/**
 * Ground covered per second for `amount` of gait: each paw sweeps 2·L·sin(swing) while it is down,
 * which is half of every stride. Moving the dog at exactly this speed keeps the paws from skating.
 */
export const trotSpeed = (amount: number) => 4 * LEG_LENGTH * Math.sin(GAIT.swing * amount) * GAIT.cadence;

const ramp = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

/** The middle of the hind leg at height y: stifle forward, hock back, paw forward again. */
const hindZ = (y: number) => (y > 0.365 ? mix(-0.58, -0.42, (y - 0.365) / 0.235) : y > 0.224 ? mix(-0.69, -0.58, (y - 0.224) / 0.141) : mix(-0.55, -0.69, (y - 0.05) / 0.174));

/** [leg, weight]: which leg carries a point of the standing dog, and how firmly (0 = the trunk). */
export function legOf([x, y, z]: Point): [number, number] {
  const front = z > -0.05;
  const side = x < 0 ? 0 : 1;
  const cx = front ? 0.25 : 0.3;
  const cz = front ? 0.44 + 0.07 * ramp(0.16, 0.04, y) : hindZ(y);
  const column = ramp(0.26, 0.17, Math.hypot(Math.abs(x) - cx, z - cz));
  const height = front ? ramp(0.68, 0.42, y) : ramp(0.66, 0.4, y);
  // Nothing on the midline moves, so the chest and belly never split between two legs.
  const weight = column * height * ramp(0.02, 0.09, Math.abs(x));
  return [(front ? 0 : 2) + side, weight];
}

/**
 * A leg's swing (radians, positive carries the paw forwards) and paw lift at stride phase `phase`,
 * for `amount` of gait. The paw is up while the leg comes forward and down while it pushes back.
 * Written into `out`, so the frame loop allocates nothing.
 */
export function legMotion(leg: number, phase: number, amount: number, out: [number, number] = [0, 0]): [number, number] {
  const p = phase + (leg === 0 || leg === 3 ? 0 : Math.PI);
  out[0] = GAIT.swing * amount * Math.sin(p);
  out[1] = GAIT.lift * amount * Math.pow(Math.max(0, Math.cos(p)), 1.5);
  return out;
}

/** How far the trunk drops so the planted paws stay on the ground as the legs swing. */
export const trotDrop = (phase: number, amount: number) => LEG_LENGTH * (1 - Math.cos(GAIT.swing * amount * Math.sin(phase)));

// --- Reactions ---------------------------------------------------------------------------------

/*
 * The names a page uses (WindyPopStage) and the numbers the scene receives (their index). Shared
 * here, with no imports, so the stage component does not pull three into the page's bundle.
 */
export const ATTENTIONS = ["idle", "listening", "thinking", "talking"] as const;
export const MOODS = ["neutral", "happy", "curious", "sorry", "excited"] as const;
export const CUES = ["wag", "hop", "tilt", "sneeze", "yawn"] as const;
export type Attention = (typeof ATTENTIONS)[number];
export type Mood = (typeof MOODS)[number];
export type CueName = (typeof CUES)[number];

/** How long each one-shot gesture lasts, seconds (same order as CUES). */
export const CUE_LENGTH = [1.8, 0.7, 1.7, 1.0, 2.3] as const;

/** 0 before `a`, rising to 1 by `b`, holding, falling back to 0 between `c` and `d`. */
export const bell = (t: number, a: number, b: number, c: number, d: number) => ramp(a, b, t) * (1 - ramp(c, d, t));

/**
 * The hop, at `t` seconds into it: [lift, crouch] in world units. A small crouch to gather, a low
 * arc, a soft landing that gives a little at the knees.
 */
export function hop(t: number, out: [number, number] = [0, 0]): [number, number] {
  const air = t > 0.16 && t < 0.5 ? Math.sin((Math.PI * (t - 0.16)) / 0.34) : 0;
  out[0] = 0.13 * air;
  out[1] = 0.034 * bell(t, 0, 0.13, 0.15, 0.22) + 0.022 * bell(t, 0.47, 0.53, 0.56, 0.7);
  return out;
}
