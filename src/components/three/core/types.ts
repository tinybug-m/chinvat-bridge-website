import type { Camera, Scene, Texture, WebGLRenderer } from "three";

/*
 * The contract between the stage runtime and a scene module. Type-only
 * imports from three are erased, so this file never pulls three into a bundle.
 */

export type QualityTier = "high" | "low" | "none";

export interface QualityProfile {
  tier: QualityTier;
  /** Upper bound for the device pixel ratio on this device. */
  dprCap: number;
  /** Coarse pointer and a small viewport. */
  mobile: boolean;
  /** Why this tier was chosen, for QA logs. */
  reason: string;
}

/** Lifecycle of a stage, mirrored on its root as data-stage-state. */
export type StageState =
  /** First paint: nothing has started. The first-paint layer shows. */
  | "idle"
  /** Loading three and the scene for the first time. The first-paint layer still shows. */
  | "loading"
  /** The canvas is on screen. */
  | "live"
  /** Re-creating after a suspension. The poster shows. */
  | "resuming"
  /** Released its WebGL context (far offscreen or over budget). The poster shows. */
  | "suspended"
  /** No 3D: no WebGL, reduced motion, or an error. The poster shows. */
  | "fallback";

export interface StageSize {
  /** CSS pixels. */
  width: number;
  height: number;
  /** Device pixel ratio actually used (already capped). */
  dpr: number;
}

export interface SceneContext {
  renderer: WebGLRenderer;
  canvas: HTMLCanvasElement;
  /** The stage root element. */
  container: HTMLElement;
  quality: QualityProfile;
  /** True for the poster capture mode: render the rest pose once, no intro, no input. */
  capture: boolean;
  /** False when the scene is re-created after a suspension, so intros play once per page view. */
  firstMount: boolean;
  /** Current size; updated before resize() is called. */
  readonly size: StageSize;
  /** Request at least one more frame (render on demand). */
  invalidate(): void;
  /** Latest value of an input set through the stage handle. */
  input(key: string, fallback?: number): number;
  /** Publish a value to the page (StageProps.onOutput). */
  output(key: string, value: number): void;
  /** Shared studio environment (PMREM), built once per renderer. */
  environment(): Texture;
}

export interface SceneInstance {
  scene: Scene;
  camera: Camera;
  /** Called after the canvas size changes. */
  resize?(size: StageSize): void;
  /**
   * Advance one frame. Return true while something is still moving, so the
   * runtime keeps the loop alive; return false to let it sleep until invalidated.
   */
  update?(deltaMs: number, elapsedMs: number): boolean;
  /** An input changed (the runtime also invalidates). */
  onInput?(key: string, value: number): void;
  /** Free anything the runtime cannot find by traversing the scene (render targets, listeners). */
  dispose?(): void;
}

export interface SceneModule {
  createScene(context: SceneContext): SceneInstance | Promise<SceneInstance>;
}

/** Imperative handle for driving a stage from React, GSAP or event handlers. */
export interface StageHandle {
  /** Set a named input. Values set before the scene exists are kept and applied on creation. */
  set(key: string, value: number): void;
  get(key: string): number | undefined;
  readonly state: StageState;
}
