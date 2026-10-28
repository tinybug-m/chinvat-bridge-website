import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, Path, Shape, Vector2 } from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { MARK_RINGS, type Ring, pxToWorld } from "./mark-outline";

/*
 * The brand mark as a solid: the welded outline (both halves, one piece, no
 * internal faces at the seam) extruded along z and centred on the origin.
 * The mirror axis is x = 0. About 10k triangles with three bevel segments.
 */

export interface MarkGeometryOptions {
  /** Extrusion depth in world units (the mark is 10 units tall). */
  depth: number;
  /** Bevel size and thickness, world units. Keep it under ~0.1 or the narrow holes self-intersect. */
  bevel: number;
  bevelSegments?: number;
  /** Faces meeting at less than this angle share smoothed normals (degrees). */
  creaseAngle?: number;
}

const toVectors = (ring: Ring) => ring.map(([x, y]) => new Vector2(...pxToWorld(x, y)));

export function createMarkGeometry({ depth, bevel, bevelSegments = 3, creaseAngle = 40 }: MarkGeometryOptions) {
  const [outer, ...holes] = MARK_RINGS;
  const shape = new Shape(toVectors(outer));
  for (const hole of holes) shape.holes.push(new Path(toVectors(hole)));

  const extruded = new ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 1,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    // Pull the caps in by the bevel so the silhouette stays the traced outline.
    bevelOffset: -bevel,
    bevelSegments,
  });
  extruded.translate(0, 0, -depth / 2);
  // Rounded bevels and the ring nodes shade smoothly; real corners stay crisp.
  const geometry = toCreasedNormals(extruded, (creaseAngle * Math.PI) / 180);
  if (geometry !== extruded) extruded.dispose();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * The traced outline as line segments at depth `z` (outer edge and every
 * hole), for pencil lines that sit exactly on the silhouette.
 */
export function createMarkOutline(z: number) {
  const positions: number[] = [];
  for (const ring of MARK_RINGS) {
    for (let i = 0; i < ring.length; i++) {
      const [ax, ay] = pxToWorld(...ring[i]);
      const [bx, by] = pxToWorld(...ring[(i + 1) % ring.length]);
      positions.push(ax, ay, z, bx, by, z);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  return geometry;
}
