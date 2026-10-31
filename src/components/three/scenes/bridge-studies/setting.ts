import {
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
} from "three";
import type { SceneContext, StageSize } from "../../core/types";
import { PALETTE_3D } from "../../materials/palette";
import { BRIDGE_PATH } from "../bridge/config";
import { bridgeFraming, bridgeLayout } from "../bridge/path";
import { fadedBlock, glowTexture, stoneTexture } from "../bridge/stone";
import { createRig } from "./rig";

/*
 * The Approach's setting, rebuilt for the studies so every alternative
 * stands where the original stands: the same paper fog, light, travertine,
 * saffron, the same two plinths at the same heights, the same low
 * three-quarter camera and the same warm glow behind the far end. Only the
 * span between the plinths changes. (scenes/bridge is not imported for its
 * scene, only for its config, path and stone pieces, so it stays untouched.)
 *
 * The group is offset like the Approach's: path x runs from 0 at the near
 * plinth to layout.deckEnd at the far one, and lift(x) is the deck's top.
 */

export function createSetting(context: SceneContext, { plinths = true }: { plinths?: boolean } = {}) {
  const P = BRIDGE_PATH;
  const tier: "high" | "low" = context.quality.tier === "low" ? "low" : "high";
  const layout = bridgeLayout();
  const { deckEnd, endGap, rightTop } = layout;

  const scene = new Scene();
  const camera = new PerspectiveCamera(P.fov, P.referenceAspect, 0.5, 400);

  scene.add(new HemisphereLight(0xf4f6fa, 0x5f82b0, 1.55));
  const key = new DirectionalLight(0xfff6e6, 2.5);
  key.position.set(-14, 16, -1);
  scene.add(key);

  const map = stoneTexture();
  map.anisotropy = tier === "low" ? 1 : 4;
  const stone = new MeshLambertMaterial({ color: 0xf7f4ec, map, toneMapped: false });
  const plinthStone = new MeshLambertMaterial({
    color: 0xf3efe4,
    map,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const saffron = new MeshLambertMaterial({
    color: PALETTE_3D.saffron,
    emissive: PALETTE_3D.saffronLight,
    emissiveIntensity: 0.45,
    fog: false,
    toneMapped: false,
  });

  const group = new Group();
  group.position.x = -deckEnd / 2;
  scene.add(group);

  /** A block whose top is at `top`, fading out below, like the Approach's plinths. */
  const block = (x: number, top: number, length: number, height: number, depth: number, fadeTo = 0.95) => {
    const mesh = new Mesh(fadedBlock(length, height, depth, 0.05, fadeTo), plinthStone);
    mesh.position.set(x, top - height / 2, 0);
    mesh.renderOrder = 2;
    return mesh;
  };

  const near = { x: -endGap - P.plinthLength / 2 - 0.3, top: 0 };
  const far = { x: deckEnd + endGap + P.plinthLength / 2, top: rightTop };
  if (plinths) {
    const step = (x: number, top: number) => block(x, top - 0.34, 0.8, P.plinthHeight - 0.34, P.plinthDepth * 0.9, 0.7);
    group.add(
      block(near.x, near.top, P.plinthLength, P.plinthHeight, P.plinthDepth),
      step(near.x + P.plinthLength / 2 + 0.4, near.top),
      block(far.x, far.top, P.plinthLength, P.plinthHeight, P.plinthDepth),
      step(deckEnd + endGap - 0.4, far.top),
    );
  }

  const glow = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false, fog: false, toneMapped: false }),
  );
  glow.renderOrder = -1;
  scene.add(glow);

  const { target, distance } = bridgeFraming(layout);
  const rig = createRig(camera, context, {
    target,
    distance,
    azimuth: P.azimuth,
    elevation: P.elevation,
    fov: P.fov,
    referenceAspect: P.referenceAspect,
    maxAspect: P.maxAspect,
  });

  // Fog and glow exactly as the Approach frames them, from the rest view.
  const span = deckEnd + 2 * P.plinthLength + 1.1;
  const reach = (span / 2) * Math.sin(P.azimuth);
  scene.fog = new Fog(PALETTE_3D.paperRaised, distance - reach * 0.7, distance + reach * 1.9);
  const forward = new Vector3();
  camera.getWorldDirection(forward);
  glow.position
    .set(deckEnd + 1.2, rightTop + 0.2, 0)
    .add(group.position)
    .addScaledVector(forward, P.plinthDepth * 1.5);
  glow.quaternion.copy(camera.quaternion);
  const viewHeight = 2 * glow.position.distanceTo(camera.position) * Math.tan((P.fov * Math.PI) / 360);
  glow.scale.set(viewHeight * P.referenceAspect * 1.15, viewHeight * 1.18, 1);

  return {
    scene,
    camera,
    group,
    layout,
    tier,
    materials: { stone, plinthStone, saffron },
    block,
    near,
    far,
    rig,
    resize(size: StageSize) {
      rig.resize(size);
    },
    /** Moves the camera toward the view inputs; true while it is still moving. */
    orbit(deltaMs: number) {
      const moving = rig.update(deltaMs);
      glow.quaternion.copy(camera.quaternion);
      return moving;
    },
  };
}

export type Setting = ReturnType<typeof createSetting>;
