import type { SceneContext, SceneInstance } from "../../core/types";
import { createSetting, type Setting } from "./setting";

/*
 * The frame every Nine Spears study shares: the Approach's setting, the
 * orbit, and a lay-out callback run only when the damped `built` changes.
 * `extra` runs every frame (film phase and the like).
 */
export function spearsScene(
  context: SceneContext,
  build: (setting: Setting) => { layOut(built: number): void; extra?(): void },
): SceneInstance {
  const setting = createSetting(context);
  const { scene, camera, rig } = setting;
  const { layOut, extra } = build(setting);

  let laidOutFor = Number.NaN;
  const apply = (built: number) => {
    if (built === laidOutFor) return;
    laidOutFor = built;
    layOut(built);
  };
  apply(rig.progress(0).value);

  return {
    scene,
    camera,
    resize: setting.resize,
    update(deltaMs) {
      const orbiting = setting.orbit(deltaMs);
      const { value, moving } = rig.progress(deltaMs);
      apply(value);
      extra?.();
      return orbiting || moving;
    },
  };
}
