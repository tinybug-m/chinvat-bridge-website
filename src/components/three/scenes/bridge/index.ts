import {
  BoxGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  Euler,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  OrthographicCamera,
  Quaternion,
  Scene,
  TorusGeometry,
  Vector3,
} from "three";
import { clamp, damp } from "../../core/motion";
import { devParam } from "../../core/switches";
import type { SceneContext, SceneInstance, SceneModule, StageSize } from "../../core/types";
import { createSeamMaterial } from "../../materials/seam";
import { BRIDGE_SPAN } from "./config";

/*
 * The Bridge: a through-truss span between two banks, from how a business
 * works today (left bank) to how it could (right bank). Left of the seam it
 * is the DRAWN maquette (grey card linework, every member a little loose,
 * some not yet drawn, and a deck only a narrow way wide); right of it,
 * BUILT: thin-film members settled into a regular truss with a full-width
 * deck. Three instanced draw calls (members, nodes, slabs) share one seam
 * material.
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
  const S = BRIDGE_SPAN;
  const rand = random(S.seed);
  const spread = (amount: number) => (rand() * 2 - 1) * amount;

  const scene = new Scene();

  // Orthographic, pitch only: an axonometric drawing, and world x = screen x.
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  const elevation = S.elevation * DEG;
  camera.position.set(0, Math.sin(elevation) * 60, Math.cos(elevation) * 60);
  camera.lookAt(0, 0, 0);
  const toCamera = camera.position.clone().normalize();

  const key = new DirectionalLight(0xffffff, 2.1);
  key.position.set(-7, 10, 6);
  const fill = new DirectionalLight(0xe4ebf1, 0.5);
  fill.position.set(8, 4, 3);
  const ambient = new HemisphereLight(0xffffff, 0xd9d3c7, 1);
  scene.add(key, key.target, fill, fill.target, ambient);

  // --- The truss ---------------------------------------------------------
  const halfSpan = (S.panels * S.panel) / 2;
  const halfDepth = S.depth / 2;
  const nodeX = (i: number) => i * S.panel - halfSpan;
  const topHeight = (i: number) => {
    const s = i / S.panels;
    return S.endHeight + (S.crownHeight - S.endHeight) * 4 * s * (1 - s);
  };
  const bottom = (i: number, side: -1 | 1) => new Vector3(nodeX(i), 0, side * halfDepth);
  const top = (i: number, side: -1 | 1) => new Vector3(nodeX(i), topHeight(i), side * halfDepth);

  // Members are tagged with whether the maquette may leave them out: chords
  // and floor beams stay, some posts and diagonals have not been drawn yet.
  const segments: [Vector3, Vector3, boolean][] = [];
  const mid = S.panels / 2;
  for (const side of [-1, 1] as const) {
    for (let i = 0; i <= S.panels; i++) {
      segments.push([bottom(i, side), top(i, side), i > 0 && i < S.panels]);
      if (i < S.panels) {
        segments.push([bottom(i, side), bottom(i + 1, side), false]);
        segments.push([top(i, side), top(i + 1, side), false]);
        // Pratt: diagonals fall toward midspan.
        segments.push(i < mid ? [top(i, side), bottom(i + 1, side), true] : [bottom(i, side), top(i + 1, side), true]);
      }
    }
  }
  for (let i = 0; i <= S.panels; i++) {
    segments.push([bottom(i, -1), bottom(i, 1), false]);
    if (i > 0 && i < S.panels) segments.push([top(i, -1), top(i, 1), false]);
  }

  const tilt = new Euler();
  const jitter = new Quaternion();
  const trim = S.ringRadius * 1.1;

  const struts: Piece[] = segments.map(([a, b, optional]) => {
    const direction = b.clone().sub(a);
    const length = direction.length();
    const quaternion = new Quaternion().setFromUnitVectors(X_AXIS, direction.normalize());
    const position = a.clone().add(b).multiplyScalar(0.5);
    // Trim at the rings so the joints read.
    const built: Pose = { position, quaternion, scale: new Vector3(length - trim, 1, 1) };
    // Loose: a drawing not yet trued up. Most members a degree or two out, a
    // few further, all a little short of their joints; never a heap.
    const stray = rand() < 0.03;
    const left = optional && rand() < S.missing;
    const angle = (stray ? 10 : 3) * DEG;
    tilt.set(spread(angle), spread(angle), spread(angle * 1.4));
    const loose: Pose = {
      position: position
        .clone()
        .add(new Vector3(spread(stray ? 0.17 : 0.05), spread(0.03) - rand() * (stray ? 0.22 : 0.08), spread(stray ? 0.17 : 0.05))),
      quaternion: quaternion.clone().premultiply(jitter.setFromEuler(tilt)),
      scale: left ? new Vector3(0.001, 0.001, 0.001) : new Vector3((length - trim) * (0.86 + rand() * 0.08), 1, 1),
    };
    return { x: position.x, built, loose };
  });

  const facing = new Quaternion().setFromUnitVectors(Z_AXIS, toCamera);
  const rings: Piece[] = [];
  for (const side of [-1, 1] as const) {
    for (let i = 0; i <= S.panels; i++) {
      for (const position of [bottom(i, side), top(i, side)]) {
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
  }

  // --- Deck and banks ------------------------------------------------------
  const identity = new Quaternion();
  const slabs: Piece[] = [];
  for (let i = 0; i < S.panels; i++) {
    const x = nodeX(i) + S.panel / 2;
    const y = S.deckThickness / 2 - 0.02;
    const built: Pose = {
      position: new Vector3(x, y, 0),
      quaternion: identity,
      scale: new Vector3(S.panel * 0.94, S.deckThickness, S.depth * 0.96),
    };
    // Drawn: only a narrow way across, wandering a little and not yet laid flat.
    tilt.set(spread(2 * DEG), spread(3 * DEG), spread(2.5 * DEG));
    const loose: Pose = {
      position: new Vector3(x + spread(0.06), y - rand() * 0.1, spread(0.4)),
      quaternion: identity.clone().premultiply(jitter.setFromEuler(tilt)),
      scale: new Vector3(S.panel * (0.8 + rand() * 0.12), S.deckThickness, S.depth * S.deckDrawn * (0.8 + rand() * 0.4)),
    };
    slabs.push({ x, built, loose });
  }
  const bankDepth = S.depth * 1.5;
  for (const side of [-1, 1] as const) {
    const pose: Pose = {
      position: new Vector3(side * (halfSpan + S.bankWidth / 2 - 0.9), -S.bankHeight / 2 - 0.2, 0),
      quaternion: identity,
      scale: new Vector3(S.bankWidth, S.bankHeight, bankDepth),
    };
    slabs.push({ x: pose.position.x, built: pose, loose: pose });
  }

  const { material, uniforms } = createSeamMaterial({
    envMap: context.environment(),
    tier,
    halfDepth: bankDepth / 2,
    seamX: 0,
  });
  uniforms.uSeamLineWidth.value = 0.02;
  uniforms.uSeamLineStrength.value = 1.6;
  // Cool grey linework (a shade under the strong rule colour), so the drawn half holds its
  // own against the film without turning into a second material.
  uniforms.uMatteColor.value.setHex(0xa3acb2);
  uniforms.uMatteRoughness.value = 0.9;
  uniforms.uFilmGlow.value = 0.26;

  const strutMesh = new InstancedMesh(new BoxGeometry(1, S.strut, S.strut), material, struts.length);
  const ringMesh = new InstancedMesh(new TorusGeometry(S.ringRadius, S.ringTube, 4, 14), material, rings.length);
  const slabMesh = new InstancedMesh(new BoxGeometry(1, 1, 1), material, slabs.length);
  for (const mesh of [strutMesh, ringMesh, slabMesh]) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    scene.add(mesh);
  }

  // --- Framing: what the camera must hold, in view space --------------------
  const cos = Math.cos(elevation);
  const sin = Math.sin(elevation);
  const totalWidth = 2 * (halfSpan + S.bankWidth - 0.9);
  const viewTop = (S.crownHeight + S.ringRadius) * cos + halfDepth * sin;
  const viewBottom = -(S.bankHeight + 0.2) * cos - (bankDepth / 2) * sin;
  const viewMiddle = (viewTop + viewBottom) / 2;

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
      const t = smooth(clamp((piece.x - (seam - 2 * S.band)) / (2 * S.band)));
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
    layOut(slabMesh, slabs, seam);
  }

  function resize(size: StageSize) {
    const aspect = size.width / Math.max(1, size.height);
    let viewHeight = (viewTop - viewBottom) * S.margin;
    viewWidth = viewHeight * aspect;
    // Wide stages show the whole span; narrow ones crop the banks first.
    if (viewWidth > totalWidth) {
      viewWidth = totalWidth;
      viewHeight = viewWidth / aspect;
    } else if (viewWidth < totalWidth * S.minShare) {
      viewWidth = totalWidth * S.minShare;
      viewHeight = viewWidth / aspect;
    }
    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2 + viewMiddle;
    camera.bottom = -viewHeight / 2 + viewMiddle;
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
