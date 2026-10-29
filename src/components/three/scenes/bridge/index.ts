import {
  BoxGeometry,
  DirectionalLight,
  DynamicDrawUsage,
  Euler,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  Vector3,
} from "three";
import { clamp, damp } from "../../core/motion";
import { devParam } from "../../core/switches";
import type { SceneContext, SceneInstance, SceneModule, StageSize } from "../../core/types";
import { PALETTE_3D } from "../../materials/palette";
import { BRIDGE_PATH } from "./config";
import { chamferedSlab, fadedBlock, glowTexture, mix, random, smooth, stoneTexture } from "./stone";

/*
 * The Bridge: a path of pale stone slabs rising from a low near plinth to a
 * higher far one, with nothing under it and nothing around it. Left of the
 * seam it is how things work today: the slabs are small, far apart, sunk,
 * yawed and a few tilted, and the way across is only inferred. Right of it,
 * the slabs have grown, levelled and closed up into one broad deck that
 * climbs to the far plinth, with a thin saffron inlay down its middle.
 *
 * Slabs settle from loose to level by where they sit on the stage (the seam is
 * a vertical line on the page, and the camera is a perspective one, so
 * world x is not screen x). The camera is framed once for a reference aspect
 * and then cropped like object-cover, so the posters, which are cover-fitted,
 * show the same picture as the canvas.
 *
 * The slabs and their inlays are two instanced draw calls; the plinths are
 * four static meshes that fade out below, and a faint warm glow sits behind
 * the far end. Nothing animates by itself: the loop only runs while the seam
 * moves.
 *
 * Inputs (StageHandle.set):
 *   built  0..1  share modernised; the seam sits at (1 - built) of the width
 *
 * Capture (?poster=1): renders fully drawn, or fully built with &bridge=built.
 */

interface Pose {
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

interface Slab {
  built: Pose;
  loose: Pose;
  /** Where the built slab sits across the stage, 0 (left edge) to 1 (right edge). */
  screen: number;
}

const DEG = 180 / Math.PI;

export function createScene(context: SceneContext): SceneInstance {
  const { quality, capture } = context;
  const P = BRIDGE_PATH;
  const rand = random(P.seed);

  const scene = new Scene();
  const camera = new PerspectiveCamera(P.fov, P.referenceAspect, 0.5, 400);

  scene.add(new HemisphereLight(0xf4f6fa, 0x5f82b0, 1.55));
  const key = new DirectionalLight(0xfff6e6, 2.5);
  key.position.set(-14, 16, -1);
  scene.add(key);

  // Not tone mapped: the stone is lit and coloured to read as it does on the page, and the
  // runtime's tone mapping would grey it. The fog is the page colour, so the far end dissolves into it.
  const map = stoneTexture();
  map.anisotropy = quality.tier === "low" ? 1 : 4;
  const slabMaterial = new MeshLambertMaterial({ color: 0xf7f4ec, map, toneMapped: false });
  const plinthMaterial = new MeshLambertMaterial({
    color: 0xf3efe4,
    map,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const inlayMaterial = new MeshLambertMaterial({
    color: PALETTE_3D.saffron,
    emissive: PALETTE_3D.saffronLight,
    emissiveIntensity: 0.45,
    fog: false,
    toneMapped: false,
  });

  // --- The path ------------------------------------------------------------
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

  const slabs: Slab[] = [];
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
    slabs.push({ built, loose, screen: 0 });
  }
  // A few slabs are visibly tilted, so the loose state reads as unfinished rather than merely sparse.
  slabs[1].loose.roll = 0.2;
  slabs[3].loose.pitch = -0.17;
  slabs[3].loose.yaw += 0.22;
  slabs[5].loose.roll = -0.14;
  slabs[6].loose.pitch = 0.1;

  const group = new Group();
  group.position.x = -deckEnd / 2;
  scene.add(group);

  const slabMesh = new InstancedMesh(
    chamferedSlab(P.length, P.thickness, P.depth, P.bevel),
    slabMaterial,
    count,
  );
  // The inlay runs down each slab's middle; the last instance sits on the far plinth and appears with the last slab.
  const inlayMesh = new InstancedMesh(new BoxGeometry(1, 0.014, 0.12), inlayMaterial, count + 1);
  for (const mesh of [slabMesh, inlayMesh]) {
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  const endGap = 0.07;
  const rightTop = P.rise;
  const makeBlock = (x: number, top: number) => {
    const mesh = new Mesh(fadedBlock(P.plinthLength, P.plinthHeight, P.plinthDepth, 0.05, 0.95), plinthMaterial);
    mesh.position.set(x, top - P.plinthHeight / 2, 0);
    mesh.renderOrder = 2;
    return mesh;
  };
  // Each plinth has one low step toward the path, like the stepped terraces at Persepolis.
  const makeStep = (x: number, top: number) => {
    const height = P.plinthHeight - 0.34;
    const mesh = new Mesh(fadedBlock(0.8, height, P.plinthDepth * 0.9, 0.05, 0.7), plinthMaterial);
    mesh.position.set(x, top - 0.34 - height / 2, 0);
    mesh.renderOrder = 2;
    return mesh;
  };
  const leftBlock = makeBlock(-endGap - P.plinthLength / 2 - 0.3, 0);
  const leftStep = makeStep(leftBlock.position.x + P.plinthLength / 2 + 0.4, 0);
  const rightBlock = makeBlock(deckEnd + endGap + P.plinthLength / 2, rightTop);
  const rightStep = makeStep(deckEnd + endGap - 0.4, rightTop);
  group.add(leftBlock, leftStep, rightBlock, rightStep);

  const matrix = new Matrix4();
  const position = new Vector3();
  const scale = new Vector3();
  const quaternion = new Quaternion();
  const euler = new Euler();
  const noRotation = new Quaternion();
  const inlayMatrix = new Matrix4();
  const plinthInlayX = rightBlock.position.x - 0.05;

  // The glow is a camera-facing plane behind everything, so it can only ever sit behind the stone.
  const glow = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, fog: false, toneMapped: false }),
  );
  glow.renderOrder = -1;
  scene.add(glow);

  // --- Framing ---------------------------------------------------------------
  const span = deckEnd + 2 * P.plinthLength + 1.1;
  const referenceTan = Math.tan((P.fov * Math.PI) / 360) * P.referenceAspect;

  // Fit once, at the reference aspect: the two plinth ends land symmetrically about the middle of the
  // stage, and the path sits in the middle of its height, so moderately wide stages crop only empty space.
  function frame() {
    const target = new Vector3(0, -0.6 + P.rise * 0.5, 0);
    let distance = span / (P.fit * 2 * referenceTan);
    const farBack = new Vector3(rightBlock.position.x + P.plinthLength / 2, rightTop, -P.plinthDepth / 2);
    const nearFront = new Vector3(leftBlock.position.x - P.plinthLength / 2, 0, P.plinthDepth / 2);
    const nearLow = nearFront.clone().setY(-P.plinthHeight / 2);
    const [near, far, low] = [nearFront, farBack, nearLow].map((point) => point.add(group.position));
    const right = new Vector3();
    const up = new Vector3();
    const place = () => {
      camera.position.set(
        target.x - distance * Math.sin(P.azimuth) * Math.cos(P.elevation),
        target.y + distance * Math.sin(P.elevation),
        target.z + distance * Math.cos(P.azimuth) * Math.cos(P.elevation),
      );
      camera.lookAt(target);
      camera.updateMatrixWorld();
    };
    const halfHeight = Math.tan((P.fov * Math.PI) / 360);
    for (let pass = 0; pass < 6; pass++) {
      place();
      const a = near.clone().project(camera);
      const b = far.clone().project(camera);
      const bottom = low.clone().project(camera);
      distance *= (b.x - a.x) / (2 * P.fit);
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      target.addScaledVector(right, ((a.x + b.x) / 2) * distance * referenceTan);
      target.addScaledVector(up, ((bottom.y + b.y) / 2) * distance * halfHeight);
    }
    place();

    const reach = (span / 2) * Math.sin(P.azimuth);
    scene.fog = new Fog(PALETTE_3D.paperRaised, distance - reach * 0.7, distance + reach * 1.9);

    // Behind the far end, facing the camera, a little wider than the stage.
    const forward = new Vector3();
    camera.getWorldDirection(forward);
    glow.position
      .set(deckEnd + 1.2, rightTop + 0.2, 0)
      .add(group.position)
      .addScaledVector(forward, P.plinthDepth * 1.5);
    glow.quaternion.copy(camera.quaternion);
    const viewHeight = 2 * glow.position.distanceTo(camera.position) * Math.tan((P.fov * Math.PI) / 360);
    glow.scale.set(viewHeight * P.referenceAspect * 1.15, viewHeight * 1.18, 1);
  }
  frame();

  // --- Seam ------------------------------------------------------------------
  const captureBuilt = capture && devParam("bridge") === "built";
  let built = capture ? (captureBuilt ? 1 : 0) : context.input("built", 0.5);
  let laidOutFor = Number.NaN;

  /** Seam position across the stage, 0 (left edge) to 1 (right edge). */
  function seamFraction() {
    if (capture) return captureBuilt ? -1e3 : 1e3;
    return 1 - built;
  }

  function layOut(seam: number) {
    for (let index = 0; index < count; index++) {
      const { built: end, loose: start, screen } = slabs[index];
      // 0 = loose (drawn side), 1 = level (built side). Slabs settle on the drawn side of the seam,
      // so nothing half-loose crosses into the built deck.
      const t = smooth((screen - (seam - P.band)) / P.band);
      position.set(mix(start.x, end.x, t), mix(start.y, end.y, t), mix(start.z, end.z, t));
      euler.set(mix(start.pitch, end.pitch, t), mix(start.yaw, end.yaw, t), mix(start.roll, end.roll, t), "YXZ");
      quaternion.setFromEuler(euler);
      scale.set(mix(start.sx, end.sx, t), mix(start.sy, end.sy, t), mix(start.sz, end.sz, t));
      matrix.compose(position, quaternion, scale);
      slabMesh.setMatrixAt(index, matrix);

      // The inlay shows only once the slab is nearly level; the last one runs on to the plinth.
      const last = index === count - 1;
      const reveal = smooth((t - 0.55) / 0.45);
      inlayMatrix
        .compose(
          position.set(last ? 0.05 : 0, P.thickness / 2 + 0.004, 0),
          noRotation,
          scale.set(Math.max(0.001, (P.length - 0.03 + (last ? 0.1 : 0)) * reveal), 1, 1),
        )
        .premultiply(matrix);
      inlayMesh.setMatrixAt(index, inlayMatrix);
      // The strip on the far plinth follows the last slab, so the drawn side has no inlay at all.
      if (last) {
        inlayMatrix.compose(
          position.set(plinthInlayX, rightTop + 0.004, 0),
          noRotation,
          scale.set(Math.max(0.001, (P.plinthLength - 0.5) * reveal), 1, 1),
        );
        inlayMesh.setMatrixAt(count, inlayMatrix);
      }
    }
    slabMesh.instanceMatrix.needsUpdate = true;
    inlayMesh.instanceMatrix.needsUpdate = true;
  }

  function apply() {
    const seam = seamFraction();
    if (seam === laidOutFor) return;
    laidOutFor = seam;
    layOut(seam);
  }

  function resize(size: StageSize) {
    const aspect = size.width / Math.max(1, size.height);
    camera.aspect = aspect;
    // Wider than the reference: keep its width and crop top and bottom, like object-cover on the posters.
    // Past maxAspect the crop stops, so on ultra-wide stages the path keeps its height and gains empty
    // paper at the sides instead of losing its slabs.
    const cropAspect = Math.min(aspect, P.maxAspect);
    camera.fov =
      cropAspect >= P.referenceAspect ? DEG * 2 * Math.atan((Math.tan((P.fov * Math.PI) / 360) * P.referenceAspect) / cropAspect) : P.fov;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    for (const slab of slabs) {
      position.set(slab.built.x, slab.built.y, slab.built.z).add(group.position).project(camera);
      slab.screen = position.x * 0.5 + 0.5;
    }
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
