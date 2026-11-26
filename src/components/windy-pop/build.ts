/*
 * Turns the anatomy into drawable data. The dog's material is a network of light:
 *   - nodes spread evenly over the skin and joined into an irregular triangulated mesh,
 *   - very fine dust on the surface, which gathers into a bright silhouette,
 *   - a coat shown only as loose depth of that dust: no hair strands,
 *   - a few square data fragments, two quiet double helices, and a dark inner volume.
 * Deterministic (seeded), so every visit builds the same dog.
 */

import {
  type Sdf,
  type Vec3,
  BODY_BOUNDS,
  EAR,
  EYE,
  EYE_Z,
  HEAD_BOUNDS,
  HEAD_CENTER,
  HEAD_SCALE,
  MOUTH,
  NOSE,
  add,
  bodySdf,
  cross,
  dot,
  earPoint,
  earToHead,
  gradient,
  headSdf,
  length,
  lipPoint,
  lerp,
  mul,
  normalize,
  project,
  raycast,
  settle,
  sub,
  tailPoint,
  tailRadius,
  tailSurface,
} from "./anatomy";
import { sitNormal, sitPoint } from "./pose";

export type PartName = "body" | "head" | "earL" | "earR" | "tail";

/** Colours are authored in sRGB and written to the screen as they are. */
export const COLOURS = {
  /** Node cores and the brightest dust. */
  ice: [0.84, 0.97, 1.0] as Vec3,
  /** The brand's cyan sheen: dust and silhouette. */
  cyan: [0.3, 0.82, 0.95] as Vec3,
  /** Cerulean: the network lines. */
  azure: [0.2, 0.64, 0.84] as Vec3,
  deep: [0.1, 0.42, 0.62] as Vec3,
  /** The brand's second colour: the ears' markings, the collar, a few nodes. */
  saffron: [0.93, 0.73, 0.38] as Vec3,
  cream: [1.0, 0.91, 0.72] as Vec3,
};

/** Seconds at which each region's particles set off, so the dog reads head first, tail last. */
const ARRIVAL = { head: 0.12, ears: 0.28, face: 0.42, body: 0.55, tail: 0.8 };
export const TRAVEL = 1.15;

interface Dot {
  p: Vec3;
  n?: Vec3;
  colour: Vec3;
  size: number;
  alpha: number;
  delay: number;
  /** Wind sway amplitude. */
  sway?: number;
  /** Arc position, for the light travelling along lines. */
  flow?: number;
  /** 1 = lit almost only where the surface turns away: the silhouette dust. */
  edge?: number;
  /** A square data fragment instead of a round particle. */
  square?: number;
  /** Place and normal when sitting; absent where the part itself moves instead. */
  sit?: Vec3;
  sitN?: Vec3;
}

export interface PartData {
  points: Dot[];
  /** Pairs: every two entries are one segment. */
  lines: Dot[];
  mesh: { positions: number[]; normals: number[]; indices: number[]; sit?: number[]; sitNormals?: number[] };
}

export type DogData = Record<PartName, PartData>;

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Spatial hash for "is anything within d of p". */
function proximity(cell: number) {
  const map = new Map<string, { p: Vec3; id: number }[]>();
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  return {
    add(p: Vec3, id: number) {
      const k = key(Math.floor(p[0] / cell), Math.floor(p[1] / cell), Math.floor(p[2] / cell));
      const list = map.get(k);
      if (list) list.push({ p, id });
      else map.set(k, [{ p, id }]);
    },
    near(p: Vec3, distance: number, ignore = -1): { p: Vec3; id: number } | null {
      const reach = Math.ceil(distance / cell);
      const cx = Math.floor(p[0] / cell);
      const cy = Math.floor(p[1] / cell);
      const cz = Math.floor(p[2] / cell);
      for (let x = cx - reach; x <= cx + reach; x += 1)
        for (let y = cy - reach; y <= cy + reach; y += 1)
          for (let z = cz - reach; z <= cz + reach; z += 1)
            for (const item of map.get(key(x, y, z)) ?? [])
              if (item.id !== ignore && length(sub(item.p, p)) < distance) return item;
      return null;
    },
  };
}

// --- Meshing (surface nets) ---------------------------------------------------------------------

function surfaceNets(sdf: Sdf, min: Vec3, max: Vec3, h: number) {
  const nx = Math.ceil((max[0] - min[0]) / h) + 1;
  const ny = Math.ceil((max[1] - min[1]) / h) + 1;
  const nz = Math.ceil((max[2] - min[2]) / h) + 1;
  const values = new Float32Array(nx * ny * nz);
  const at = (x: number, y: number, z: number) => x + nx * (y + ny * z);
  for (let z = 0; z < nz; z += 1)
    for (let y = 0; y < ny; y += 1)
      for (let x = 0; x < nx; x += 1) values[at(x, y, z)] = sdf([min[0] + x * h, min[1] + y * h, min[2] + z * h]);

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const vertexOf = new Int32Array(nx * ny * nz).fill(-1);
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [i & 1, (i >> 1) & 1, (i >> 2) & 1]);
  const edges: [number, number][] = [];
  for (let a = 0; a < 8; a += 1) for (const bit of [1, 2, 4]) if (!(a & bit)) edges.push([a, a | bit]);

  for (let z = 0; z < nz - 1; z += 1)
    for (let y = 0; y < ny - 1; y += 1)
      for (let x = 0; x < nx - 1; x += 1) {
        const v = corners.map(([dx, dy, dz]) => values[at(x + dx, y + dy, z + dz)]);
        const sum: Vec3 = [0, 0, 0];
        let crossings = 0;
        for (const [a, b] of edges) {
          if (v[a] < 0 === v[b] < 0) continue;
          const t = v[a] / (v[a] - v[b]);
          for (let i = 0; i < 3; i += 1) sum[i] += corners[a][i] + (corners[b][i] - corners[a][i]) * t;
          crossings += 1;
        }
        if (!crossings) continue;
        const p: Vec3 = [min[0] + (x + sum[0] / crossings) * h, min[1] + (y + sum[1] / crossings) * h, min[2] + (z + sum[2] / crossings) * h];
        vertexOf[at(x, y, z)] = positions.length / 3;
        positions.push(...p);
        normals.push(...gradient(sdf, p));
      }

  // One quad per grid edge that crosses the surface, joining the four cells around it.
  const dims = [nx, ny, nz];
  const unit = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  for (let z = 0; z < nz; z += 1)
    for (let y = 0; y < ny; y += 1)
      for (let x = 0; x < nx; x += 1)
        for (let axis = 0; axis < 3; axis += 1) {
          const c = [x, y, z];
          const u = (axis + 1) % 3;
          const w = (axis + 2) % 3;
          if (c[axis] >= dims[axis] - 1 || c[u] === 0 || c[w] === 0 || c[u] >= dims[u] - 1 || c[w] >= dims[w] - 1) continue;
          const a = values[at(x, y, z)];
          const b = values[at(x + unit[axis][0], y + unit[axis][1], z + unit[axis][2])];
          if (a < 0 === b < 0) continue;
          const quad = [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ].map(([du, dw]) => {
            const q = [x, y, z];
            q[u] -= 1 - du;
            q[w] -= 1 - dw;
            return vertexOf[at(q[0], q[1], q[2])];
          });
          if (quad.some((i) => i < 0)) continue;
          if (a < 0) indices.push(quad[0], quad[1], quad[2], quad[0], quad[2], quad[3]);
          else indices.push(quad[0], quad[2], quad[1], quad[0], quad[3], quad[2]);
        }
  return { positions, normals, indices };
}

// --- Surface sampling -----------------------------------------------------------------------

interface Mesh {
  positions: number[];
  normals: number[];
  indices: number[];
}

/** Area-weighted random points (with normals) over a mesh. */
function sampler(mesh: Mesh, random: () => number) {
  const vertex = (list: number[], i: number): Vec3 => [list[i * 3], list[i * 3 + 1], list[i * 3 + 2]];
  const cumulative: number[] = [];
  let area = 0;
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const [a, b, c] = [0, 1, 2].map((k) => vertex(mesh.positions, mesh.indices[i + k]));
    area += length(cross(sub(b, a), sub(c, a))) / 2;
    cumulative.push(area);
  }
  return {
    area,
    sample(): { p: Vec3; n: Vec3 } {
      const target = random() * area;
      let low = 0;
      let high = cumulative.length - 1;
      while (low < high) {
        const mid = (low + high) >> 1;
        if (cumulative[mid] < target) low = mid + 1;
        else high = mid;
      }
      let u = random();
      let v = random();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      const weights = [1 - u - v, u, v];
      const p: Vec3 = [0, 0, 0];
      const n: Vec3 = [0, 0, 0];
      weights.forEach((w, k) => {
        const i = mesh.indices[low * 3 + k];
        for (let axis = 0; axis < 3; axis += 1) {
          p[axis] += mesh.positions[i * 3 + axis] * w;
          n[axis] += mesh.normals[i * 3 + axis] * w;
        }
      });
      return { p, n: normalize(n) };
    },
  };
}

// --- Builder ------------------------------------------------------------------------------------

const emptyPart = (): PartData => ({ points: [], lines: [], mesh: { positions: [], normals: [], indices: [] } });

/** `density` is 1 on capable devices, lower on phones and weak GPUs. */
export function buildDog(density = 1): DogData {
  const random = seeded(20261125);
  const between = (a: number, b: number) => a + (b - a) * random();
  const dog: DogData = { body: emptyPart(), head: emptyPart(), earL: emptyPart(), earR: emptyPart(), tail: emptyPart() };
  const spread = 1 / Math.sqrt(density);
  const stagger = (base: number) => base + random() * 0.32;
  const jitter = (s: number): Vec3 => [between(-s, s), between(-s, s), between(-s, s)];
  const count = (n: number) => Math.round(n * density);

  const dotAt = (p: Vec3, colour: Vec3, size: number, alpha: number, delay: number, extra: Partial<Dot> = {}): Dot => ({
    p,
    colour,
    size,
    alpha,
    delay,
    ...extra,
  });
  const segment = (part: PartData, a: Dot, b: Dot, alpha: number) => {
    // A line appears once both of its particles have landed.
    const delay = Math.max(a.delay, b.delay);
    part.lines.push({ ...a, alpha: a.alpha * alpha, delay }, { ...b, alpha: b.alpha * alpha, delay });
  };

  // Head points live in head space; body points in model space.
  const bodyInHead = (p: Vec3) => bodySdf(add(mul(p, HEAD_SCALE), HEAD_CENTER));
  const headInModel = (p: Vec3) => headSdf(mul(sub(p, HEAD_CENTER), 1 / HEAD_SCALE)) * HEAD_SCALE;

  // Eyes and nose are kept clear so the face reads.
  const eyeCentres: Vec3[] = [-1, 1].map((s) => [s * EYE.x, EYE.y, EYE_Z]);
  const featureDistance = (p: Vec3) =>
    Math.min(
      ...eyeCentres.map((e) => length(sub(p, e)) - EYE.radius * 1.4),
      length(sub([p[0], p[1] * 1.25, p[2]], [0, NOSE.center[1] * 1.25, NOSE.center[2]])) - 0.088,
    );

  // --- The material: network, dust, halo and data fragments over one surface ---------------

  function skin(options: {
    part: PartData;
    mesh: Mesh;
    delay: number;
    /** Distance between network nodes. */
    spacing: (p: Vec3) => number;
    skip?: (p: Vec3) => boolean;
    /** Signed distance, used to keep chords from cutting across hollows. */
    sdf?: Sdf;
    dust?: number;
    halo?: number;
    /** Recolours this surface's particles (the ears' warm coat). */
    tint?: (colour: Vec3) => Vec3;
  }) {
    const { part, mesh, delay, spacing, sdf, skip = () => false, dust = 1, halo = 1, tint } = options;
    const from = part.points.length;
    const surface = sampler(mesh, random);
    const lift = (p: Vec3, n: Vec3, d: number) => add(p, mul(n, d));

    // Two nets: a bold, open one with glowing nodes, and a fine faint one underneath.
    for (const net of [
      { scale: 1, line: 0.5, links: 5, reach: 1.85, fine: false },
      { scale: 0.48, line: 0.17, links: 4, reach: 1.8, fine: true },
    ]) {
      const taken = proximity(0.07);
      const nodes: Dot[] = [];
      const normals: Vec3[] = [];
      const candidates = Math.round(surface.area * (net.fine ? 2600 : 900) * density);
      for (let i = 0; i < candidates; i += 1) {
        const { p, n } = surface.sample();
        const gap = spacing(p) * net.scale * spread;
        if (skip(p) || taken.near(p, gap)) continue;
        taken.add(p, nodes.length);
        const rank = random();
        const hub = !net.fine && rank > 0.9;
        const warm = !net.fine && rank < 0.018;
        const node = dotAt(
          lift(p, n, 0.006),
          warm ? COLOURS.saffron : hub || rank > 0.7 ? COLOURS.ice : COLOURS.cyan,
          net.fine ? 0.0062 : hub ? between(0.02, 0.029) : warm ? 0.019 : between(0.0095, 0.015),
          net.fine ? 0.5 : hub ? 1 : 0.8,
          stagger(delay),
          { n, flow: random() * 20 },
        );
        nodes.push(node);
        normals.push(n);
        part.points.push(node);
      }
      const joined = new Set<string>();
      nodes.forEach((node, i) => {
        const gap = spacing(node.p) * net.scale * spread;
        nodes
          .map((other, j) => ({ j, d: length(sub(other.p, node.p)) }))
          .filter(({ j, d }) => j !== i && d < gap * net.reach && dot(normals[i], normals[j]) > 0.25)
          .sort((a, b) => a.d - b.d)
          .slice(0, net.links)
          .forEach(({ j }) => {
            const key = i < j ? `${i}:${j}` : `${j}:${i}`;
            if (joined.has(key)) return;
            joined.add(key);
            if (sdf && Math.abs(sdf(lerp(node.p, nodes[j].p, 0.5))) > 0.03) return;
            segment(part, { ...node, colour: COLOURS.azure, alpha: 1 }, { ...nodes[j], colour: COLOURS.azure, alpha: 1 }, net.line);
          });
      });
    }

    // Dust: faint across the flanks, dense light wherever the surface turns away.
    for (let i = 0; i < Math.round(surface.area * 4300 * density * dust); i += 1) {
      const { p, n } = surface.sample();
      if (skip(p)) continue;
      const rank = random();
      part.points.push(
        dotAt(lift(p, n, between(-0.001, 0.009)), rank > 0.9 ? COLOURS.ice : rank > 0.35 ? COLOURS.cyan : COLOURS.deep, between(0.0032, 0.0056), between(0.45, 0.85), stagger(delay), {
          n,
          edge: 1,
          flow: random() * 20,
        }),
      );
    }
    // A soft bloom along the silhouette.
    for (let i = 0; i < Math.round(surface.area * 150 * density); i += 1) {
      const { p, n } = surface.sample();
      if (skip(p) || featureClose(part, p)) continue;
      part.points.push(dotAt(p, COLOURS.cyan, 0.055, 0.06, stagger(delay), { n, edge: 1 }));
    }
    // Loose particles drifting off the outline.
    for (let i = 0; i < Math.round(surface.area * 120 * density * halo); i += 1) {
      const { p, n } = surface.sample();
      if (skip(p)) continue;
      const distance = 0.012 + Math.pow(random(), 3.2) * 0.2;
      const fade = 1 - distance / 0.24;
      part.points.push(
        dotAt(add(lift(p, n, distance), jitter(0.015)), random() > 0.75 ? COLOURS.ice : COLOURS.cyan, between(0.0035, 0.009) * (0.5 + fade * 0.5), 0.16 + 0.55 * fade * random(), stagger(delay + 0.2), {
          sway: 0.008 + distance * 0.12,
          flow: random() * 20,
          square: random() > 0.9 ? 1 : 0,
        }),
      );
    }
    // Data fragments: a few small squares, and short runs of them like a line of read-out.
    for (let i = 0; i < Math.round(surface.area * 13 * density); i += 1) {
      const { p, n } = surface.sample();
      if (skip(p) || featureClose(part, p)) continue;
      const along = normalize(cross([0, 1, 0], n));
      const run = random() > 0.55 ? 3 + Math.floor(random() * 5) : 1;
      const base = lift(p, n, 0.012);
      const size = run === 1 ? between(0.009, 0.019) : 0.006;
      const at = stagger(delay + 0.25);
      const flow = random() * 20;
      for (let k = 0; k < run; k += 1) {
        if (run > 1 && random() < 0.2) continue;
        part.points.push(dotAt(add(base, mul(along, k * 0.0105)), COLOURS.cyan, size, between(0.28, 0.62), at, { n, square: 1, flow }));
      }
    }
    if (tint) for (const point of part.points.slice(from)) point.colour = tint(point.colour);
  }
  /** Larger glows and squares stay off the face. */
  function featureClose(part: PartData, p: Vec3) {
    return part === dog.head && featureDistance(p) < 0.07 && p[2] > 0.15;
  }

  const warmth = (colour: Vec3) => (colour === COLOURS.ice ? COLOURS.cream : random() > 0.3 ? COLOURS.saffron : COLOURS.cream);

  const curve = (part: PartData, path: Vec3[], colour: Vec3, size: number, alpha: number, delay: number, line = 0.7) => {
    let previous: Dot | null = null;
    path.forEach((p, i) => {
      const current = dotAt(p, colour, size, alpha, delay + random() * 0.25, { flow: i * 0.15 });
      part.points.push(current);
      if (previous) segment(part, previous, current, line);
      previous = current;
    });
  };
  const span = (n: number, f: (t: number) => Vec3) => Array.from({ length: n + 1 }, (_, i) => f(i / n));

  // --- Inner volume and the skin over it -----------------------------------------------------

  const h = density < 0.8 ? 0.032 : 0.025;
  dog.head.mesh = surfaceNets(headSdf, HEAD_BOUNDS.min, HEAD_BOUNDS.max, h);
  dog.body.mesh = surfaceNets(bodySdf, BODY_BOUNDS.min, BODY_BOUNDS.max, h);

  skin({
    part: dog.head,
    mesh: dog.head.mesh,
    sdf: headSdf,
    delay: ARRIVAL.head,
    spacing: (p) => (p[2] > 0.2 ? 0.07 : 0.095),
    skip: (p) => bodyInHead(p) < -0.025 || featureDistance(p) < 0,
    halo: 0.8,
  });
  skin({
    part: dog.body,
    mesh: dog.body.mesh,
    sdf: bodySdf,
    delay: ARRIVAL.body,
    spacing: (p) => (p[1] < 0.55 ? 0.08 : 0.135),
    skip: (p) => headInModel(p) < 0.012 || p[1] < 0.012,
  });

  const face = dog.head;
  const onFace = (x: number, y: number) => add(raycast(headSdf, [x, y, 1.3], [0, 0, -1]), [0, 0, 0.007]);

  // The coat: no strands, only a soft depth of loose particles that blurs the outline.
  function fuzz(part: PartData, mesh: Mesh, perUnit: number, depth: number, delay: number, skip: (p: Vec3) => boolean, tint?: Vec3) {
    const surface = sampler(mesh, random);
    for (let i = 0; i < Math.round(surface.area * perUnit * density); i += 1) {
      const { p, n } = surface.sample();
      if (skip(p)) continue;
      const out = Math.pow(random(), 1.6);
      part.points.push(
        dotAt(add(p, mul(n, 0.008 + out * depth)), tint && random() > 0.3 ? tint : random() > 0.85 ? COLOURS.ice : COLOURS.cyan, between(0.0032, 0.0056), 0.62 * (1 - out * 0.7), stagger(delay), {
          n,
          edge: 1,
          flow: random() * 20,
          sway: out * 0.006,
        }),
      );
    }
  }
  fuzz(dog.body, dog.body.mesh, 1500, 0.055, ARRIVAL.body + 0.1, (p) => headInModel(p) < 0.02 || p[1] < 0.03);
  fuzz(dog.head, dog.head.mesh, 1800, 0.05, ARRIVAL.head + 0.15, (p) => bodyInHead(p) < -0.02 || featureDistance(p) < 0.03);

  // The lines of the anatomy: shoulder and haunch, traced softly in dust.
  for (const s of [-1, 1]) {
    for (const [from, via, to] of [
      [[0.3, 1.22, 0.14], [0.5, 0.92, 0.22], [0.3, 0.64, 0.46]],
      [[0.22, 1.24, -0.46], [0.52, 0.86, -0.2], [0.32, 0.56, -0.54]],
    ] as Vec3[][]) {
      for (let i = 0; i < count(300); i += 1) {
        const t = random();
        const raw = add(lerp(lerp(from, via, t), lerp(via, to, t), t), jitter(0.012));
        const p = project(bodySdf, [raw[0] * s, raw[1], raw[2]], 6);
        const n = gradient(bodySdf, p);
        dog.body.points.push(
          dotAt(add(p, mul(n, 0.007)), random() > 0.8 ? COLOURS.ice : COLOURS.cyan, between(0.0035, 0.007), 0.5 * Math.sin(Math.PI * t) + 0.12, stagger(ARRIVAL.body + 0.1), { n, flow: t * 6 }),
        );
      }
    }
  }

  // --- Tail: a raised plume --------------------------------------------------------------------

  const tail = dog.tail;
  const rings = 40;
  const sides = 16;
  for (let r = 0; r <= rings; r += 1)
    for (let c = 0; c <= sides; c += 1) {
      const t = r / rings;
      const { p, n } = tailSurface(t, (c / sides) * Math.PI * 2);
      tail.mesh.positions.push(...p);
      tail.mesh.normals.push(...n);
    }
  for (let r = 0; r < rings; r += 1)
    for (let c = 0; c < sides; c += 1) {
      const a = r * (sides + 1) + c;
      const b = a + sides + 1;
      tail.mesh.indices.push(a, a + 1, b + 1, a, b + 1, b);
    }
  skin({ part: tail, mesh: tail.mesh, delay: ARRIVAL.tail, spacing: () => 0.085, skip: (p) => bodySdf(p) < -0.01, halo: 1.6 });
  fuzz(tail, tail.mesh, 2600, 0.085, ARRIVAL.tail + 0.15, (p) => bodySdf(p) < -0.01);
  // The tube is open at the end: close it with light.
  for (let i = 0; i < count(150); i += 1) {
    tail.points.push(dotAt(add(tailPoint(1), jitter(0.034)), random() > 0.6 ? COLOURS.ice : COLOURS.cyan, between(0.004, 0.008), between(0.35, 0.8), stagger(ARRIVAL.tail + 0.2), { flow: random() * 20 }));
  }

  // --- Ears: folded --------------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    const ear = side < 0 ? dog.earL : dog.earR;
    const toHead = (u: number, v: number, front: boolean) => earToHead(earPoint(u, v, front), side);
    const earNormal = (u: number, v: number, front: boolean): Vec3 => {
      const du = sub(toHead(Math.min(1, u + 0.02), v, front), toHead(Math.max(-1, u - 0.02), v, front));
      const dv = sub(toHead(u, Math.min(0.98, v + 0.02), front), toHead(u, Math.max(0, v - 0.02), front));
      return mul(normalize(cross(du, dv)), (front ? 1 : -1) * side);
    };
    const U = 12;
    const V = 18;
    for (const front of [true, false]) {
      const base = ear.mesh.positions.length / 3;
      for (let r = 0; r <= V; r += 1)
        for (let c = 0; c <= U; c += 1) {
          const u = -1 + (2 * c) / U;
          const v = (r / V) * 0.995;
          ear.mesh.positions.push(...toHead(u, v, front));
          ear.mesh.normals.push(...earNormal(u, v, front));
        }
      for (let r = 0; r < V; r += 1)
        for (let c = 0; c < U; c += 1) {
          const a = base + r * (U + 1) + c;
          const b = a + U + 1;
          // The mirrored ear winds the other way, so that faces still agree with their normals.
          if (front === side > 0) ear.mesh.indices.push(a, a + 1, b + 1, a, b + 1, b);
          else ear.mesh.indices.push(a, b + 1, a + 1, a, b, b + 1);
        }
    }
    skin({ part: ear, mesh: ear.mesh, delay: ARRIVAL.ears, spacing: () => 0.062, skip: (p) => headSdf(p) < -0.005, halo: 0.5, tint: warmth });

    // A soft but definite edge, so the shape of the fold reads.
    for (const edge of [-1, 1]) {
      curve(ear, span(34, (t) => toHead(edge, t, true)), COLOURS.cream, 0.007, 0.34, ARRIVAL.ears, 0.22);
      for (let i = 0; i < count(180); i += 1) {
        const v = random() * 0.99;
        ear.points.push(dotAt(add(toHead(edge * between(0.88, 1), v, true), jitter(0.008)), random() > 0.35 ? COLOURS.saffron : COLOURS.cream, between(0.004, 0.0075), between(0.3, 0.7), stagger(ARRIVAL.ears), { flow: v * 5 }));
      }
    }
    fuzz(ear, ear.mesh, 1500, 0.03, ARRIVAL.ears + 0.2, (p) => headSdf(p) < -0.005, COLOURS.saffron);
  }

  // --- The muzzle: denser, paler dust so it reads as a form of its own when seen head on --
  const muzzle = sampler(dog.head.mesh, random);
  for (let i = 0, placed = 0; i < 60000 && placed < count(700); i += 1) {
    const { p, n } = muzzle.sample();
    const d = Math.hypot(p[0] / 0.22, (p[1] + 0.2) / 0.14);
    if (p[2] < 0.36 || d > 1.05 || featureDistance(p) < 0) continue;
    placed += 1;
    face.points.push(dotAt(add(p, mul(n, 0.008)), random() > 0.6 ? COLOURS.ice : COLOURS.cyan, between(0.0035, 0.0062), between(0.18, 0.5), stagger(ARRIVAL.face), { n, flow: random() * 20 }));
  }

  // --- Nose, lips and jaw line, drawn with the same points and lines as the rest ------------

  const nose = NOSE;
  const onNose = (x: number, y: number): Vec3 => add(nose.center, [x * nose.radii[0], y * nose.radii[1], nose.radii[2] * Math.max(0.6, Math.sqrt(Math.max(0, 1 - x * x - y * y))) + 0.008]);
  // A broad shield of facets: the outline, then a few nodes joined across it.
  const rim = ([[-0.98, 0.22], [-0.6, 0.78], [0, 0.9], [0.6, 0.78], [0.98, 0.22], [0.62, -0.5], [0, -0.94], [-0.62, -0.5]] as const).map(([x, y]) => onNose(x, y));
  curve(face, [...rim, rim[0]], COLOURS.ice, 0.011, 0.9, ARRIVAL.face + 0.1, 0.75);
  const ridge = [onNose(0, 0.24), onNose(-0.45, -0.08), onNose(0.45, -0.08)];
  curve(face, [...ridge, ridge[0]], COLOURS.azure, 0.009, 0.8, ARRIVAL.face + 0.2, 0.5);
  for (const [a, b] of [[0, 1], [0, 2], [0, 3], [1, 0], [1, 7], [2, 4], [2, 5], [1, 6], [2, 6]] as const) {
    curve(face, [ridge[a], rim[b]], COLOURS.azure, 0.006, 0.5, ARRIVAL.face + 0.25, 0.45);
  }

  // A short philtrum, then the two upper lips curving down and out and lifting at the corners.
  const noseBottom = nose.center[1] - nose.radii[1] * 0.9;
  curve(face, span(5, (t) => onFace(0, noseBottom + (MOUTH.philtrum - noseBottom) * t)), COLOURS.ice, 0.0075, 0.6, ARRIVAL.face + 0.2, 0.55);
  for (const s of [-1, 1]) {
    const lip = span(22, (t) => onFace(...lipPoint(s * t)));
    curve(face, lip, COLOURS.ice, 0.0074, 0.75, ARRIVAL.face + 0.25, 0.7);
    // A brighter node where the lip turns up at the corner.
    face.points.push(dotAt(lip[lip.length - 1], COLOURS.ice, 0.012, 0.85, ARRIVAL.face + 0.3, { flow: random() * 20 }));
  }

  // --- DNA: a fine double helix as a collar, and one up the tail -----------------------------

  const helix = (part: PartData, path: (t: number) => Vec3, steps: number, radius: number, turns: number, delay: number, duration: number, alpha: number) => {
    const strands: Dot[][] = [[], []];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const centre = path(t);
      const tangent = normalize(sub(path(Math.min(1, t + 0.005)), path(Math.max(0, t - 0.005))));
      const side = normalize(cross(tangent, Math.abs(tangent[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0]));
      const up = cross(side, tangent);
      strands.forEach((strand, j) => {
        const a = t * turns * Math.PI * 2 + j * Math.PI;
        const p = add(centre, mul(add(mul(side, Math.cos(a)), mul(up, Math.sin(a))), radius));
        const current = dotAt(p, j ? COLOURS.saffron : COLOURS.cyan, 0.0065, alpha, delay + t * duration, { flow: t * turns * 2 });
        part.points.push(current);
        if (strand.length) segment(part, strand[strand.length - 1], current, 0.55);
        strand.push(current);
      });
      if (i % 3 === 0) segment(part, strands[0][i], strands[1][i], 0.35);
    }
  };

  helix(dog.tail, (t) => add(tailPoint(0.08 + t * 0.86), [tailRadius(0.08 + t * 0.86) + 0.012, 0, 0]), 80, 0.02, 3, ARRIVAL.tail + 0.2, 0.4, 0.34);

  // Collar: fitted by casting outwards from inside the neck.
  const collarCentre: Vec3 = [0, 1.27, 0.43];
  const collarFront = cross([1, 0, 0], normalize([0, 0.45, 0.18]));
  const collarPath = (t: number): Vec3 => {
    const a = t * Math.PI * 2;
    const out = add([Math.sin(a), 0, 0], mul(collarFront, Math.cos(a)));
    let r = 0.1;
    while (r < 0.7 && bodySdf(add(collarCentre, mul(out, r))) < 0.03) r += 0.008;
    return add(collarCentre, mul(out, r));
  };
  helix(dog.body, collarPath, Math.round(120 * Math.sqrt(density)), 0.012, 9, ARRIVAL.face + 0.35, 0.3, 0.55);
  // Its tag: one warm node, the light Windy Pup carries.
  const tag = add(collarPath(0), [0, -0.06, 0.04]);
  curve(dog.body, span(6, (t) => add(tag, [Math.sin(t * Math.PI * 2) * 0.03, Math.cos(t * Math.PI * 2) * 0.034, 0])), COLOURS.saffron, 0.011, 0.95, ARRIVAL.face + 0.5, 0.85);
  dog.body.points.push(dotAt(tag, COLOURS.saffron, 0.042, 0.85, ARRIVAL.face + 0.6));

  // Stand the finished dog like a terrier. Head and ears are local to the neck, which moves instead.
  for (const part of [dog.body, dog.tail]) {
    for (const point of new Set([...part.points, ...part.lines])) point.p = settle(point.p);
    for (let i = 0; i < part.mesh.positions.length; i += 3) {
      const p = settle([part.mesh.positions[i], part.mesh.positions[i + 1], part.mesh.positions[i + 2]]);
      part.mesh.positions.splice(i, 3, ...p);
    }
  }

  // The trunk and legs bend to sit. The tail and head only need carrying, which the rig does.
  const { body } = dog;
  for (const point of new Set([...body.points, ...body.lines])) {
    point.sit = sitPoint(point.p);
    if (point.n) point.sitN = sitNormal(point.p, point.n);
  }
  body.mesh.sit = [];
  body.mesh.sitNormals = [];
  for (let i = 0; i < body.mesh.positions.length; i += 3) {
    const p: Vec3 = [body.mesh.positions[i], body.mesh.positions[i + 1], body.mesh.positions[i + 2]];
    body.mesh.sit.push(...sitPoint(p));
    body.mesh.sitNormals.push(...sitNormal(p, [body.mesh.normals[i], body.mesh.normals[i + 1], body.mesh.normals[i + 2]]));
  }

  return dog;
}

export const EAR_ROOT = (side: number): Vec3 => [side * EAR.base[0], EAR.base[1], EAR.base[2]];
