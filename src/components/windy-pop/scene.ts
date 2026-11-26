import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  DoubleSide,
  Group,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OneFactor,
  OneMinusSrcAlphaFactor,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  Vector4,
} from "three";
import { devParam } from "@/components/three/core/switches";
import { damp } from "@/components/three/core/motion";
import type { SceneModule, StageSize } from "@/components/three/core/types";
import {
  EYE,
  EYE_Z,
  HEAD_CENTER,
  HEAD_OFFSET,
  HEAD_SCALE,
  HEAD_PIVOT,
  NOSE,
  TAIL_CURVE,
  headSdf,
  jawOpening,
  jawWeight,
  lipPoint,
  lipY,
  lowerLipY,
  raycast,
  settle,
  type Vec3,
} from "./anatomy";
import { COLOURS, EAR_ROOT, TRAVEL, buildDog, type PartData, type PartName } from "./build";
import {
  LINE_FRAGMENT,
  LINE_VERTEX,
  MOUTH_LINE_VERTEX,
  MOUTH_POINT_VERTEX,
  POINT_FRAGMENT,
  POINT_VERTEX,
  VOLUME_FRAGMENT,
  VOLUME_VERTEX,
} from "./shaders";
import { CUES, CUE_LENGTH, GAIT, bell, hop, legMotion, legOf, sitPoint, trotDrop, trotSpeed } from "./pose";

/*
 * The script, in seconds. It forms sitting and dim, switches on, stands, yawns as if just woken,
 * tilts its head and asks if it can help; the page then offers somewhere to type. The head faces
 * the visitor throughout: there is no looking about.
 */
const WAKE = 3.6;
const RISE = [4.5, 5.9] as const;
/* The mouth opens slowly, holds, and closes a little faster. */
const YAWN = { open: [6.1, 7.0], close: [7.6, 8.25] } as const;
const TILT = [8.3, 8.95] as const;
const ASK = 8.7;
const SETTLED = 20;
/* The jaw's hinge in head space, and how far it swings at the widest. */
const JAW_HINGE = [-0.17, 0.08] as const;
const JAW_SWING = 0.44;
/* Where the words start: just clear of the cheek and ear, level with the mouth (head space). */
const SPEECH: Vec3 = [-0.56, -0.27, 0.35];
/* From this width the dog stands to the right, leaving room beside its mouth (matches the CSS). */
const WIDE = 900;
const ASIDE = 0.17;
/* How the dog stands to the camera, and how far the head turns back to face it. */
const BODY_YAW = -1.0;
const HEAD_YAW = 0.86;
/* Walking across the stage it turns this far from the visitor: nearly side on. */
const TRAVEL_YAW = 1.3;
/* How far past a stage edge it walks to be wholly out of sight, nose, tail and dust. */
const OUT_OF_SIGHT = 1.35;
const FOV = 24;
/* The volume the camera must always show: ground to ear tips, nose to tail. */
const FRAME = { width: 2.34, height: 2.6, centreY: 0.97 };
/* Placement: the dog's standing height, ground to the top of its head (world units), which the
   page's `height` sets in pixels; how far the camera stands; how long a journey that is not walked
   takes (seconds). */
const DOG_TOP = 1.98;
const PLACE_DISTANCE = 7;
const GLIDE = 0.9;
/* Looking at a point: how far in front of the screen the dog's eyes are, in dog heights. */
const LOOK_DEPTH = 2.4;
/* Duo: half the width of the soft edge where colour turns to ink, CSS px. */
const WINDOW_EDGE = 2;
/* Long idle (stages that use reactions or placement): the first yawn, then sitting down, seconds. */
const IDLE_YAWN = 26;
const IDLE_SIT = 75;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** A short, occasional event: 0 most of the time, a 0..1 swell for `length` seconds every `period`. */
const pulse = (time: number, period: number, length: number, offset = 0) => {
  const t = (time + offset) % period;
  return t < length ? Math.sin((Math.PI * t) / length) : 0;
};

const scene: SceneModule = {
  createScene(ctx) {
    const low = ctx.quality.tier === "low" || ctx.quality.mobile;
    const dog = buildDog(low ? 0.5 : 1);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Dev only: ?t=1.2 freezes the formation at that second, ?yaw=1.57 turns the dog for review.
    const frozen = devParam("t");
    const yawOffset = Number(devParam("yaw") ?? 0);
    const still = reduced || ctx.capture;
    // `palette`, read once: 1 the ink drawing for paper pages (shaders.ts, INK); 2 duo, colour inside
    // the window and ink outside (INK and DUO). 0 is the night dog.
    const paletteInput = ctx.input("palette", 0);
    const ink = paletteInput === 1 || paletteInput === 2;
    const duo = paletteInput === 2;
    const defines = duo ? { INK: "", DUO: "" } : ink ? { INK: "" } : {};
    /* Premultiplied "over": the ink palette's blend for its light layers too. */
    const over = { blending: CustomBlending, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor } as const;
    const lightBlend = ink ? over : ({ blending: AdditiveBlending } as const);

    const world = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);

    const shared = {
      uTime: { value: 0 },
      uClock: { value: 0 },
      uPulse: { value: -1 },
      uPulseOrigin: { value: new Vector3() },
      uScale: { value: 1 },
      uTravel: { value: TRAVEL },
      uStand: { value: 0 },
      uPower: { value: 0 },
      uJaw: { value: 0 },
      uJawHinge: { value: JAW_HINGE },
      uLegSwing: { value: new Vector4() },
      uLegLift: { value: new Vector4() },
      uLegPivots: { value: new Vector4(...GAIT.shoulder, ...GAIT.hip) },
      uFade: { value: 1 },
      /* Ink only: where the drawing turns built, in clip x; 9 is off the stage (all drawn). */
      uSeam: { value: 9 },
      /* Duo only: the colour window in drawing-buffer pixels (x0, y0, x1, y1; y up), unset = everywhere. */
      uWindow: { value: new Vector4(-1e6, -1e6, 1e6, 1e6) },
      /* Duo only: the drawing buffer's width and height, and the window edge's half-width, in pixels. */
      uView: { value: new Vector3(1, 1, 2) },
      /* Duo only: how heavily the network is drawn (lighter when the dog is small). */
      uDensity: { value: 1 },
    };
    const light = (vertexShader: string, fragmentShader: string) =>
      new ShaderMaterial({ uniforms: shared, vertexShader, fragmentShader, defines, transparent: true, depthWrite: false, ...lightBlend });
    const pointMaterial = light(POINT_VERTEX, POINT_FRAGMENT);
    const lineMaterial = light(LINE_VERTEX, LINE_FRAGMENT);

    /* Premultiplied "over" (above), so the volume composes correctly with the page behind the canvas. */
    const appear = { value: 0 };
    const volumeMaterial = new ShaderMaterial({
      uniforms: {
        uAppear: appear,
        uStand: shared.uStand,
        uPower: shared.uPower,
        uJaw: shared.uJaw,
        uJawHinge: shared.uJawHinge,
        uLegSwing: shared.uLegSwing,
        uLegLift: shared.uLegLift,
        uLegPivots: shared.uLegPivots,
        uFade: shared.uFade,
        uSeam: shared.uSeam,
        uWindow: shared.uWindow,
        uView: shared.uView,
        uDensity: shared.uDensity,
      },
      vertexShader: VOLUME_VERTEX,
      fragmentShader: VOLUME_FRAGMENT,
      defines,
      transparent: true,
      side: DoubleSide,
      ...over,
    });

    // --- Rig ------------------------------------------------------------------------------

    const rig = new Group(); // turns the whole dog
    const torso = new Group(); // breathes
    const neck = new Group(); // the head turns about this
    const head = new Group();
    const tail = new Group();
    const ears = [new Group(), new Group()];
    world.add(rig);
    rig.add(torso);
    rig.add(neck);
    const pivot = settle(HEAD_PIVOT);
    neck.position.set(...pivot);
    neck.add(head);
    head.position.set(...HEAD_OFFSET);
    head.scale.setScalar(HEAD_SCALE);
    torso.add(tail);
    tail.position.set(...settle(TAIL_CURVE[0]));

    // Each ear pivots at its own root.
    ears.forEach((ear, i) => {
      const root = EAR_ROOT(i === 0 ? -1 : 1);
      ear.position.set(...root);
      head.add(ear);
    });

    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    /** `origin` is the part's group origin in its data space; `toModel` places data space in the model. */
    function addPart(group: Object3D, part: PartData, origin: Vec3, toModel: Vec3, kind: "head" | "legs" | null = null) {
      const hasJaw = kind === "head";
      // The rig attribute: jaw weight, then which leg carries each point of the trunk and how
      // firmly (pose.ts).
      const rigFor = (p: number[], out: Float32Array, i: number) => {
        out[i * 3] = jawOf(p);
        if (kind !== "legs") return;
        const [leg, weight] = legOf(p as Vec3);
        out[i * 3 + 1] = leg;
        out[i * 3 + 2] = weight;
      };
      // How much of each head vertex belongs to the lower jaw.
      const jawOf = (p: number[]) => (hasJaw ? jawWeight(p as Vec3) : 0);
      const attributes = (dots: PartData["points"], points: boolean) => {
        const n = dots.length;
        const position = new Float32Array(n * 3);
        const start = new Float32Array(n * 3);
        const colour = new Float32Array(n * 3);
        const normal = new Float32Array(n * 3);
        const alpha = new Float32Array(n);
        const delay = new Float32Array(n);
        const sway = new Float32Array(n);
        const flow = new Float32Array(n);
        const edge = new Float32Array(n);
        const square = new Float32Array(n);
        const size = new Float32Array(n);
        const sit = new Float32Array(n * 3);
        const sitNormals = new Float32Array(n * 3);
        const bends = new Float32Array(n * 3);
        // Strands that would span the open mouth fade out instead of stretching across it.
        const tear = new Float32Array(n);
        dots.forEach((d, i) => {
          for (let k = 0; k < 3; k += 1) position[i * 3 + k] = d.p[k] - origin[k];
          for (let k = 0; k < 3; k += 1) sit[i * 3 + k] = (d.sit ?? d.p)[k] - origin[k];
          const sitN = d.sitN ?? d.n;
          if (sitN) sitNormals.set(sitN, i * 3);
          colour.set(d.colour, i * 3);
          if (d.n) normal.set(d.n, i * 3);
          alpha[i] = d.alpha;
          delay[i] = d.delay;
          sway[i] = d.sway ?? 0;
          flow[i] = d.flow ?? 0;
          edge[i] = d.edge ?? 0;
          square[i] = d.square ?? 0;
          size[i] = d.size;
          rigFor(d.p, bends, i);
          if (!points) tear[i] = Math.abs(jawOf(d.p) - jawOf(dots[i ^ 1].p)) > 0.4 ? 1 : 0;
          if (points) {
            // Where the particle emerges: a wide, loose shell around where the dog will stand.
            const a = random() * Math.PI * 2;
            const y = random() * 2 - 1;
            const r = 0.75 + random() * 0.85;
            const ring = Math.sqrt(1 - y * y);
            const from: Vec3 = [Math.cos(a) * ring * r, 1.2 + y * r * 0.75, Math.sin(a) * ring * r];
            for (let k = 0; k < 3; k += 1) start[i * 3 + k] = from[k] - toModel[k] - origin[k];
          }
        });
        const geometry = new BufferGeometry();
        const set = (name: string, array: Float32Array, width: number) => geometry.setAttribute(name, new BufferAttribute(array, width));
        set("position", position, 3);
        set("aColour", colour, 3);
        set("aNormal", normal, 3);
        set("aSit", sit, 3);
        set("aSitNormal", sitNormals, 3);
        set("aAlpha", alpha, 1);
        set("aDelay", delay, 1);
        set("aSway", sway, 1);
        set("aFlow", flow, 1);
        set("aRig", bends, 3);
        set("aTear", tear, 1);
        set("aEdge", edge, 1);
        if (points) {
          set("aStart", start, 3);
          set("aSize", size, 1);
          set("aSquare", square, 1);
        }
        return geometry;
      };

      const volume = new BufferGeometry();
      const positions = new Float32Array(part.mesh.positions.length);
      part.mesh.positions.forEach((v, i) => (positions[i] = v - origin[i % 3]));
      volume.setAttribute("position", new BufferAttribute(positions, 3));
      volume.setAttribute("normal", new BufferAttribute(new Float32Array(part.mesh.normals), 3));
      const sitting = new Float32Array((part.mesh.sit ?? part.mesh.positions).map((v, i) => v - origin[i % 3]));
      volume.setAttribute("aSit", new BufferAttribute(sitting, 3));
      volume.setAttribute("aSitNormal", new BufferAttribute(new Float32Array(part.mesh.sitNormals ?? part.mesh.normals), 3));
      const rigs = new Float32Array(positions.length);
      for (let i = 0; i < positions.length / 3; i += 1) rigFor(part.mesh.positions.slice(i * 3, i * 3 + 3), rigs, i);
      volume.setAttribute("aRig", new BufferAttribute(rigs, 3));
      volume.setIndex(part.mesh.indices);
      const mesh = new Mesh(volume, volumeMaterial);
      mesh.renderOrder = 0;

      const lines = new LineSegments(attributes(part.lines, false), lineMaterial);
      lines.renderOrder = 2;
      const points = new Points(attributes(part.points, true), pointMaterial);
      points.renderOrder = 3;
      for (const object of [mesh, lines, points]) {
        object.frustumCulled = false; // vertices fly in from outside their final bounds
        group.add(object);
      }
    }

    const placement: Record<PartName, [Group, Vec3, Vec3]> = {
      body: [torso, [0, 0, 0], [0, 0, 0]],
      tail: [tail, settle(TAIL_CURVE[0]), [0, 0, 0]],
      head: [head, [0, 0, 0], settle(HEAD_CENTER)],
      earL: [ears[0], EAR_ROOT(-1), settle(HEAD_CENTER)],
      earR: [ears[1], EAR_ROOT(1), settle(HEAD_CENTER)],
    };
    for (const name of Object.keys(placement) as PartName[]) addPart(placement[name][0], dog[name], placement[name][1], placement[name][2], name === "head" ? "head" : name === "body" ? "legs" : null);

    // --- Eyes and nose ----------------------------------------------------------------------

    // Eyes are made of the same light as the body: an almond outline, a faceted ring and one node.
    const radius = EYE.radius;
    const eyes = [-1, 1].map((side) => {
      const group = new Group();
      group.position.set(side * EYE.x, EYE.y, EYE_Z - 0.012);
      group.rotation.y = side * 0.24; // set a little wide, as in both breeds

      const points: PartData["points"] = [];
      const lines: PartData["lines"] = [];
      const dot = (x: number, y: number, colour: Vec3, size: number, alpha: number) => {
        const point = { p: [x * radius, y * radius, radius * 0.62] as Vec3, colour, size, alpha, delay: 1.05 + random() * 0.3, flow: random() * 20 };
        points.push(point);
        return point;
      };
      const join = (a: PartData["points"][number], b: PartData["points"][number], alpha: number) => lines.push({ ...a, alpha }, { ...b, alpha });

      // A faceted lens, built like the rest of the network: rounder than a human eye, never glossy.
      const outline = (
        [
          [-1.12, -0.04],
          [-0.68, 0.64],
          [0.14, 0.86],
          [0.86, 0.52],
          [1.12, -0.06],
          [0.52, -0.62],
          [-0.42, -0.64],
        ] as const
      ).map(([x, y]) => dot(x * side, y, COLOURS.ice, 0.0105, 0.95));
      outline.forEach((p, i) => join(p, outline[(i + 1) % outline.length], 0.6));
      const core = dot(0, 0.04, COLOURS.ice, 0.03, 1);
      outline.forEach((p, i) => i % 2 === 0 && join(core, p, 0.26));

      addPart(group, { points, lines, mesh: { positions: [], normals: [], indices: [] } }, [0, 0, 0], [0, 0, 0]);
      head.add(group);
      return group;
    });

    // The nose is a dark facet of the same inner volume, under its drawn outline.
    const noseMesh = new Mesh(new SphereGeometry(1, 20, 14), volumeMaterial);
    noseMesh.position.set(...NOSE.center);
    noseMesh.scale.set(...NOSE.radii);
    noseMesh.renderOrder = 1;
    head.add(noseMesh);

    // --- The open mouth, seen only in the yawn ------------------------------------------------

    /*
     * The opening hangs from the upper lips (the "ω" drawn on the face) and its lower edge is the
     * lower lip, carried down by the jaw: most in the middle, nothing at the corners, so the shape
     * is round, never square. Same material as the dog: a dim volume, a triangulated network with
     * glowing nodes, dust along the lips and a tongue in warm light. Every point is a fixed place
     * (u across, v from upper lip to lower), so the network stretches with the jaw.
     */
    const STEPS = 32;
    const onFace = (x: number, y: number): Vec3 => {
      const [px, py, pz] = raycast(headSdf, [x, y, 1.3], [0, 0, -1]);
      return [px, py, pz + 0.014];
    };
    // Evenly spaced across, so the rounded corners are not cut into chords.
    const corner = lipPoint(1)[0];
    const across = Array.from({ length: STEPS + 1 }, (_, i) => ((i / STEPS) * 2 - 1) * corner);
    const upper: Vec3[] = across.map((x) => onFace(x, lipY(x)));
    const lowerRest: Vec3[] = upper.map(([x]) => onFace(x, lowerLipY(x)));
    const lower: Vec3[] = lowerRest.map((p) => [...p] as Vec3);
    const opening = upper.map(([x]) => jawOpening(x));

    type Spot = { u: number; v: number; colour?: Vec3 };
    const COLS = 8;
    const ROWS = 4;
    const nodes: Spot[] = [];
    for (let r = 0; r <= ROWS; r += 1)
      for (let c = 0; c <= COLS; c += 1) {
        const inner = r > 0 && r < ROWS && c > 0 && c < COLS;
        nodes.push({ u: c / COLS + (inner ? (random() - 0.5) * 0.07 : 0), v: r / ROWS + (inner ? (random() - 0.5) * 0.14 : 0) });
      }
    /** [from, to, alpha] */
    const links: [Spot, Spot, number][] = [];
    for (let r = 0; r <= ROWS; r += 1)
      for (let c = 0; c <= COLS; c += 1) {
        const at = (dr: number, dc: number) => nodes[(r + dr) * (COLS + 1) + c + dc];
        // The lips are drawn brighter; the network inside stays faint.
        if (c < COLS) links.push([at(0, 0), at(0, 1), r === ROWS ? 0.85 : r === 0 ? 0.75 : 0.22]);
        if (r < ROWS) links.push([at(0, 0), at(1, 0), 0.22]);
        if (r < ROWS && c < COLS) links.push([at(0, 0), at(1, 1), 0.22]);
      }
    // The tongue: a broad, soft mound lying on the lower jaw, rounded at the back, creased down
    // its middle. Its outline is a superellipse, so it fills the bottom of the mouth like a tongue.
    const TONGUE = { u: 0.5, halfWidth: 0.34, top: 0.46 };
    const tongueTop = (u: number) => {
      const w = Math.min(1, Math.abs(u - TONGUE.u) / TONGUE.halfWidth);
      return 1 - (1 - TONGUE.top) * Math.pow(1 - w ** 3, 1 / 3);
    };
    const inTongue = ({ u, v }: Spot) => Math.abs(u - TONGUE.u) < TONGUE.halfWidth && v > tongueTop(u);
    const tongueRim: Spot[] = Array.from({ length: 17 }, (_, i) => {
      const u = TONGUE.u + ((i / 16) * 2 - 1) * TONGUE.halfWidth * 0.97;
      return { u, v: tongueTop(u) + 0.015, colour: COLOURS.cream };
    });
    tongueRim.forEach((spot, i) => i && links.push([tongueRim[i - 1], spot, 0.75]));
    const crease: Spot[] = Array.from({ length: 5 }, (_, i) => ({ u: TONGUE.u, v: TONGUE.top + 0.1 + i * 0.08, colour: COLOURS.saffron }));
    crease.forEach((spot, i) => i && links.push([crease[i - 1], spot, 0.45]));
    const dust: Spot[] = Array.from({ length: low ? 170 : 360 }, (_, i) => {
      // Most of it gathers on the lips; a quarter fills the tongue.
      if (i % 4 === 0) {
        const u = TONGUE.u + (random() * 2 - 1) * TONGUE.halfWidth * 0.95;
        return { u, v: tongueTop(u) + random() * (1 - tongueTop(u)) };
      }
      return { u: random(), v: (i % 2) + (random() - 0.5) * 0.09 };
    });

    const cell = (spot: Spot, out: Vec3): Vec3 => {
      const x = Math.min(STEPS - 1e-4, Math.max(0, spot.u * STEPS));
      const i = Math.floor(x);
      for (let k = 0; k < 3; k += 1) {
        const top = upper[i][k] + (upper[i + 1][k] - upper[i][k]) * (x - i);
        const bottom = lower[i][k] + (lower[i + 1][k] - lower[i][k]) * (x - i);
        out[k] = top + (bottom - top) * Math.min(1, spot.v);
      }
      return out;
    };

    const tint = (spot: Spot): Vec3 => spot.colour ?? (inTongue(spot) ? (random() > 0.35 ? COLOURS.saffron : COLOURS.cream) : random() > 0.7 ? COLOURS.ice : COLOURS.cyan);
    const lit = (spots: Spot[], alpha: (i: number) => number, size: (i: number) => number) => {
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new BufferAttribute(new Float32Array(spots.length * 3), 3));
      geometry.setAttribute("aColour", new BufferAttribute(new Float32Array(spots.flatMap(tint)), 3));
      geometry.setAttribute("aAlpha", new BufferAttribute(new Float32Array(spots.map((_, i) => alpha(i))), 1));
      geometry.setAttribute("aSize", new BufferAttribute(new Float32Array(spots.map((_, i) => size(i))), 1));
      return geometry;
    };
    const glow = (point: boolean) =>
      new ShaderMaterial({
        uniforms: { uScale: shared.uScale, uSeam: shared.uSeam, uWindow: shared.uWindow, uView: shared.uView, uDensity: shared.uDensity, uClock: shared.uClock, uPower: shared.uPower },
        vertexShader: point ? MOUTH_POINT_VERTEX : MOUTH_LINE_VERTEX,
        fragmentShader: point ? POINT_FRAGMENT : LINE_FRAGMENT,
        defines,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        ...lightBlend,
      });
    const ends = links.flatMap(([p, q]) => [p, q]);
    const specks = [...nodes, ...tongueRim, ...dust];
    // The surface is finer than the network, so the dark inside follows the rounded edge.
    const SURFACE = { cols: STEPS, rows: 6 };
    const surface: Spot[] = [];
    for (let r = 0; r <= SURFACE.rows; r += 1) for (let c = 0; c <= SURFACE.cols; c += 1) surface.push({ u: c / SURFACE.cols, v: r / SURFACE.rows });
    const surfaceIndices: number[] = [];
    for (let r = 0; r < SURFACE.rows; r += 1)
      for (let c = 0; c < SURFACE.cols; c += 1) {
        const i = r * (SURFACE.cols + 1) + c;
        surfaceIndices.push(i, i + 1, i + SURFACE.cols + 2, i, i + SURFACE.cols + 2, i + SURFACE.cols + 1);
      }
    const volume = new BufferGeometry();
    volume.setAttribute("position", new BufferAttribute(new Float32Array(surface.length * 3), 3));
    volume.setIndex(surfaceIndices);
    const inside = new Mesh(volume, new MeshBasicMaterial({ color: 0x041019, transparent: true, opacity: 0.9, side: DoubleSide, depthTest: false, depthWrite: false }));
    const strands = new LineSegments(
      lit(ends, (i) => links[i >> 1][2], () => 0),
      glow(false),
    );
    const points = new Points(
      lit(
        specks,
        (i) => (i < nodes.length ? 0.6 : i < nodes.length + tongueRim.length ? 0.8 : 0.25 + random() * 0.5),
        (i) => (i < nodes.length ? (i % 7 === 0 ? 0.015 : 0.008) : i < nodes.length + tongueRim.length ? 0.008 : 0.0035 + random() * 0.004),
      ),
      glow(true),
    );
    const mouth = new Group();
    for (const [i, object] of [inside, strands, points].entries()) {
      object.renderOrder = 4 + i;
      object.frustumCulled = false;
      mouth.add(object);
    }
    head.add(mouth);

    const spotAt: Vec3 = [0, 0, 0];
    const mouthLayers = [
      [inside, surface],
      [strands, ends],
      [points, specks],
    ] as const;
    function openMouth(swing: number) {
      mouth.visible = swing > 0.03;
      if (!mouth.visible) return;
      const [hy, hz] = JAW_HINGE;
      // Indexed loops, no destructuring: this runs every frame while the dog talks.
      for (let i = 0; i < lowerRest.length; i += 1) {
        const rest = lowerRest[i];
        // The same swing the shader gives the face below the lip, so the edge stays on it.
        const a = swing * opening[i];
        const c = Math.cos(a);
        const s = Math.sin(a);
        lower[i][0] = rest[0];
        lower[i][1] = hy + (rest[1] - hy) * c - (rest[2] - hz) * s;
        lower[i][2] = hz + (rest[1] - hy) * s + (rest[2] - hz) * c;
      }
      for (let layer = 0; layer < mouthLayers.length; layer += 1) {
        const object = mouthLayers[layer][0];
        const spots = mouthLayers[layer][1];
        const attribute = object.geometry.getAttribute("position") as BufferAttribute;
        for (let i = 0; i < spots.length; i += 1) {
          cell(spots[i], spotAt);
          attribute.setXYZ(i, spotAt[0], spotAt[1], spotAt[2]);
        }
        attribute.needsUpdate = true;
      }
    }

    // --- Ground dust and drifting motes ------------------------------------------------------

    const ambient: PartData = { points: [], lines: [], mesh: { positions: [], normals: [], indices: [] } };
    const underfoot: PartData = { points: [], lines: [], mesh: { positions: [], normals: [], indices: [] } };
    // A faint scatter under the paws, so the dog stands on something. It goes where the dog goes.
    for (let i = 0; i < (low ? 260 : 600); i += 1) {
      const a = random() * Math.PI * 2;
      const r = Math.sqrt(random());
      underfoot.points.push({
        p: [Math.cos(a) * r * 0.72, random() * 0.012, Math.sin(a) * r * 1.15],
        colour: COLOURS.azure,
        size: 0.004 + random() * 0.005,
        alpha: (1 - r) * 0.42 + 0.04,
        delay: random() * 0.8,
        flow: random() * 20,
      });
    }
    // On paper a few motes are enough; more read as dirt.
    for (let i = 0; i < (low ? 90 : 200) / (ink ? 4 : 1); i += 1) {
      ambient.points.push({
        p: [(random() - 0.5) * 3.6, random() * 2.6, (random() - 0.5) * 2.6],
        colour: random() > 0.93 ? COLOURS.saffron : COLOURS.cyan,
        size: 0.004 + random() * 0.009,
        alpha: 0.08 + random() * 0.24,
        delay: random() * 0.6,
        sway: 0.02 + random() * 0.045,
        flow: random() * 10,
        square: random() > 0.82 ? 1 : 0,
      });
    }
    addPart(world, ambient, [0, 0, 0], [0, 0, 0]);
    const ground = new Group();
    world.add(ground);
    addPart(ground, underfoot, [0, 0, 0], [0, 0, 0]);

    // --- Frame loop --------------------------------------------------------------------------

    // `intro` = 0, set before the stage loads, starts the dog formed, standing and awake.
    const intro = ctx.firstMount && !ctx.capture && ctx.input("intro", 1) !== 0;
    let time = still || !intro ? SETTLED : 0;
    let clock = still ? 2.4 : 0;
    let asked = -1;
    // Where the neck and tail root are carried to while the dog sits.
    const sitNeck = sitPoint(pivot);
    const tailRoot = settle(TAIL_CURVE[0]);
    const sitTail = sitPoint(tailRoot);
    if (frozen !== null) {
      time = Number(frozen);
      clock = time;
    }
    const pulseOrigin = new Vector3();
    const speech = new Vector3();
    const said = { x: -1, y: -1 };
    const probe = new Vector3();
    /* The middle of the mouth, between the lips, in head space. */
    const mouthAt = onFace(0, (lipY(0) + lowerLipY(0)) / 2);

    // --- Walking -------------------------------------------------------------------------------

    /*
     * Inputs (StageHandle.set; all optional, documented in WindyPopStage):
     *   x        where to stand, in frame units: 0 home, -1 / 1 just out of sight left / right.
     *            The dog turns, trots there at the speed its legs carry it, and stops.
     *   from     -1 or 1: the side it comes back from when it is out of sight and x brings it
     *            into view (0, the default: the side it left by).
     *   heading  the way it faces when standing still, radians: 0 faces the visitor, π/2 screen
     *            right, -π/2 screen left. Default: the lab's three-quarter view.
     *   walk     0..1, a trot on the spot, on top of any walking it does to reach x.
     *   sit      1 sits once it has arrived; 0 stands.
     *   aside    the home position's offset right of centre, as a fraction of the stage width.
     *   intro    read once at creation, above.
     *   palette  read once at creation: 0 night (default), 1 ink on paper, 2 duo.
     *   seam     ink only: the drawn-to-built seam, a fraction of the stage width; right of it built.
     *   placeX, placeY, placeH, placeKey   placement in CSS px (below); replaces x and aside.
     *   winX, winY, winW, winH             duo: the colour window, CSS px.
     *   attention, mood, talk, look, lookX, lookY, cueName, cue   reactions (below).
     * Outputs: moving (1 while walking or turning), away (1 while wholly out of sight), arrived,
     * bboxX/bboxY/bboxW/bboxH and mouthX/mouthY (CSS px), and x/y (the speech point, fractions).
     * Dev only, for screenshots: ?walk=, ?heading=, ?x= and ?sit= preset those inputs, and
     * ?phase=<radians> freezes the stride.
     */
    const defaults = { x: 0, heading: BODY_YAW, walk: 0, sit: 0, from: 0 };
    type WalkInput = keyof typeof defaults;
    // A URL preset wins over the page's own setting, so a review link shows what it says.
    const presets = new Map<WalkInput, number>();
    for (const key of Object.keys(defaults) as WalkInput[]) {
      const value = Number(devParam(key) ?? Number.NaN);
      if (!Number.isNaN(value)) presets.set(key, value);
    }
    const frozenPhase = devParam("phase");
    const input = (key: WalkInput) => presets.get(key) ?? ctx.input(key, defaults[key]);
    const walking = {
      pos: 0,
      drift: 0,
      arriving: false,
      yaw: BODY_YAW,
      gait: 0,
      phase: frozenPhase === null ? 0 : Number(frozenPhase),
      posture: 1,
      placed: false,
      moving: -1,
      away: -1,
      arrived: -1,
    };
    /** World distance from home to just out of sight, on each side; measured on resize. */
    const reach = { left: 3, right: 3 };
    const toWorld = (f: number) => f * (f < 0 ? reach.left : reach.right);
    const toFrame = (w: number) => w / (w < 0 ? reach.left : reach.right);
    const turnTo = (to: number, from: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
    const report = (key: "moving" | "away" | "arrived", value: number) => {
      if (walking[key] === value) return;
      walking[key] = value;
      ctx.output(key, value);
    };

    // --- Placement -----------------------------------------------------------------------------

    /*
     * `placeX`, `placeY` (the feet) and `placeH` (standing height), CSS px in the stage. The dog is
     * always seen from the same place, as in the lab: the camera stands at a fixed distance and is
     * zoomed and shifted (a view offset) so the feet land on the point and the dog has the height.
     * Where it is is kept as an offset from the target, so when the target moves with its anchor
     * (`placeKey` unchanged: the page scrolls) the dog moves with it, and when it moves anywhere else
     * the offset is what is left of the journey: walked across, eased in height and up or down.
     */
    const place = {
      on: false,
      started: false,
      /** The target, CSS px. */
      tx: 0,
      ty: 0,
      th: 1,
      /** Where it is now, as an offset from the target. */
      offX: 0,
      offY: 0,
      offH: 0,
      /** The offset when this journey began. */
      fromX: 0,
      fromY: 0,
      fromH: 0,
      progress: 1,
      walked: false,
      /** The anchor at the last move of the target. */
      key: Number.NaN,
    };
    /** At zoom 1: the feet on screen (CSS px), px per world unit at the dog, and uScale. */
    const view = { feetX: 0, feetY: 0, unit: 100, base: 1, width: 1, height: 1 };
    const now = { x: () => place.tx + place.offX, y: () => place.ty + place.offY, h: () => Math.max(6, place.th + place.offH) };
    /** Screen px per world unit at the dog, at its current size. */
    const pixelsPerUnit = () => (place.on ? now.h() / DOG_TOP : view.unit);

    /** Follows the page's target: a rigid follow while its anchor is the same, else a new journey. */
    function trackPlace() {
      const tx = ctx.input("placeX", 0);
      const ty = ctx.input("placeY", 0);
      const th = Math.max(6, ctx.input("placeH", 1));
      const key = ctx.input("placeKey", Number.NaN);
      if (!place.started) {
        place.started = true;
        place.offX = place.offY = place.offH = 0;
        place.progress = 1;
      } else if (tx !== place.tx || ty !== place.ty || th !== place.th) {
        const follow = !Number.isNaN(key) && key === place.key;
        if (!follow) {
          const h = now.h();
          place.offX = place.tx + place.offX - tx;
          place.offY = place.ty + place.offY - ty;
          place.offH = h - th;
          place.fromX = place.offX;
          place.fromY = place.offY;
          place.fromH = place.offH;
          place.progress = 0;
          // Far enough across to walk it; otherwise it glides into place.
          place.walked = Math.abs(place.offX) / (h / DOG_TOP) > 0.2;
        }
        place.key = key;
      }
      place.tx = tx;
      place.ty = ty;
      place.th = th;
    }

    /** The up-and-down and the change of size, carried along by the walk (or a short glide). */
    function settlePlace(seconds: number) {
      if (place.progress >= 1) return;
      // Walked: as far along as the walk is (it stops within a stride's rounding of the place).
      if (place.walked) place.progress = Math.abs(place.offX) / pixelsPerUnit() <= 0.005 ? 1 : 1 - Math.abs(place.offX) / Math.abs(place.fromX);
      else place.progress = Math.min(1, place.progress + seconds / GLIDE);
      const e = smooth(0, 1, place.progress);
      if (!place.walked) place.offX = place.fromX * (1 - e);
      place.offY = place.fromY * (1 - e);
      place.offH = place.fromH * (1 - e);
      if (place.progress >= 1) place.offX = place.offY = place.offH = 0;
    }

    /** Points the camera so the dog's feet are at the place, at its height. */
    function aimCamera() {
      const h = now.h();
      const zoom = h / (view.unit * DOG_TOP);
      camera.zoom = zoom;
      const fx = view.width / 2 + (view.feetX - view.width / 2) * zoom;
      const fy = view.height / 2 + (view.feetY - view.height / 2) * zoom;
      camera.setViewOffset(view.width, view.height, fx - now.x(), fy - now.y(), view.width, view.height);
      camera.updateProjectionMatrix();
      shared.uScale.value = view.base * zoom;
      // A small dog is drawn with a lighter hand.
      shared.uDensity.value = 0.55 + 0.45 * smooth(70, 320, h);
    }

    /** Advances the walk; returns true while anything is still on its way. */
    function walkStep(seconds: number, instant: boolean): boolean {
      const rest = input("heading");
      // The intro plays out before it goes anywhere.
      const ready = time >= RISE[1];
      let dx: number;
      let hidden = false;
      let target = 0;
      if (place.on) {
        trackPlace();
        if (!walking.placed) {
          walking.placed = true;
          walking.yaw = rest;
          walking.posture = input("sit") > 0.5 ? 0 : 1;
        }
        dx = ready && place.walked ? -place.offX / pixelsPerUnit() : 0;
      } else {
        target = toWorld(Math.min(1.5, Math.max(-1.5, input("x"))));
        if (!walking.placed) {
          walking.placed = true;
          walking.pos = target;
          walking.yaw = rest;
          walking.posture = input("sit") > 0.5 ? 0 : 1;
        }
        // Nobody sees it jump from one side to the other while it is out of sight.
        const from = Math.sign(input("from"));
        hidden = Math.abs(toFrame(walking.pos)) >= 0.999;
        if (hidden && from !== 0 && Math.abs(toFrame(target)) < 0.999 && Math.sign(walking.pos) !== from) {
          walking.pos = toWorld(from);
          walking.yaw = -from * TRAVEL_YAW;
        }
        dx = ready ? target - walking.pos : 0;
      }
      const travelling = Math.abs(dx) > 0.004;
      // A journey that is not walked (straight up or down, or only a change of size).
      const gliding = place.on && ready && place.progress < 1 && !travelling;
      const dir = Math.sign(dx);
      const ms = seconds * 1000;
      const onTheSpot = input("walk");
      const sitting = (input("sit") > 0.5 || react.napping) && !travelling && !gliding && onTheSpot < 0.01;
      let busy = travelling || gliding;

      if (instant) {
        if (place.on) {
          place.offX = place.offY = place.offH = 0;
          place.progress = 1;
        } else walking.pos = ready ? target : walking.pos;
        walking.yaw = rest;
        walking.gait = still ? 0 : onTheSpot;
        walking.posture = sitting ? 0 : 1;
        shared.uFade.value = 1;
      } else if (still) {
        // Reduced motion: no gait and no turning. It fades out where it is, drifting a little the
        // way it was going, and fades in at the new place, drifting the last little way into it.
        const journey = place.on ? place.progress < 1 && ready : travelling;
        if (journey) {
          walking.drift = place.on ? 0 : dir;
          walking.arriving = false;
          // Out of sight already, there is nothing to fade.
          shared.uFade.value = hidden ? 0 : damp(shared.uFade.value, 0, 9, ms);
          if (shared.uFade.value < 0.02) {
            if (place.on) {
              place.offX = place.offY = place.offH = 0;
              place.progress = 1;
            } else walking.pos = target;
            walking.arriving = true;
          }
        } else shared.uFade.value = damp(shared.uFade.value, 1, 6, ms);
        walking.yaw = rest;
        walking.gait = 0;
        walking.posture = sitting ? 0 : 1;
        busy = journey || shared.uFade.value < 0.997;
      } else {
        const travelYaw = dir * TRAVEL_YAW;
        const turn = turnTo(travelling ? travelYaw : rest, walking.yaw);
        walking.yaw += turn * (1 - Math.exp(-4.5 * seconds));
        // It sets off once it is up and mostly facing the way it is going.
        const aligned = travelling ? smooth(0.75, 0.2, Math.abs(turnTo(travelYaw, walking.yaw))) * smooth(0.6, 0.97, walking.posture) : 0;
        // `pace` hurries a journey: quicker legs and as much more ground, so the paws still hold.
        const pace = travelling ? ctx.input("pace", 1) : 1;
        // A full trot to cover ground, easing over the last stretch; a few steps to turn on the spot.
        const steps = Math.min(0.45, Math.abs(turn) * 0.9);
        const want = Math.max(onTheSpot, travelling ? Math.min(1, 0.3 + Math.abs(dx) / 0.9) : 0, steps) * (sitting ? 0 : 1);
        walking.gait = damp(walking.gait, want, want > walking.gait ? 3.2 * pace : 4.5, ms);
        walking.posture = damp(walking.posture, sitting && walking.gait < 0.08 ? 0 : 1, 2.6, ms);
        // Small strides keep a quicker beat than their length suggests, as a small dog's do.
        const beat = Math.min(1, 0.45 + walking.gait * 2);
        if (frozenPhase === null) walking.phase = (walking.phase + Math.PI * 2 * GAIT.cadence * beat * pace * seconds) % (Math.PI * 2);
        // Exactly the ground the planted paws push past, so they never skate.
        const stride = dir * Math.min(Math.abs(dx), trotSpeed(walking.gait) * beat * pace * aligned * seconds);
        if (place.on) place.offX += stride * pixelsPerUnit();
        else walking.pos += stride;
        if (place.on) settlePlace(seconds);
        const stepping = travelling || gliding || walking.gait > 0.01 || Math.abs(turn) > 0.01;
        report("moving", stepping ? 1 : 0);
        busy = stepping || walking.gait > 0.002 || Math.abs(turn) > 0.002 || Math.abs(walking.posture - (sitting ? 0 : 1)) > 0.003;
        shared.uFade.value = 1;
      }
      if (instant || still) report("moving", busy ? 1 : 0);
      if (place.on) {
        report("arrived", place.progress >= 1 ? 1 : 0);
      } else {
        report("away", Math.abs(toFrame(walking.pos)) >= 0.999 ? 1 : 0);
        report("arrived", travelling ? 0 : 1);
      }
      return busy;
    }

    // --- Reactions -----------------------------------------------------------------------------

    /*
     * Targets the page sets (pose.ts names them): attention 0 idle, 1 listening, 2 thinking,
     * 3 talking; mood 0 neutral, 1 happy, 2 curious, 3 sorry, 4 excited; talk, a 0..1 speech
     * envelope pulsed per streamed chunk; look 1 with lookX, lookY (CSS px) to look at a point;
     * cueName (CUES) then cue (a new id) for a one-shot gesture. Each eases in as a weight, and
     * every weight is 0 until a page uses it, so the lab and the older pages are unchanged.
     */
    const react = {
      attention: new Float32Array([1, 0, 0, 0]),
      mood: new Float32Array([1, 0, 0, 0, 0]),
      /** The last talk pulse, decaying; the talk input as it was. */
      kick: 0,
      talk: 0,
      /** Phases: syllables, the slower phrasing over them, the wag. */
      syllable: 0,
      phrase: 0,
      wag: 0,
      cue: -1,
      cueT: 0,
      /** The running cue is idle life (a yawn), not something that happened. */
      cueIdle: false,
      aimYaw: 0,
      aimPitch: 0,
      aiming: false,
      /** Seconds with nothing going on; the next idle yawn; sat down after a long idle. */
      idle: 0,
      nextYawn: IDLE_YAWN,
      napping: false,
      /** Any reaction or placement input has been used: the long-idle life runs only then. */
      engaged: ctx.input("placeH", 0) > 0 || ["attention", "mood", "talk", "look", "cue"].some((key) => !Number.isNaN(ctx.input(key, Number.NaN))),
      /** The head on screen, CSS px (NaN until known), and where the look was when it last woke the dog. */
      headX: Number.NaN,
      headY: Number.NaN,
      wokeX: Number.NaN,
      wokeY: Number.NaN,
      side: 1,
    };
    const hopping: [number, number] = [0, 0];

    function wake() {
      react.idle = 0;
      react.nextYawn = IDLE_YAWN;
      react.napping = false;
    }
    function startCue(index: number, idle = false) {
      if (still || ctx.capture || index < 0 || index >= CUE_LENGTH.length) return;
      react.cue = index;
      react.cueT = 0;
      react.cueIdle = idle;
      if (!idle) wake();
    }
    /** Seconds into a running cue, or -1. */
    const cueTime = (index: number) => (react.cue === index ? react.cueT : -1);

    /** Ease the weights; count idle time; age the cue. Returns true while anything is still easing. */
    function reactStep(seconds: number): boolean {
      const ms = seconds * 1000;
      const attention = Math.round(ctx.input("attention", 0));
      const mood = Math.round(ctx.input("mood", 0));
      let easing = false;
      for (let i = 0; i < 4; i += 1) {
        const next = damp(react.attention[i], i === attention ? 1 : 0, 4.5, ms);
        if (Math.abs(next - react.attention[i]) > 1e-4) easing = true;
        react.attention[i] = next;
      }
      for (let i = 0; i < 5; i += 1) {
        const next = damp(react.mood[i], i === mood ? 1 : 0, 2.8, ms);
        if (Math.abs(next - react.mood[i]) > 1e-4) easing = true;
        react.mood[i] = next;
      }
      react.kick *= Math.exp(-seconds / 0.42);
      if (react.cue >= 0) {
        react.cueT += seconds;
        if (react.cueT > CUE_LENGTH[react.cue]) react.cue = -1;
      }
      // Long idle: an occasional yawn, and after a while it sits down until something happens.
      if (react.engaged && !still && !ctx.capture && frozen === null) {
        const quiet = attention === 0 && (react.cue < 0 || react.cueIdle) && walking.moving !== 1;
        if (quiet) react.idle += seconds;
        else wake();
        if (react.idle > react.nextYawn && react.cue < 0) {
          startCue(CUES.indexOf("yawn"), true);
          react.nextYawn += 38 + random() * 24;
        }
        if (react.idle > IDLE_SIT) react.napping = true;
      }
      return easing || react.cue >= 0 || react.kick > 0.01;
    }

    // --- Pose ----------------------------------------------------------------------------------

    const leg: [number, number] = [0, 0];
    function pose(seconds: number) {
      shared.uTime.value = time;
      shared.uClock.value = clock;
      // Idle life eases in once the dog has formed.
      const alive = still || frozen !== null ? 0 : smooth(2.6, 3.4, time);
      const power = smooth(WAKE, WAKE + 0.5, time);
      const stand = Math.min(smooth(RISE[0], RISE[1], time), walking.posture);
      shared.uPower.value = power;
      shared.uStand.value = stand;

      appear.value = smooth(1.55, 2.5, time);
      volumeMaterial.depthWrite = appear.value > 0.35;

      // Reactions, as weights (0 unless a page uses them). Under reduced motion only the head moves.
      const lively = still ? 0 : 1;
      const listening = react.attention[1];
      const thinking = react.attention[2];
      const talking = react.attention[3] * lively;
      const happy = react.mood[1];
      const curious = react.mood[2];
      const sorry = react.mood[3];
      const excited = react.mood[4];

      // One-shot gestures.
      const tYawn = cueTime(4);
      const cueYawn = tYawn < 0 ? 0 : smooth(0, 0.85, tYawn) * (1 - smooth(1.45, 2.15, tYawn));
      const tTilt = cueTime(2);
      const cueTilt = tTilt < 0 ? 0 : bell(tTilt, 0, 0.42, 1.15, 1.7);
      const tSneeze = cueTime(3);
      const gather = tSneeze < 0 ? 0 : bell(tSneeze, 0, 0.32, 0.36, 0.42);
      const snap = tSneeze < 0 ? 0 : bell(tSneeze, 0.36, 0.43, 0.5, 0.95);
      const tHop = cueTime(1);
      if (tHop < 0) hopping[0] = hopping[1] = 0;
      else hop(tHop, hopping);
      const tWag = cueTime(0);
      const cueWag = tWag < 0 ? 0 : bell(tWag, 0, 0.2, 1.25, 1.8);

      // The yawn: an eased swing of the jaw, with the eyes squeezing shut as it widens.
      const yawn = Math.max(smooth(YAWN.open[0], YAWN.open[1], time) * (1 - smooth(YAWN.close[0], YAWN.close[1], time)), cueYawn);
      const tilt = smooth(TILT[0], TILT[1], time);

      // Talking: small opens and closes at a speaking rhythm, phrased, stronger on each pulse.
      react.syllable += seconds * Math.PI * 2 * (4.1 + 0.9 * Math.sin(react.phrase * 1.7));
      react.phrase += seconds * 1.3;
      const energy = 0.38 + 0.62 * Math.min(1, Math.max(react.kick, react.talk * 0.75));
      const syllable = Math.pow(Math.max(0, Math.sin(react.syllable)), 0.7) * (0.45 + 0.55 * Math.max(0, Math.sin(react.phrase * 2.3 + 0.6)));
      const speak = talking * energy * syllable;
      // Happy: a relaxed, open-mouthed smile; excited: a quick pant.
      const smile = lively * (happy * (0.07 + 0.01 * Math.sin(clock * 9.5)) + excited * (0.085 + 0.03 * Math.max(0, Math.sin(clock * 21))));
      const jaw = Math.max(yawn * JAW_SWING, speak * 0.15 + smile + 0.1 * snap + 0.05 * gather);
      shared.uJaw.value = jaw;
      openMouth(jaw);

      // Switching on: the eyes open and a wave of light runs from the head to the tail.
      const opening = smooth(WAKE + 0.15, WAKE + 0.55, time);
      const wave = (time - WAKE) / 0.9;
      shared.uPulse.value = !still && wave > 0 && wave < 1.4 ? wave * 2.3 : -1;

      const blink = alive * Math.max(pulse(clock, 4.6, 0.22, 1.3), pulse(clock, 13.7, 0.2, 6.2));
      // Happy eyes soften; sorry ones lower a little; a sneeze shuts them.
      const squint = Math.min(0.95, 0.24 * happy * lively + 0.12 * sorry + 0.1 * thinking + 0.5 * gather + snap);
      const open = Math.max(0.07, (0.1 + 0.9 * opening) * (1 - 0.93 * blink) * (1 - 0.9 * yawn) * (1 - squint));
      for (const eye of eyes) eye.scale.y = open;

      // The trot: diagonal pairs of legs, the trunk dropping as they reach, a nod, a wag.
      const gait = walking.gait * stand;
      const phase = walking.phase;
      const swing = shared.uLegSwing.value;
      const lift = shared.uLegLift.value;
      for (let i = 0; i < 4; i += 1) {
        legMotion(i, phase, gait, leg);
        swing.setComponent(i, leg[0]);
        // Paws tuck up a little in the air.
        lift.setComponent(i, leg[1] + hopping[0] * 0.4);
      }
      const drop = trotDrop(phase, gait);
      const beat = Math.sin(phase * 2);

      const glide = walking.drift * 0.22 * (1 - shared.uFade.value) * (walking.arriving ? -1 : 1);
      const x = place.on ? 0 : walking.pos + glide;
      rig.position.x = x;
      rig.position.y = hopping[0];
      rig.rotation.y = walking.yaw + yawOffset + (1 - smooth(0, 2.8, time)) * -0.22;
      ground.position.x = x;
      ground.rotation.y = walking.yaw + yawOffset;

      const breath = Math.sin(clock * 2.1) * alive;
      // The chest fills as the yawn draws in.
      torso.scale.set(1 + breath * 0.008 + yawn * 0.012, 1 + breath * 0.006 + yawn * 0.008, 1 + breath * 0.003);
      torso.position.y = -breath * 0.004 - drop - hopping[1];

      // Looking at a point: the head turns towards it, within a natural reach.
      const look = Math.max(-1, Math.min(1, -walking.yaw * (HEAD_YAW / -BODY_YAW))) * (1 - 0.55 * gait);
      let aimYaw = 0;
      let aimPitch = 0;
      if (ctx.input("look", 0) === 1 && !Number.isNaN(react.headX)) {
        const depth = LOOK_DEPTH * DOG_TOP * pixelsPerUnit();
        const dx = ctx.input("lookX", 0) - react.headX;
        const dy = ctx.input("lookY", 0) - react.headY;
        const wanted = Math.atan2(dx, depth) - (walking.yaw + look);
        aimYaw = Math.max(-1.15, Math.min(1.15, look + Math.max(-0.95, Math.min(0.95, wanted)))) - look;
        aimPitch = Math.max(-0.3, Math.min(0.34, Math.atan2(dy, depth) * 0.85));
        react.side = dx < 0 ? 1 : -1;
      } else react.side = 1;
      const ms = seconds * 1000;
      react.aiming = Math.abs(react.aimYaw - aimYaw) + Math.abs(react.aimPitch - aimPitch) > 1e-4;
      react.aimYaw = damp(react.aimYaw, aimYaw, still ? 2.5 : 4, ms);
      react.aimPitch = damp(react.aimPitch, aimPitch, still ? 2.5 : 4, ms);

      // What the attention and the mood do to the head: listening, a tilt towards the chat and the
      // head a touch up; thinking, up and aside; talking, small nods; curious, a tilt; sorry, lowered.
      const side = react.side;
      const nod = talking * (0.022 * Math.sin(react.phrase * 3.1) + 0.018 * syllable);
      const headPitch =
        -0.04 * listening - 0.17 * thinking + nod - 0.03 * happy + 0.035 * curious + 0.15 * sorry - 0.05 * excited - 0.13 * gather + 0.2 * snap - 0.12 * cueYawn + react.aimPitch;
      const headYaw = 0.3 * thinking * side + react.aimYaw;
      // Positive roll leans the head to the screen's right; `side` 1 means the chat (or the point) is on the left.
      const headRoll = -0.13 * listening * side + 0.09 * thinking * side - 0.22 * curious * side + 0.026 * talking * Math.sin(react.phrase * 1.9) - 0.28 * cueTilt * side;

      // Head: bowed until switched on, up as it stands, back with the yawn, then tilted and held.
      // It looks at the visitor, and mostly ahead while it trots.
      const rise = Math.sin(Math.PI * stand);
      const steady = 1 - 0.6 * gait;
      neck.position.set(
        pivot[0],
        sitNeck[1] + (pivot[1] - sitNeck[1]) * stand + breath * 0.006 - drop - hopping[1] * 0.6,
        sitNeck[2] + (pivot[2] - sitNeck[2]) * stand + rise * 0.05,
      );
      neck.rotation.set(
        0.26 * (1 - power) + rise * 0.1 - yawn * 0.24 + tilt * 0.02 + gait * (0.05 + 0.035 * Math.sin(phase * 2 - 0.7)) + headPitch * steady,
        look + headYaw * steady,
        tilt * 0.25 * (1 - gait) + headRoll * steady,
        "YXZ",
      );

      const asking = ctx.capture || time < ASK ? 0 : 1;
      if (asking !== asked) {
        asked = asking;
        ctx.output("ask", asking);
      }

      const flickLeft = pulse(clock, 9.3, 0.4, 2.1);
      const flickRight = pulse(clock, 13.1, 0.4, 5.4);
      // The ears ease back during the yawn and bounce with the trot. They lift a little when it
      // listens or is curious, fold back when it is sorry, and lag behind a hop or a sneeze.
      const idle = time > TILT[1] ? alive : 0;
      const bounce = gait * 0.09 * Math.sin(phase * 2 - 1.3) + hopping[0] * 0.5;
      // Ear x: positive brings them forward, negative folds them back; `lifted` raises them outwards.
      const perk = lively * (0.08 * listening + 0.14 * curious + 0.05 * excited + 0.03 * thinking) - 0.28 * sorry - 0.05 * happy - 0.1 * cueYawn;
      const lifted = lively * (0.12 * listening + 0.1 * curious + 0.07 * excited) - 0.05 * sorry;
      const flap = 0.14 * snap * Math.sin(react.cueT * 40);
      // In a tilt the ear on the high side lifts (side 1: the head leans left, so the right ear is high).
      const tilted = 0.1 * cueTilt;
      ears[0].rotation.set(
        -idle * flickLeft * 0.06 - yawn * 0.14 - bounce + perk + 0.05 * thinking * lively,
        0,
        idle * flickLeft * 0.07 - yawn * 0.06 + bounce * 0.5 - lifted + flap - tilted * Math.max(0, -side),
      );
      ears[1].rotation.set(
        -idle * flickRight * 0.06 - yawn * 0.14 - bounce + perk,
        0,
        -idle * flickRight * 0.07 + yawn * 0.06 - bounce * 0.5 + lifted - flap + tilted * Math.max(0, side),
      );

      // The tail lies back while sitting, stirs once the dog is up, and wags as it trots; it wags
      // slowly while listening, steadily when happy, fast when excited, and is still in thought.
      const wagAmount = lively * (0.11 * listening + 0.2 * happy + 0.28 * excited + 0.3 * cueWag) * (1 - 0.85 * thinking) * (1 - 0.8 * sorry);
      const wagRate = (1.3 * listening + 2.4 * happy + 4.3 * excited + 3.8 * cueWag + 0.01) / (listening + happy + excited + cueWag + 0.01);
      react.wag = (react.wag + seconds * Math.PI * 2 * wagRate) % (Math.PI * 2);
      const lowered = 0.22 * sorry - 0.08 * excited - 0.04 * happy;
      tail.position.set(
        sitTail[0] + (tailRoot[0] - sitTail[0]) * stand,
        sitTail[1] + (tailRoot[1] - sitTail[1]) * stand,
        sitTail[2] + (tailRoot[2] - sitTail[2]) * stand,
      );
      tail.rotation.set(
        -0.62 * (1 - stand) - gait * 0.08 - lowered,
        gait * 0.34 * beat + wagAmount * Math.sin(react.wag) * (1 - gait) * stand,
        alive * stand * Math.sin(clock * 1.25) * 0.045 * (1 - gait) * (1 - thinking),
      );

      rig.updateMatrixWorld(true);
      head.getWorldPosition(pulseOrigin);
      shared.uPulseOrigin.value.copy(pulseOrigin);
    }

    // --- Outputs -------------------------------------------------------------------------------

    /* Points on the dog's outline, each in its part's space, coat included: its box on screen is theirs. */
    const OUTLINE: [Object3D, number, number, number][] = [
      [head, 0, 0.52, -0.05],
      [head, 0, -0.06, 0.62],
      [head, 0, -0.42, 0.34],
      [head, -0.52, -0.08, 0.05],
      [head, 0.52, -0.08, 0.05],
      [head, -0.6, -0.5, -0.05],
      [head, 0.6, -0.5, -0.05],
      [head, 0, 0.25, -0.48],
      [torso, -0.3, 0, 0.5],
      [torso, 0.3, 0, 0.5],
      [torso, -0.34, 0, -0.64],
      [torso, 0.34, 0, -0.64],
      [torso, 0, 0.88, 0.8],
      [torso, 0, 0.9, -1.0],
      [torso, -0.52, 0.85, 0],
      [torso, 0.52, 0.85, 0],
      [tail, 0, 0.82, 0],
      [tail, 0, 0.56, -0.44],
    ];
    const box = { x0: 0, y0: 0, x1: 0, y1: 0 };
    const sent = { bboxX: Number.NaN, bboxY: Number.NaN, bboxW: Number.NaN, bboxH: Number.NaN, mouthX: Number.NaN, mouthY: Number.NaN };
    type Sent = keyof typeof sent;
    /** Sends a number if it has moved by half a pixel or more; 1 if it did. */
    const send = (key: Sent, value: number) => {
      if (Math.abs(value - sent[key]) < 0.5) return 0;
      sent[key] = value;
      ctx.output(key, value);
      return 1;
    };
    /** `probe` (world) to CSS px in the stage, into probe.x and probe.y. */
    const toScreen = () => {
      probe.project(camera);
      probe.x = ((probe.x + 1) / 2) * view.width;
      probe.y = ((1 - probe.y) / 2) * view.height;
    };

    /* Tells the page where the mouth and the dog are on screen. */
    function locate() {
      camera.updateMatrixWorld();
      speech.set(...SPEECH).applyMatrix4(head.matrixWorld).project(camera);
      const atX = (speech.x + 1) / 2;
      const atY = (1 - speech.y) / 2;
      // Breathing moves it by less than this, so the words hold still.
      if (Math.abs(atX - said.x) >= 0.006) ctx.output("x", (said.x = atX));
      if (Math.abs(atY - said.y) >= 0.006) ctx.output("y", (said.y = atY));

      box.x0 = box.y0 = Number.POSITIVE_INFINITY;
      box.x1 = box.y1 = Number.NEGATIVE_INFINITY;
      for (let i = 0; i < OUTLINE.length; i += 1) {
        const at = OUTLINE[i];
        probe.set(at[1], at[2], at[3]).applyMatrix4(at[0].matrixWorld);
        toScreen();
        box.x0 = Math.min(box.x0, probe.x);
        box.x1 = Math.max(box.x1, probe.x);
        box.y0 = Math.min(box.y0, probe.y);
        box.y1 = Math.max(box.y1, probe.y);
      }
      // Each group of numbers is followed by its name, so the page can take them as one.
      if (send("bboxX", box.x0) | send("bboxY", box.y0) | send("bboxW", box.x1 - box.x0) | send("bboxH", box.y1 - box.y0)) ctx.output("bbox", 1);
      probe.set(mouthAt[0], mouthAt[1], mouthAt[2]).applyMatrix4(head.matrixWorld);
      toScreen();
      if (send("mouthX", probe.x) | send("mouthY", probe.y)) ctx.output("mouth", 1);
      probe.copy(pulseOrigin);
      toScreen();
      react.headX = probe.x;
      react.headY = probe.y;
      if (place.on) report("away", box.x1 < 0 || box.x0 > view.width || box.y1 < 0 || box.y0 > view.height ? 1 : 0);
    }

    const edge = new Vector3();
    /** Where the stage's left and right edges meet the dog's ground line, in world x. */
    function measureReach() {
      camera.updateMatrixWorld();
      for (const side of [-1, 1] as const) {
        edge.set(side, 0, 0.5).unproject(camera);
        const along = (0 - camera.position.z) / (edge.z - camera.position.z);
        const x = camera.position.x + (edge.x - camera.position.x) * along;
        // Clear of nose or tail, coat and loose dust, whichever way it is facing.
        if (side < 0) reach.left = Math.max(0.5, -x + OUT_OF_SIGHT);
        else reach.right = Math.max(0.5, x + OUT_OF_SIGHT);
      }
    }

    /** At zoom 1 and the current framing: the feet on screen and the px per world unit. */
    function measureView(size: StageSize) {
      view.width = size.width;
      view.height = size.height;
      camera.updateMatrixWorld();
      probe.set(0, 0, 0);
      toScreen();
      view.feetX = probe.x;
      view.feetY = probe.y;
      probe.set(0, DOG_TOP, 0);
      toScreen();
      view.unit = Math.max(1e-3, (view.feetY - probe.y) / DOG_TOP);
    }

    function resize(size: StageSize) {
      const aspect = size.width / size.height;
      const tan = Math.tan((FOV * Math.PI) / 360);
      camera.aspect = aspect;
      shared.uScale.value = (size.height * size.dpr) / 2 / tan;
      view.base = shared.uScale.value;
      if (place.on) {
        // Placed: always the same view of the dog, wherever and however big it is (aimCamera).
        camera.position.set(0, FRAME.centreY + PLACE_DISTANCE * 0.085, PLACE_DISTANCE);
        camera.lookAt(0, FRAME.centreY, 0);
        camera.zoom = 1;
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
        measureView(size);
        aimCamera();
      } else {
        const distance = Math.max(FRAME.height / 2 / tan, FRAME.width / 2 / (tan * aspect)) * 1.06;
        camera.position.set(0, FRAME.centreY + distance * 0.085, distance);
        camera.lookAt(0, FRAME.centreY, 0);
        camera.zoom = 1;
        const aside = ctx.input("aside", Number.NaN);
        if (!Number.isNaN(aside)) camera.setViewOffset(size.width, size.height, -size.width * aside, 0, size.width, size.height);
        else if (window.innerWidth >= WIDE) camera.setViewOffset(size.width, size.height, -size.width * ASIDE, 0, size.width, size.height);
        else {
          // On a tall narrow stage the spare height goes below, bringing the head up to the words.
          const spare = size.height - (FRAME.height * size.height) / (2 * tan * distance);
          camera.setViewOffset(size.width, size.height, 0, Math.max(0, spare * 0.4), size.width, size.height);
        }
        camera.updateProjectionMatrix();
        measureView(size);
        measureReach();
      }
      placeWindow();
    }

    /* Ink only: input `seam`, the drawn-to-built seam as a fraction of the stage width (unset: all drawn). */
    function placeSeam() {
      const seam = ctx.input("seam", Number.NaN);
      shared.uSeam.value = Number.isNaN(seam) ? 9 : seam * 2 - 1;
    }
    placeSeam();

    /* Duo only: inputs winX, winY, winW, winH (CSS px in the stage) to drawing-buffer pixels, y up. */
    function placeWindow() {
      const { width, height, dpr } = ctx.size;
      shared.uView.value.set(width * dpr, height * dpr, WINDOW_EDGE * dpr);
      const w = ctx.input("winW", Number.NaN);
      const h = ctx.input("winH", Number.NaN);
      if (Number.isNaN(w) || Number.isNaN(h)) {
        shared.uWindow.value.set(-1e6, -1e6, 1e6, 1e6);
        return;
      }
      const x = ctx.input("winX", 0);
      const y = ctx.input("winY", 0);
      // An empty rect is no window at all: all ink.
      if (w <= 0 || h <= 0) shared.uWindow.value.set(1e6, 1e6, -1e6, -1e6);
      else shared.uWindow.value.set(x * dpr, (height - y - h) * dpr, (x + w) * dpr, (height - y) * dpr);
    }

    /** Placement turns on with placeH; turning it on or off reframes the camera. */
    function syncPlaceMode() {
      const on = ctx.input("placeH", 0) > 0;
      if (on === place.on) return;
      place.on = on;
      place.started = false;
      walking.placed = false;
      resize(ctx.size);
    }
    syncPlaceMode();

    const REACTIONS = new Set(["attention", "mood", "talk", "look", "lookX", "lookY", "cue", "cueName", "placeH"]);

    return {
      scene: world,
      camera,
      resize,
      onInput(key, value) {
        if (REACTIONS.has(key)) react.engaged = true;
        if (key === "aside") resize(ctx.size);
        else if (key === "seam") placeSeam();
        else if (key === "winX" || key === "winY" || key === "winW" || key === "winH") placeWindow();
        else if (key === "placeH") syncPlaceMode();
        else if (key === "cue") startCue(Math.round(ctx.input("cueName", -1)));
        else if (key === "talk") {
          if (value > react.talk + 0.05) react.kick = Math.max(react.kick, value);
          react.talk = value;
          if (value > 0) wake();
        } else if (key === "attention") {
          if (value !== 0) wake();
        } else if (key === "mood") {
          wake();
          // Excited arrives with a small hop.
          if (Math.round(value) === 4 && react.cue < 0) startCue(CUES.indexOf("hop"));
        } else if (key === "lookX" || key === "lookY" || key === "look") {
          // The visitor moving about keeps it awake.
          const lx = ctx.input("lookX", 0);
          const ly = ctx.input("lookY", 0);
          if (Number.isNaN(react.wokeX) || Math.hypot(lx - react.wokeX, ly - react.wokeY) > 40) {
            react.wokeX = lx;
            react.wokeY = ly;
            wake();
          }
        }
      },
      update(delta) {
        const seconds = Math.min(delta, 50) / 1000;
        const scripted = !still && frozen === null;
        if (scripted) {
          time += seconds;
          clock += seconds;
        }
        const busy = ctx.capture ? false : walkStep(seconds, frozen !== null);
        if (place.on) aimCamera();
        const reacting = reactStep(seconds);
        pose(seconds);
        locate();
        // Out of sight and standing still, it sleeps until told to come back.
        if (scripted) return busy || reacting || walking.away !== 1;
        return busy || reacting || react.aiming;
      },
    };
  },
};

export default scene;
