import {
  DirectionalLight,
  Group,
  HemisphereLight,
  LineSegments,
  Mesh,
  PerspectiveCamera,
  Scene,
} from "three";
import { EASE, clamp, damp } from "../../core/motion";
import type { SceneContext, SceneInstance, SceneModule, StageSize } from "../../core/types";
import { createMarkGeometry, createMarkOutline } from "../../geometry/mark";
import { pxToWorld } from "../../geometry/mark-outline";
import { createMarkShadow } from "../../geometry/shadow";
import { createPencilMaterial } from "../../materials/pencil";
import { createSeamMaterial } from "../../materials/seam";
import { SEAM_FRAME, SEAM_FRAME_UNITS, SEAM_SCENE } from "./config";

/*
 * The hero exhibit: the brand mark as a sculpture mounted on the paper. The
 * left half is the DRAWN maquette, the right half BUILT glass, split at the
 * mark's own axis. Scrolling sweeps the seam left until the whole mark is
 * built; the pointer tilts it a few degrees.
 *
 * Inputs (StageHandle.set):
 *   progress  0..1   scroll through the hero; 1 = fully built
 *   tiltX     -1..1  pointer x across the viewport, 0 = centre (fine pointers only)
 *   tiltY     -1..1  pointer y
 *
 * The page's seam hairline stays on the mark's axis (the rest pose); only the
 * material seam travels.
 */

const DEG = Math.PI / 180;

export function createScene(context: SceneContext): SceneInstance {
  const { quality, capture } = context;
  const tier = quality.tier === "low" ? "low" : "high";
  const { depth, bevel, bevelSegments, cameraDistance, maxYaw, maxPitch, seamReach } = SEAM_SCENE;
  const halfDepth = depth / 2;
  const silhouetteZ = halfDepth;

  const scene = new Scene();

  // Camera on a rig pivoting at the object's centre: tilting the rig is the
  // same as tilting the object, but the lights, the baked shadow and the
  // studio reflections stay put, so the glass catches new light as it turns.
  const rig = new Group();
  const camera = new PerspectiveCamera(22, 1, 0.5, 200);
  const [, frameCentreY] = pxToWorld(0, SEAM_FRAME.y + SEAM_FRAME.height / 2);
  camera.position.set(0, frameCentreY, silhouetteZ + cameraDistance);
  rig.add(camera);
  scene.add(rig);

  // Light: a grazing key from the upper left so bevels and walls read on the
  // white card, a cool fill from the right and a soft sky/ground ambient.
  const key = new DirectionalLight(0xffffff, 2.3);
  key.position.set(-6, 7.5, 7);
  const fill = new DirectionalLight(0xe4ebf1, 0.45);
  fill.position.set(8, -2, 6);
  const ambient = new HemisphereLight(0xffffff, 0xd9d3c7, 0.95);
  scene.add(key, key.target, fill, fill.target, ambient);

  const environment = context.environment();
  const { material, uniforms } = createSeamMaterial({ envMap: environment, tier, halfDepth, seamX: 0 });
  const mark = new Mesh(createMarkGeometry({ depth, bevel, bevelSegments }), material);
  scene.add(mark);

  const pencil = createPencilMaterial({ opacity: 0.62 });
  const outline = new LineSegments(createMarkOutline(silhouetteZ + bevel * 0.55), pencil.material);
  outline.renderOrder = 2;
  scene.add(outline);

  const shadow = createMarkShadow({
    frame: SEAM_FRAME,
    z: -halfDepth - 0.14,
    resolution: tier === "high" ? 1024 : 512,
  });
  scene.add(shadow.mesh);

  // Motion state. The intro sweeps the seam in from the right (fully drawn)
  // to the axis; scrolling adds a sweep from the axis to the far left.
  const playIntro = context.firstMount && !capture;
  let introClock = playIntro ? 0 : Infinity;
  let progress = capture ? 0 : context.input("progress");
  let tiltX = 0;
  let tiltY = 0;

  function introOffset() {
    if (!playIntro) return 0;
    const t = clamp((introClock - SEAM_SCENE.introDelay) / SEAM_SCENE.introDuration);
    return seamReach * (1 - EASE.drawn(t));
  }

  function apply() {
    const seamX = clamp(introOffset() - seamReach * EASE.drawn(progress), -seamReach, seamReach);
    uniforms.uSeamX.value = seamX;
    pencil.uniforms.uSeamX.value = seamX;
    shadow.uniforms.uSeamX.value = seamX;
    // The film drifts with the tilt and the scroll, like light moving across glass.
    uniforms.uPhase.value = 0.06 + tiltX * 0.045 - tiltY * 0.02 + progress * 0.22;
    rig.rotation.set(tiltY * maxPitch * DEG, -tiltX * maxYaw * DEG, 0, "YXZ");
    rig.updateMatrixWorld();
  }

  function resize(size: StageSize) {
    const aspect = size.width / size.height;
    const frameAspect = SEAM_FRAME_UNITS.width / SEAM_FRAME_UNITS.height;
    // "contain": the whole frame fits, centred, whatever the canvas shape.
    const halfHeight = aspect >= frameAspect ? SEAM_FRAME_UNITS.height / 2 : SEAM_FRAME_UNITS.width / aspect / 2;
    camera.fov = (2 * Math.atan(halfHeight / cameraDistance)) / DEG;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    apply();
  }

  function update(deltaMs: number) {
    if (capture) {
      apply();
      return false;
    }
    let moving = false;
    if (playIntro && introClock < SEAM_SCENE.introDelay + SEAM_SCENE.introDuration) {
      introClock += deltaMs;
      moving = true;
    }
    const targetProgress = context.input("progress");
    const targetX = context.input("tiltX");
    const targetY = context.input("tiltY");
    progress = damp(progress, targetProgress, 9, deltaMs);
    tiltX = damp(tiltX, targetX, 4.5, deltaMs);
    tiltY = damp(tiltY, targetY, 4.5, deltaMs);
    if (Math.abs(progress - targetProgress) > 1e-4) moving = true;
    else progress = targetProgress;
    if (Math.abs(tiltX - targetX) > 1e-4 || Math.abs(tiltY - targetY) > 1e-4) moving = true;
    else {
      tiltX = targetX;
      tiltY = targetY;
    }
    apply();
    return moving;
  }

  return {
    scene,
    camera,
    resize,
    update,
    dispose() {
      shadow.texture.dispose();
    },
  };
}

const seamScene: SceneModule = { createScene };
export default seamScene;
