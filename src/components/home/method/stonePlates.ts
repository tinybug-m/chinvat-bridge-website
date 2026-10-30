import { BRIDGE_PATH } from "@/components/three/scenes/bridge/config";
import { bridgeFraming, bridgeLayout, type Pose } from "@/components/three/scenes/bridge/path";

/*
 * The Approach bridge, flattened for the Method plates. The same path (same
 * config, same slab poses, the same low three-quarter view along it) is
 * projected once into SVG polygons, so the four plates show one bridge and it
 * is the bridge in the Approach stage. Pure numbers, computed when the module
 * loads; nothing is drawn here.
 *
 * Only the faces the camera can see are kept: the top, the long front and,
 * on the near plinth, the end that faces the path. Order is a painter's
 * order, because the pieces never interlock.
 */

type Vec = [number, number, number];

const P = BRIDGE_PATH;
const layout = bridgeLayout();

const BOARD_WIDTH = 400;
/** Free margin round the bridge on the board. */
const MARGIN = 10;

// --- Camera: the Approach's own framing -----------------------------------------

const { target: centre, distance } = bridgeFraming(layout);
const eye: Vec = [
  centre[0] - distance * Math.sin(P.azimuth) * Math.cos(P.elevation),
  centre[1] + distance * Math.sin(P.elevation),
  centre[2] + distance * Math.cos(P.azimuth) * Math.cos(P.elevation),
];

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec): Vec => {
  const length = Math.hypot(...a);
  return [a[0] / length, a[1] / length, a[2] / length];
};

const forward = unit(sub(centre, eye));
const right = unit(cross(forward, [0, 1, 0]));
const up = cross(right, forward);

/** Perspective projection to the image plane, y up, in units of the focal length. */
function project(point: Vec): [number, number] {
  const ray = sub(point, eye);
  const depth = dot(ray, forward);
  return [dot(ray, right) / depth, dot(ray, up) / depth];
}

// --- Boxes ---------------------------------------------------------------------

/** Euler "YXZ" like three's: roll about z first, then pitch about x, then yaw about y. */
function place(pose: Pose, local: Vec): Vec {
  const x = local[0] * pose.sx;
  const y = local[1] * pose.sy;
  const z = local[2] * pose.sz;
  const rollX = x * Math.cos(pose.roll) - y * Math.sin(pose.roll);
  const rollY = x * Math.sin(pose.roll) + y * Math.cos(pose.roll);
  const pitchY = rollY * Math.cos(pose.pitch) - z * Math.sin(pose.pitch);
  const pitchZ = rollY * Math.sin(pose.pitch) + z * Math.cos(pose.pitch);
  const yawX = rollX * Math.cos(pose.yaw) + pitchZ * Math.sin(pose.yaw);
  const yawZ = -rollX * Math.sin(pose.yaw) + pitchZ * Math.cos(pose.yaw);
  return [yawX + pose.x - layout.deckEnd / 2, pitchY + pose.y, yawZ + pose.z];
}

type Point = [number, number];
type Face = Point[];

interface Box {
  top: Face;
  front: Face;
  end: Face;
}

const FLAT: Pose = { x: 0, y: 0, z: 0, pitch: 0, yaw: 0, roll: 0, sx: 1, sy: 1, sz: 1 };

/** The three visible faces of a box of the given size, centred on `pose`. */
function box(pose: Pose, length: number, height: number, depth: number): Box {
  const [hx, hy, hz] = [length / 2, height / 2, depth / 2];
  const at = (x: number, y: number, z: number) => project(place(pose, [x, y, z]));
  return {
    top: [at(-hx, hy, hz), at(hx, hy, hz), at(hx, hy, -hz), at(-hx, hy, -hz)],
    front: [at(-hx, hy, hz), at(hx, hy, hz), at(hx, -hy, hz), at(-hx, -hy, hz)],
    end: [at(-hx, hy, hz), at(-hx, hy, -hz), at(-hx, -hy, -hz), at(-hx, -hy, hz)],
  };
}

/** A line on a slab's top, down its middle: where the saffron inlay runs. */
function inlay(pose: Pose): [Point, Point] {
  const half = (P.length * pose.sx) / 2 - 0.015;
  const y = (P.thickness * pose.sy) / 2;
  return [project(place(pose, [-half, y, 0])), project(place(pose, [half, y, 0]))];
}

function slabTop(pose: Pose, along: number): Point {
  return project(place(pose, [along * P.length * pose.sx * 0.5, (P.thickness * pose.sy) / 2, 0]));
}

// --- Pieces of the path ---------------------------------------------------------

const slabBox = (pose: Pose) => box(pose, P.length, P.thickness, P.depth);

const nearTop = 0;
const farTop = layout.rightTop;
const blockAt = (x: number, top: number) => box({ ...FLAT, x, y: top - P.plinthHeight / 2 }, P.plinthLength, P.plinthHeight, P.plinthDepth);
const stepHeight = P.plinthHeight - 0.34;
const stepAt = (x: number, top: number) =>
  box({ ...FLAT, x, y: top - 0.34 - stepHeight / 2 }, 0.8, stepHeight, P.plinthDepth * 0.9);

const nearBlockX = -layout.endGap - P.plinthLength / 2 - 0.3;
const farBlockX = layout.deckEnd + layout.endGap + P.plinthLength / 2;

const pieces = {
  nearBlock: blockAt(nearBlockX, nearTop),
  nearStep: stepAt(nearBlockX + P.plinthLength / 2 + 0.4, nearTop),
  farBlock: blockAt(farBlockX, farTop),
  farStep: stepAt(layout.deckEnd + layout.endGap - 0.4, farTop),
  built: layout.slabs.map(({ built }) => slabBox(built)),
  loose: layout.slabs.map(({ loose }) => slabBox(loose)),
};

// --- Measuring lines -------------------------------------------------------------

const worldOf = (x: number, y: number, z: number): Vec => [x - layout.deckEnd / 2, y, z];

/** The gap measured from the two plinths: a line standing above the chord between them, with a leg down to each. */
const GAUGE_RISE = 1.5;
const gaugeFoot = [worldOf(nearBlockX + P.plinthLength / 2, nearTop, 0), worldOf(layout.deckEnd + layout.endGap, farTop, 0)] as const;
const gaugeHead = gaugeFoot.map((foot): Vec => [foot[0], foot[1] + GAUGE_RISE, foot[2]]);

/** The finished deck measured: a ruler along its front edge, one tick at every other joint. */
const RULER_OUT = P.depth / 2 + 0.9;
const RULER_DOWN = 0.5;
const rulerMarks = Array.from({ length: layout.count }, (_, index) => index).filter((index) => index % 2 === 0 || index === layout.count - 1);
function rulerPoint(slab: number, down: number): Point {
  const { built } = layout.slabs[slab];
  return project(worldOf(built.x, built.y - P.thickness / 2 - down, RULER_OUT));
}

// --- Fit to the board ----------------------------------------------------------

const everyPiece: Box[] = [pieces.nearBlock, pieces.nearStep, pieces.farBlock, pieces.farStep, ...pieces.built, ...pieces.loose];
const extent: Point[] = [
  ...everyPiece.flatMap((piece) => [...piece.top, ...piece.front, ...piece.end]),
  ...gaugeHead.map(project),
  ...rulerMarks.map((index) => rulerPoint(index, RULER_DOWN + 0.14)),
];

const bounds = extent.reduce(
  (b, [x, y]) => ({ minX: Math.min(b.minX, x), maxX: Math.max(b.maxX, x), minY: Math.min(b.minY, y), maxY: Math.max(b.maxY, y) }),
  { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
);
const scale = (BOARD_WIDTH - 2 * MARGIN) / (bounds.maxX - bounds.minX);
const BOARD_HEIGHT = Math.ceil((bounds.maxY - bounds.minY) * scale + 2 * MARGIN);

/** Image plane to board: one scale on both axes, y down. */
const toBoard = ([x, y]: Point): Point => [MARGIN + (x - bounds.minX) * scale, MARGIN + (bounds.maxY - y) * scale];

const fix = (n: number) => Number(n.toFixed(1));
const coord = (point: Point) => toBoard(point).map(fix).join(" ");
const polygon = (face: Face) => `M${face.map(coord).join(" L")} Z`;
const stroke = (points: Point[]) => `M${points.map(coord).join(" L")}`;

export const STONE_BOARD = { viewBox: `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}` } as const;

/** One piece as path data for each of its visible faces. */
export interface StoneFaces {
  top: string;
  front: string;
  end: string;
}

const faces = (piece: Box): StoneFaces => ({ top: polygon(piece.top), front: polygon(piece.front), end: polygon(piece.end) });

/** Where a plinth's front face starts and stops, in board y, so it can fade out below. */
function frontSpan(piece: Box): [number, number] {
  const ys = piece.front.map((point) => toBoard(point)[1]);
  return [fix(Math.min(...ys)), fix(Math.max(...ys))];
}

export const STONE = {
  count: layout.count,
  nearBlock: faces(pieces.nearBlock),
  nearStep: faces(pieces.nearStep),
  farBlock: faces(pieces.farBlock),
  farStep: faces(pieces.farStep),
  nearFade: frontSpan(pieces.nearBlock),
  farFade: frontSpan(pieces.farBlock),
  /** Slab by slab, near to far; paint them far to near. */
  built: pieces.built.map(faces),
  loose: pieces.loose.map(faces),
};

/** The saffron inlay down the middle of slabs `from` to `to`, inclusive. */
export function inlayPath(from: number, to: number) {
  const strokes: string[] = [];
  for (let index = from; index <= to; index++) strokes.push(stroke(inlay(layout.slabs[index].built)));
  return strokes.join(" ");
}

/**
 * Slabs `from` to `to` drawn as one deck: continuous front, back and underside edges, an end cap at
 * each side (the near one optional, for a run that starts against built slabs), and (separately, so
 * they can be lighter) the joints between slabs.
 */
export function deckOutline(from: number, to: number, nearCap = true) {
  const run = pieces.built.slice(from, to + 1);
  const first = run[0];
  const last = run[run.length - 1];
  const edge = (pick: (slab: Box) => [Point, Point]) => stroke([...run.map((slab) => pick(slab)[0]), pick(last)[1]]);
  return {
    edges: [
      edge((slab) => [slab.top[0], slab.top[1]]),
      edge((slab) => [slab.top[3], slab.top[2]]),
      edge((slab) => [slab.front[3], slab.front[2]]),
      ...(nearCap ? [stroke([first.top[3], first.top[0], first.front[3]])] : []),
      stroke([last.top[2], last.top[1], last.front[2]]),
    ].join(" "),
    joints: run
      .slice(0, -1)
      .map((slab) => stroke([slab.top[1], slab.top[2]]))
      .join(" "),
  };
}

/** Board position of the middle of a built slab's top, `along` -1 (near end) to 1 (far end). */
export function slabPoint(index: number, along = 0): Point {
  return toBoard(slabTop(layout.slabs[index].built, along));
}

export const GAUGE = {
  line: stroke(gaugeHead.map(project)),
  legs: gaugeFoot.map((foot, index) => stroke([project(foot), project(gaugeHead[index])])).join(" "),
  /** The same two legs, one path each (foot to head), so each can grow from its own foot. */
  legList: gaugeFoot.map((foot, index) => stroke([project(foot), project(gaugeHead[index])])),
  feet: gaugeFoot.map((foot) => toBoard(project(foot))),
};

export const RULER = {
  line: stroke(Array.from({ length: layout.count }, (_, index) => rulerPoint(index, RULER_DOWN))),
  ticks: rulerMarks.map((index) => stroke([rulerPoint(index, RULER_DOWN - 0.14), rulerPoint(index, RULER_DOWN + 0.14)])).join(" "),
};
