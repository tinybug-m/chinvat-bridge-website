import { BufferAttribute, BufferGeometry, DynamicDrawUsage, LineSegments, type Material, Mesh, Vector3 } from "three";
import { BRIDGE_PATH } from "../bridge/config";
import { mix } from "../bridge/math";
import type { PathLayout } from "../bridge/path";
import { staged } from "./rig";

/*
 * The Nine Spears family: long blades swept along the Approach's climb from
 * plinth to plinth. One buffer holds every blade of a mesh and is rewritten
 * only while the bridge changes. Each blade has its own place across the
 * deck (z), turn about its spine (roll), section size and lift, so the same
 * sweep makes a razor, a fanned deck, a stack of lances or an ink outline.
 */

export const BLADES = 9;
export const RINGS = 64;
/** Blade width that closes nine of them into a deck as wide as the Approach's slabs. */
export const BLADE_WIDTH = BRIDGE_PATH.depth / BLADES - 0.02;

export type Section = [number, number][];

/** Hexagon with flat top and bottom and knife edges, clockwise across (side, up), unit size. */
export const KNIFE: Section = [
  [0.5, 0.1],
  [0.4, -0.5],
  [-0.4, -0.5],
  [-0.5, 0.1],
  [-0.42, 0.5],
  [0.42, 0.5],
];

/** A finer knife: a long taper to each edge, like a lens. */
export const LENS: Section = [
  [0.5, 0],
  [0.22, -0.5],
  [-0.22, -0.5],
  [-0.5, 0],
  [-0.22, 0.5],
  [0.22, 0.5],
];

/** A round shaft, clockwise. */
export const ROUND: Section = Array.from({ length: 12 }, (_, k) => {
  const a = (-k / 12) * Math.PI * 2;
  return [0.5 * Math.cos(a), 0.5 * Math.sin(a)] as [number, number];
});

/** A thin flat strip (inlays and joints). */
export const STRIP: Section = [
  [0.5, -0.5],
  [-0.5, -0.5],
  [-0.5, 0.5],
  [0.5, 0.5],
];

export interface Blade {
  /** Across the deck. */
  z: number;
  /** Turn about the blade's own spine, radians. */
  roll: number;
  width: number;
  thick: number;
  /** Lift along the section's up (from the path's deck line). */
  offset: number;
}

export interface Frame {
  x: number;
  centre: Vector3;
  tangent: Vector3;
  up: Vector3;
}

/** The deck line's frame at each ring, from just inside one plinth to the other; `thick` sets where the spine sits below the top. */
export function bladeFrames(layout: PathLayout, thick: number, from = -0.02, to = layout.deckEnd + 0.02): Frame[] {
  const { lift, slope, deckEnd } = layout;
  return Array.from({ length: RINGS }, (_, ring) => {
    const x = mix(from, to, ring / (RINGS - 1));
    const at = Math.min(deckEnd, Math.max(0, x));
    const m = x === at ? slope(at) : 0;
    const n = Math.hypot(1, m);
    return {
      x,
      centre: new Vector3(x, lift(at) - thick / 2, 0),
      tangent: new Vector3(1 / n, m / n, 0),
      up: new Vector3(-m / n, 1 / n, 0),
    };
  });
}

/** Centre blade first, then each pair outward: the order the bridge widens in. */
export function widening(built: number, index: number, spread = 1.2) {
  const rank = index - (BLADES - 1) / 2;
  return { rank, p: staged(built, Math.abs(rank) / ((BLADES - 1) / 2), spread) };
}

const across = new Vector3(0, 0, 1);

/**
 * A mesh of `count` swept blades with the given section, plus `write(blades)`. With `outline`,
 * a LineSegments of the section's corner rails and both end rings is kept in step (ink drawing).
 */
export function createBlades(frames: Frame[], count: number, section: Section, material: Material, outline?: Material) {
  const sides = section.length;
  const perRing = sides * 2;
  const perCap = sides + 1;
  const perBlade = frames.length * perRing + perCap * 2;
  const vertices = count * perBlade;

  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(vertices * 3), 3).setUsage(DynamicDrawUsage);
  const normals = new BufferAttribute(new Float32Array(vertices * 3), 3).setUsage(DynamicDrawUsage);
  const uvs = new BufferAttribute(new Float32Array(vertices * 2), 2).setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", position);
  geometry.setAttribute("normal", normals);
  geometry.setAttribute("uv", uvs);
  const index: number[] = [];
  for (let blade = 0; blade < count; blade++) {
    const base = blade * perBlade;
    for (let ring = 0; ring < frames.length - 1; ring++) {
      for (let side = 0; side < sides; side++) {
        const a = base + ring * perRing + side * 2;
        const b = a + 1;
        index.push(a, b, a + perRing, b, b + perRing, a + perRing);
      }
    }
    // End caps: fans from the centre, wound to face out of each end.
    const start = base + frames.length * perRing;
    const end = start + perCap;
    for (let k = 0; k < sides; k++) {
      const next = (k + 1) % sides;
      index.push(start, start + 1 + next, start + 1 + k);
      index.push(end, end + 1 + k, end + 1 + next);
    }
  }
  geometry.setIndex(index);
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;

  // Ink rails: one per corner along the length, and the section at both ends.
  let lines: LineSegments | null = null;
  let linePosition: BufferAttribute | null = null;
  if (outline) {
    const segments = count * (sides * (frames.length - 1) + sides * 2);
    linePosition = new BufferAttribute(new Float32Array(segments * 6), 3).setUsage(DynamicDrawUsage);
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute("position", linePosition);
    lines = new LineSegments(lineGeometry, outline);
    lines.frustumCulled = false;
  }

  const side = new Vector3();
  const up = new Vector3();
  const point = new Vector3();
  const normal = new Vector3();
  const rings: Vector3[][] = frames.map(() => section.map(() => new Vector3()));

  function write(list: Blade[]) {
    let line = 0;
    list.forEach((blade, b) => {
      const base = b * perBlade;
      const cos = Math.cos(blade.roll);
      const sin = Math.sin(blade.roll);
      frames.forEach((frame, ring) => {
        side.copy(across).multiplyScalar(cos).addScaledVector(frame.up, sin);
        up.copy(frame.up).multiplyScalar(cos).addScaledVector(across, -sin);
        const corners = rings[ring];
        section.forEach(([s, u], k) =>
          corners[k]
            .copy(frame.centre)
            .addScaledVector(across, blade.z)
            .addScaledVector(up, blade.offset + u * blade.thick)
            .addScaledVector(side, s * blade.width),
        );
        for (let k = 0; k < sides; k++) {
          const next = (k + 1) % sides;
          // Outward normal of a clockwise edge (ds, du) is (-du, ds) across (side, up).
          const ds = (section[next][0] - section[k][0]) * blade.width;
          const du = (section[next][1] - section[k][1]) * blade.thick;
          normal.copy(side).multiplyScalar(-du).addScaledVector(up, ds).normalize();
          for (const [slot, c] of [
            [0, k],
            [1, next],
          ] as const) {
            const at = base + ring * perRing + k * 2 + slot;
            position.setXYZ(at, corners[c].x, corners[c].y, corners[c].z);
            normals.setXYZ(at, normal.x, normal.y, normal.z);
            uvs.setXY(at, frame.x * 0.2, (blade.z + section[c][0] * blade.width) * 0.2);
          }
        }
        if (ring === 0 || ring === frames.length - 1) {
          const at = base + frames.length * perRing + (ring === 0 ? 0 : perCap);
          const facing = ring === 0 ? -1 : 1;
          point.copy(frame.centre).addScaledVector(across, blade.z).addScaledVector(up, blade.offset);
          position.setXYZ(at, point.x, point.y, point.z);
          for (let k = 0; k < sides; k++) position.setXYZ(at + 1 + k, corners[k].x, corners[k].y, corners[k].z);
          for (let k = 0; k <= sides; k++) {
            normals.setXYZ(at + k, frame.tangent.x * facing, frame.tangent.y * facing, 0);
            uvs.setXY(at + k, 0, 0);
          }
        }
      });
      if (linePosition) {
        const segment = (a: Vector3, c: Vector3) => {
          linePosition!.setXYZ(line++, a.x, a.y, a.z);
          linePosition!.setXYZ(line++, c.x, c.y, c.z);
        };
        for (let k = 0; k < sides; k++) {
          for (let ring = 0; ring < frames.length - 1; ring++) segment(rings[ring][k], rings[ring + 1][k]);
          segment(rings[0][k], rings[0][(k + 1) % sides]);
          segment(rings[frames.length - 1][k], rings[frames.length - 1][(k + 1) % sides]);
        }
      }
    });
    position.needsUpdate = true;
    normals.needsUpdate = true;
    uvs.needsUpdate = true;
    if (linePosition) linePosition.needsUpdate = true;
  }

  return { mesh, lines, write };
}
