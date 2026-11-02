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
import { clamp } from "../../core/motion";
import { devParam } from "../../core/switches";
import type { SceneContext, SceneInstance, SceneModule, StageSize } from "../../core/types";
import { PALETTE_3D } from "../../materials/palette";
import { BRIDGE_PATH } from "./config";
import { mix, smooth } from "./math";
import { bridgeFraming, bridgeLayout, stageTan, type SlabPoses } from "./path";
import { chamferedSlab, fadedBlock, glowTexture, stoneTexture } from "./stone";

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

interface Slab extends SlabPoses {
  /** Where the built slab sits across the stage, 0 (left edge) to 1 (right edge). */
  screen: number;
}

const DEG = 180 / Math.PI;

export function createScene(context: SceneContext): SceneInstance {
  const { quality, capture } = context;
  const P = BRIDGE_PATH;

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
  const layout = bridgeLayout();
  const { count, deckEnd, endGap, rightTop, slabs: poses } = layout;
  const slabs: Slab[] = poses.map((pose) => ({ ...pose, screen: 0 }));

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

  // Fit once, at the reference aspect (see bridgeFraming): the same framing the Method plates use.
  function frame() {
    const { target, distance } = bridgeFraming(layout);
    camera.position.set(
      target[0] - distance * Math.sin(P.azimuth) * Math.cos(P.elevation),
      target[1] + distance * Math.sin(P.elevation),
      target[2] + distance * Math.cos(P.azimuth) * Math.cos(P.elevation),
    );
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateMatrixWorld();

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
    // paper at the sides instead of losing its slabs. The page's energy line (deckTrace) uses the same.
    camera.fov = DEG * 2 * Math.atan(stageTan(aspect));
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    for (const slab of slabs) {
      position.set(slab.built.x, slab.built.y, slab.built.z).add(group.position).project(camera);
      slab.screen = position.x * 0.5 + 0.5;
    }
    laidOutFor = Number.NaN;
    apply();
  }

  function update() {
    if (capture) {
      apply();
      return false;
    }
    const target = clamp(context.input("built", built));
    // No smoothing here: the page already eases the value (BridgeSeam), so the line, the handle,
    // the posters and the slabs all show the same number.
    built = target;
    apply();
    return false;
  }

  return { scene, camera, resize, update };
}

const bridgeScene: SceneModule = { createScene };
export default bridgeScene;
