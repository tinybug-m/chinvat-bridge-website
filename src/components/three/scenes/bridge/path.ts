import { clamp } from "../../core/motion";
import { BRIDGE_PATH } from "./config";
import { mix, random, smooth } from "./math";

/*
 * Where every slab of the Bridge sits, built and loose. Pure numbers (no
 * three), so the 3D scene and the flat plates in Method lay out one and the
 * same path from the same config.
 */

export interface Pose {
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  roll: number;
  /** Scale on the built slab, per axis. */
  sx: number;
  sy: number;
  sz: number;
}

export interface SlabPoses {
  built: Pose;
  loose: Pose;
}

export interface PathLayout {
  count: number;
  /** Slab length plus the gap between built slabs. */
  pitch: number;
  /** x of the far end of the built deck. */
  deckEnd: number;
  /** Gap between the end of the deck and each plinth. */
  endGap: number;
  /** Height of the far plinth's top above the near one's. */
  rightTop: number;
  lift: (x: number) => number;
  slope: (x: number) => number;
  slabs: SlabPoses[];
}

export function bridgeLayout(): PathLayout {
  const P = BRIDGE_PATH;
  const rand = random(P.seed);
  const count = P.slabs;
  const pitch = P.length + P.closed;
  const deckEnd = P.lead + count * pitch - P.closed;

  // One profile for the whole path: a steady climb eased at both ends, so it starts low and keeps rising to the far plinth.
  const lift = (x: number) => {
    const u = clamp(x / deckEnd);
    return P.rise * (P.climb * u + (1 - P.climb) * u * u * (3 - 2 * u));
  };
  const slope = (x: number) => {
    const u = clamp(x / deckEnd);
    return (P.rise * (P.climb + (1 - P.climb) * 6 * u * (1 - u))) / deckEnd;
  };

  // Loose slabs sit far apart near the start and close up toward the end; the row is then fitted back
  // between the same first and last slab as the built deck, so both states reach the same plinths.
  const looseCentres: number[] = [];
  let looseReach = 0;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const length = P.length * mix(P.looseLength[0], P.looseLength[1], t);
    if (i > 0) {
      const before = P.length * mix(P.looseLength[0], P.looseLength[1], (i - 1) / (count - 1));
      looseReach += (before + length) / 2 + mix(P.looseGap[0], P.looseGap[1], smooth((t - 0.1) / 0.8));
    }
    looseCentres.push(looseReach);
  }
  const firstX = P.lead + P.length / 2;
  const looseFit = ((count - 1) * pitch) / looseReach;

  const slabs: SlabPoses[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = P.lead + i * pitch + P.length / 2;
    const built: Pose = {
      x,
      y: -P.thickness / 2 + lift(x),
      z: 0,
      pitch: 0,
      yaw: 0,
      roll: Math.atan(slope(x)),
      sx: 1,
      sy: 1,
      sz: 1,
    };

    // The drawn state is a little less loose toward the far end, so the path still leans somewhere.
    const looseness = mix(1, 0.55, t);
    const jitterX = (rand() - 0.5) * 2;
    const jitterY = (rand() - 0.5) * 2;
    const jitterZ = (rand() - 0.5) * 2;
    const jitterYaw = (rand() - 0.5) * 2;
    const sy = mix(P.looseThickness[0], P.looseThickness[1], t);
    const looseX = firstX + looseCentres[i] * looseFit + jitterX * 0.1 * looseness;
    const loose: Pose = {
      x: looseX,
      y: (-P.thickness * sy) / 2 - looseness * (0.12 + 0.5 * Math.abs(jitterY)) + looseness * jitterY * 0.1 + lift(looseX),
      z: looseness * jitterZ * 1.2,
      pitch: 0,
      yaw: looseness * jitterYaw * 0.75,
      roll: 0,
      sx: mix(P.looseLength[0], P.looseLength[1], t),
      sy,
      sz: mix(P.looseDepth[0], P.looseDepth[1], t),
    };
    slabs.push({ built, loose });
  }
  // A few slabs are visibly tilted, so the loose state reads as unfinished rather than merely sparse.
  slabs[1].loose.roll = 0.2;
  slabs[3].loose.pitch = -0.17;
  slabs[3].loose.yaw += 0.22;
  slabs[5].loose.roll = -0.14;
  slabs[6].loose.pitch = 0.1;

  return { count, pitch, deckEnd, endGap: 0.07, rightTop: P.rise, lift, slope, slabs };
}

type Vec = [number, number, number];

export interface Framing {
  /** Where the camera looks, world units (the path is centred on x = 0). */
  target: Vec;
  /** Camera distance from the target along the azimuth and elevation of BRIDGE_PATH. */
  distance: number;
}

/**
 * The one camera framing of the path, solved at the reference aspect: the two plinth ends land
 * symmetrically about the middle of the stage, and the path sits in the middle of its height, so
 * moderately wide stages crop only empty space. The 3D scene and the flat plates in Method both use it.
 */
export function bridgeFraming(layout: PathLayout): Framing {
  const P = BRIDGE_PATH;
  const { deckEnd, endGap, rightTop } = layout;
  const halfHeight = Math.tan((P.fov * Math.PI) / 360);
  const referenceTan = halfHeight * P.referenceAspect;
  const span = deckEnd + 2 * P.plinthLength + 1.1;

  const offset = -deckEnd / 2;
  const near: Vec = [offset - endGap - P.plinthLength - 0.3, 0, P.plinthDepth / 2];
  const far: Vec = [offset + deckEnd + endGap + P.plinthLength, rightTop, -P.plinthDepth / 2];
  const low: Vec = [near[0], -P.plinthHeight / 2, near[2]];

  const target: Vec = [0, -0.6 + P.rise * 0.5, 0];
  let distance = span / (P.fit * 2 * referenceTan);

  // Camera basis for the current target and distance, and a point's image-plane position (ndc) in it.
  const view = () => {
    const eye: Vec = [
      target[0] - distance * Math.sin(P.azimuth) * Math.cos(P.elevation),
      target[1] + distance * Math.sin(P.elevation),
      target[2] + distance * Math.cos(P.azimuth) * Math.cos(P.elevation),
    ];
    const back = unit(sub(eye, target));
    const right = unit(cross([0, 1, 0], back));
    const up = cross(back, right);
    const ndc = (point: Vec): [number, number] => {
      const ray = sub(point, eye);
      const depth = -dot(ray, back);
      return [dot(ray, right) / depth / referenceTan, dot(ray, up) / depth / halfHeight];
    };
    return { right, up, ndc };
  };

  for (let pass = 0; pass < 6; pass++) {
    const { right, up, ndc } = view();
    const a = ndc(near);
    const b = ndc(far);
    const bottom = ndc(low);
    distance *= (b[0] - a[0]) / (2 * P.fit);
    const shiftRight = ((a[0] + b[0]) / 2) * distance * referenceTan;
    const shiftUp = ((bottom[1] + b[1]) / 2) * distance * halfHeight;
    for (let axis = 0; axis < 3; axis++) target[axis] += right[axis] * shiftRight + up[axis] * shiftUp;
  }
  return { target, distance };
}

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec): Vec => {
  const length = Math.hypot(...a);
  return [a[0] / length, a[1] / length, a[2] / length];
};
