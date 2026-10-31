import type { PerspectiveCamera } from "three";
import { clamp, damp } from "../../core/motion";
import type { SceneContext, StageSize } from "../../core/types";

/*
 * What every Bridge study shares: an orbit camera the showcase page drives,
 * the object-cover crop the Approach stage uses, and a damped `built` value
 * with a one-time build-in. No three at runtime (the camera is passed in), so
 * the scenes stay the only modules that import it.
 *
 * Inputs (StageHandle.set), all optional:
 *   built  0..1   today (0) to future (1)
 *   yaw    rad    added to the study's azimuth
 *   pitch  rad    added to its elevation, clamped
 *   zoom   x      distance multiplier, clamped
 *
 * Capture (?poster=1) renders built = 1 from the rest view, with no intro.
 */

export type Vec3 = [number, number, number];

export interface RigOptions {
  target: Vec3;
  distance: number;
  /** Rest view, radians: azimuth off the -z axis toward -x, elevation above the horizon. */
  azimuth: number;
  elevation: number;
  /** Vertical field of view (degrees) at the reference aspect. */
  fov: number;
  referenceAspect: number;
  /** Beyond this aspect the crop stops and the sides gain empty ground. */
  maxAspect?: number;
  /** Elevation limits, radians. */
  minElevation?: number;
  maxElevation?: number;
}

export const ZOOM_RANGE = [0.6, 1.5] as const;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createRig(camera: PerspectiveCamera, context: SceneContext, options: RigOptions) {
  const { target, referenceAspect, maxAspect = 2.9, minElevation = -0.04, maxElevation = 1.25 } = options;
  const still = context.capture || prefersReducedMotion();
  const view = { yaw: 0, pitch: 0, zoom: 1 };

  const goal = () => ({
    yaw: context.capture ? 0 : context.input("yaw", 0),
    pitch: context.capture ? 0 : context.input("pitch", 0),
    zoom: context.capture ? 1 : clamp(context.input("zoom", 1), ZOOM_RANGE[0], ZOOM_RANGE[1]),
  });

  function place() {
    const azimuth = options.azimuth + view.yaw;
    const elevation = clamp(options.elevation + view.pitch, minElevation, maxElevation);
    const distance = options.distance * view.zoom;
    camera.position.set(
      target[0] - distance * Math.sin(azimuth) * Math.cos(elevation),
      target[1] + distance * Math.sin(elevation),
      target[2] + distance * Math.cos(azimuth) * Math.cos(elevation),
    );
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateMatrixWorld();
  }

  /** Wider than the reference keeps its width and crops top and bottom; narrower crops the sides. */
  function resize(size: StageSize) {
    const aspect = size.width / Math.max(1, size.height);
    camera.aspect = aspect;
    const crop = Math.min(aspect, maxAspect);
    const half = Math.tan((options.fov * Math.PI) / 360);
    camera.fov = crop >= referenceAspect ? (360 / Math.PI) * Math.atan((half * referenceAspect) / crop) : options.fov;
    camera.updateProjectionMatrix();
  }

  /** Eases the view toward the inputs; true while it is still moving. */
  function update(deltaMs: number) {
    const next = goal();
    let moving = false;
    for (const key of ["yaw", "pitch", "zoom"] as const) {
      view[key] = still ? next[key] : damp(view[key], next[key], 9, deltaMs);
      if (Math.abs(view[key] - next[key]) > 1e-4) moving = true;
      else view[key] = next[key];
    }
    place();
    return moving;
  }

  // The build-in: the first mount starts from today and eases to the page's value.
  let built = still || !context.firstMount ? (context.capture ? 1 : context.input("built", 1)) : 0;
  let intro = !still && context.firstMount;

  /** The damped share built, 0..1; `moving` is true until it settles. */
  function progress(deltaMs: number) {
    const next = context.capture ? 1 : clamp(context.input("built", 1));
    if (still) built = next;
    else built = damp(built, next, intro ? 2.2 : 7, deltaMs);
    // Snap the tail: staged pieces only finish at exactly 1, and an exponential ease never gets there.
    const moving = Math.abs(built - next) > 0.004;
    if (!moving) {
      built = next;
      intro = false;
    }
    return { value: built, moving };
  }

  place();
  return { place, resize, update, progress };
}

/**
 * Staggered progress for one piece of a path: `order` 0 builds first, 1 last.
 * `spread` is how much of the sweep the stagger takes (0 = all at once).
 */
export function staged(built: number, order: number, spread = 0.7) {
  const x = clamp(built * (1 + spread) - order * spread);
  return x * x * (3 - 2 * x);
}
