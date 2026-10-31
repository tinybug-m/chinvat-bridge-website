import { Mesh, type PerspectiveCamera } from "three";
import type { SceneContext, SceneInstance, SceneModule, StageSize } from "../../core/types";
import { createScene as createBridgeScene } from "../bridge";
import { BRIDGE_PATH } from "../bridge/config";
import { bridgeFraming, bridgeLayout } from "../bridge/path";
import { createRig } from "./rig";

/*
 * Study 00: the shipped Approach bridge, untouched. Its scene is created as
 * is (scenes/bridge), with two things added from outside: the orbit rig
 * moves its camera around the same target the Approach frames, and `built`
 * reaches it damped, with the same build-in as the alternatives. Between 0
 * and 1 it keeps its own behaviour: the seam splits the stage, loose stone on
 * the left, the level deck on the right.
 */

export function createScene(context: SceneContext): SceneInstance {
  let shown = 0;
  // The Approach reads `built` straight from its inputs; hand it the damped value instead.
  const inner = createBridgeScene({
    ...context,
    input: (key, fallback) => (key === "built" ? shown : context.input(key, fallback)),
  });
  const camera = inner.camera as PerspectiveCamera;
  const { target, distance } = bridgeFraming(bridgeLayout());
  const rig = createRig(camera, context, {
    target,
    distance,
    azimuth: BRIDGE_PATH.azimuth,
    elevation: BRIDGE_PATH.elevation,
    fov: BRIDGE_PATH.fov,
    referenceAspect: BRIDGE_PATH.referenceAspect,
  });
  // The warm glow is a plane turned to face the Approach camera once; keep it facing the orbiting one.
  const glow = inner.scene.children.find((child) => child instanceof Mesh && child.renderOrder === -1);

  shown = rig.progress(0).value;

  return {
    scene: inner.scene,
    camera,
    resize(size: StageSize) {
      // The Approach's own crop; it also re-projects the slabs against the seam from the current view.
      inner.resize?.(size);
    },
    update(deltaMs, elapsed) {
      const orbiting = rig.update(deltaMs);
      glow?.quaternion.copy(camera.quaternion);
      const { value, moving } = rig.progress(deltaMs);
      shown = value;
      inner.update?.(deltaMs, elapsed);
      return orbiting || moving;
    },
    dispose() {
      inner.dispose?.();
    },
  };
}

const originalStudy: SceneModule = { createScene };
export default originalStudy;
