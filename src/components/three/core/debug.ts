import type { StageState } from "./types";

/*
 * Development-only probe on window.__three, read by the e2e tests and QA:
 * frame counts prove the loop sleeps offscreen; triangles and draw calls come
 * from renderer.info after the first frame. Production builds skip all of it.
 */

export interface StageDebugEntry {
  state: StageState;
  frames: number;
  /** True while the requestAnimationFrame loop is scheduled. */
  running: boolean;
  visible: boolean;
  tier?: string;
  dpr?: number;
  triangles?: number;
  calls?: number;
  geometries?: number;
  textures?: number;
  contexts?: number;
}

declare global {
  interface Window {
    __three?: Record<string, StageDebugEntry>;
  }
}

export const DEBUG = process.env.NODE_ENV !== "production";

export function debugEntry(id: string): StageDebugEntry | null {
  if (!DEBUG || typeof window === "undefined") return null;
  window.__three ??= {};
  window.__three[id] ??= { state: "idle", frames: 0, running: false, visible: false };
  return window.__three[id];
}
