import {
  BoxGeometry,
  DirectionalLight,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  OrthographicCamera,
  Quaternion,
  Scene,
  TorusGeometry,
  Vector3,
  Euler,
  DynamicDrawUsage,
} from "three";
import { clamp, damp } from "../../core/motion";
import { devParam } from "../../core/switches";
import type { SceneContext, SceneInstance, SceneModule, StageSize } from "../../core/types";
import { createSeamMaterial } from "../../materials/seam";
import { BRIDGE_FIELD } from "./config";

/*
 * The Bridge: a space-frame strut field. Left of the seam it is the DRAWN
 * maquette (grey card linework, every strut and ring a little loose: seeded small
 * rotations, offsets and sag); right of it, BUILT: thin-film struts settled
 * into a regular triangulated lattice. Two instanced draw calls share one
 * seam material.
 *
 * Inputs (StageHandle.set):
 *   built  0..1  share modernised; the seam sits at (1 - built) of the width
 *
 * Capture (?poster=1): renders fully drawn, or fully built with &bridge=built.
 */

const DEG = Math.PI / 180;
const X_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);

/** Seeded PRNG (mulberry32), so the maquette is the same on every visit and in the posters. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Pose {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
}

interface Piece {
  /** Aligned x, which decides when the piece settles. */
  x: number;
  built: Pose;
  loose: Pose;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

export function createScene(context: SceneContext): SceneInstance {
  const { quality, capture } = context;
  const tier = quality.tier === "low" ? "low" : "high";
  const F = BRIDGE_FIELD;
  const rand = random(F.seed);
  const spread = (amount: number) => (rand() * 2 - 1) * amount;

  const scene = new Scene();

  // Orthographic, pitch only: an axonometric drawing, and world x = screen x.
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const elevation = F.elevation * DEG;
  camera.position.set(0, Math.sin(elevation) * 60, Math.cos(elevation) * 60);
  camera.lookAt(0, 0, 0);
  const toCamera = camera.position.clone().normalize();

  const key = new DirectionalLight(0xffffff, 2.1);
  key.position.set(-7, 10, 6);
  const fill = new DirectionalLight(0xe4ebf1, 0.5);
  fill.position.set(8, 4, 3);
  const ambient = new HemisphereLight(0xffffff, 0xd9d3c7, 1);
  scene.add(key, key.target, fill, fill.target, ambient);

  // --- The lattice -------------------------------------------------------
  const halfThickness = F.thickness / 2;
  const x0 = ((F.columns - 1) * F.bay) / 2;
  const z0 = ((F.rows - 1) * F.bay) / 2;
  const top = (i: number, k: number) => new Vector3(i * F.bay - x0, halfThickness, k * F.bay - z0);
  const bottom = (i: number, k: number) =>
    new Vector3((i + 0.5) * F.bay - x0, -halfThickness, (k + 0.5) * F.bay - z0);

  const segments: [Vector3, Vector3][] = [];
  for (let k = 0; k < F.rows; k++) {
    for (let i = 0; i < F.columns; i++) {
      if (i < F.columns - 1) segments.push([top(i, k), top(i + 1, k)]);
      if (k < F.rows - 1) segments.push([top(i, k), top(i, k + 1)]);
    }
  }
  for (let k = 0; k < F.rows - 1; k++) {
    for (let i = 0; i < F.columns - 1; i++) {
      if (i < F.columns - 2) segments.push([bottom(i, k), bottom(i + 1, k)]);
      if (k < F.rows - 2) segments.push([bottom(i, k), bottom(i, k + 1)]);
      const b = bottom(i, k);
      segments.push([b, top(i, k)], [b, top(i + 1, k)], [b, top(i, k + 1)], [b, top(i + 1, k + 1)]);
    }
  }

  const tilt = new Euler();
  const jitter = new Quaternion();

  const struts: Piece[] = segments.map(([a, b]) => {
    const direction = b.clone().sub(a);
    const length = direction.length();
    const quaternion = new Quaternion().setFromUnitVectors(X_AXIS, direction.normalize());
    const position = a.clone().add(b).multiplyScalar(0.5);
    // Trim at the rings so the joints read.
    const built: Pose = { position, quaternion, scale: new Vector3(length - F.ringRadius * 1.1, 1, 1) };
    // Loose: a drawing not yet trued up. Most pieces a degree or two out, a
    // few further, all a little short of their joints; never a heap.
    const stray = rand() < 0.03;
    const angle = (stray ? 10 : 3) * DEG;
    tilt.set(spread(angle), spread(angle), spread(angle * 1.4));
    const loose: Pose = {
      position: position
        .clone()
        .add(new Vector3(spread(stray ? 0.17 : 0.05), spread(0.03) - rand() * (stray ? 0.22 : 0.08), spread(stray ? 0.17 : 0.05))),
      quaternion: quaternion.clone().premultiply(jitter.setFromEuler(tilt)),
      scale: new Vector3((length - F.ringRadius * 1.1) * (0.86 + rand() * 0.08), 1, 1),
    };
    return { x: position.x, built, loose };
  });

  const facing = new Quaternion().setFromUnitVectors(Z_AXIS, toCamera);
  const rings: Piece[] = [];
  for (let k = 0; k < F.rows; k++) {
    for (let i = 0; i < F.columns; i++) {
      const position = top(i, k);
      const built: Pose = { position, quaternion: facing, scale: new Vector3(1, 1, 1) };
      tilt.set(spread(12 * DEG), spread(12 * DEG), spread(6 * DEG));
      const loose: Pose = {
        position: position.clone().add(new Vector3(spread(0.07), -rand() * 0.1, spread(0.07))),
        quaternion: facing.clone().multiply(jitter.setFromEuler(tilt)),
        scale: new Vector3(0.86, 0.86, 0.86),
      };
      rings.push({ x: position.x, built, loose });
    }
  }

  const { material, uniforms } = createSeamMaterial({
    envMap: context.environment(),
    tier,
    halfDepth: z0 + F.bay * 0.5,
    seamX: 0,
  });
  uniforms.uSeamLineWidth.value = 0.02;
  uniforms.uSeamLineStrength.value = 1.6;
  // Cool grey linework (a shade under the strong rule colour), so the drawn half holds its
  // own against the film without turning into a second material.
  uniforms.uMatteColor.value.setHex(0xa3acb2);
  uniforms.uMatteRoughness.value = 0.9;
  uniforms.uFilmGlow.value = 0.26;

  const strutGeometry = new BoxGeometry(1, F.strut, F.strut);
  const ringGeometry = new TorusGeometry(F.ringRadius, F.ringTube, 4, 14);
  const strutMesh = new InstancedMesh(strutGeometry, material, struts.length);
  const ringMesh = new InstancedMesh(ringGeometry, material, rings.length);
  for (const mesh of [strutMesh, ringMesh]) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    scene.add(mesh);
  }

  // --- Seam ---------------------------------------------------------------
  const matrix = new Matrix4();
  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();
  let viewWidth = 1;

  const captureBuilt = capture && devParam("bridge") === "built";
  let built = capture ? (captureBuilt ? 1 : 0) : context.input("built", 0.5);
  let laidOutFor = Number.NaN;

  function seamX() {
    if (capture) return captureBuilt ? -1e3 : 1e3;
    return (0.5 - built) * viewWidth;
  }

  function layOut(mesh: InstancedMesh, pieces: Piece[], seam: number) {
    for (let index = 0; index < pieces.length; index++) {
      const piece = pieces[index];
      // 0 = loose (drawn side), 1 = settled (built side). Pieces settle on
      // the drawn side of the seam, so nothing half-loose crosses into the film.
      const t = smooth(clamp((piece.x - (seam - 2 * F.band)) / (2 * F.band)));
      position.lerpVectors(piece.loose.position, piece.built.position, t);
      quaternion.slerpQuaternions(piece.loose.quaternion, piece.built.quaternion, t);
      scale.lerpVectors(piece.loose.scale, piece.built.scale, t);
      mesh.setMatrixAt(index, matrix.compose(position, quaternion, scale));
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  function apply() {
    const seam = seamX();
    uniforms.uSeamX.value = seam;
    uniforms.uPhase.value = 0.08 + built * 0.3;
    if (seam === laidOutFor) return;
    laidOutFor = seam;
    layOut(strutMesh, struts, seam);
    layOut(ringMesh, rings, seam);
  }

  function resize(size: StageSize) {
    const aspect = size.width / Math.max(1, size.height);
    const projected = F.rows * F.bay * Math.sin(elevation) + F.thickness * Math.cos(elevation);
    let viewHeight = projected * F.margin;
    viewWidth = viewHeight * aspect;
    const widest = (F.columns - 1.5) * F.bay;
    if (viewWidth > widest) {
      viewWidth = widest;
      viewHeight = viewWidth / aspect;
    }
    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2 + F.centreY;
    camera.bottom = -viewHeight / 2 + F.centreY;
    camera.updateProjectionMatrix();
    laidOutFor = Number.NaN;
    apply();
  }

  function update(deltaMs: number) {
    if (capture) {
      apply();
      return false;
    }
    const target = clamp(context.input("built", built));
    built = damp(built, target, 8, deltaMs);
    const moving = Math.abs(built - target) > 1e-4;
    if (!moving) built = target;
    apply();
    return moving;
  }

  return { scene, camera, resize, update };
}

const bridgeScene: SceneModule = { createScene };
export default bridgeScene;
