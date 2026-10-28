import { NeutralToneMapping, SRGBColorSpace, type Texture, WebGLRenderer } from "three";
import { createStudioEnvironment } from "../materials/environment";
import { debugEntry, DEBUG } from "./debug";
import { disposeObject } from "./dispose";
import type { QualityProfile, SceneContext, SceneInstance, SceneModule, StageSize } from "./types";

/*
 * The WebGL side of a stage. Loaded with import() by the stage controller,
 * never statically, so three stays out of the initial bundle.
 *
 * One runtime = one canvas + one WebGLRenderer + one scene instance. The loop
 * renders on demand: it runs while the scene reports motion or something
 * invalidated it, and sleeps otherwise. dispose() frees everything, including
 * the context itself.
 */

export interface RuntimeOptions {
  id: string;
  /** Element the canvas is appended to. */
  host: HTMLElement;
  /** Stage root, measured for size. */
  container: HTMLElement;
  module: SceneModule;
  quality: QualityProfile;
  capture: boolean;
  firstMount: boolean;
  inputs: Map<string, number>;
  onOutput(key: string, value: number): void;
  /** The context was lost underneath us (driver reset, browser limit). */
  onContextLost(): void;
}

export interface Runtime {
  readonly canvas: HTMLCanvasElement;
  setInput(key: string, value: number): void;
  /** Visible on screen and the tab is in the foreground. */
  setActive(active: boolean): void;
  invalidate(): void;
  dispose(): void;
}

export async function createRuntime(options: RuntimeOptions): Promise<Runtime> {
  const { id, host, container, module, quality, capture } = options;
  const debug = debugEntry(id);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("tabindex", "-1");
  canvas.dataset.stageCanvas = id;
  Object.assign(canvas.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" });

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    powerPreference: "default",
    // The poster script reads the pixels back after the frame.
    preserveDrawingBuffer: capture,
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 0);

  let disposed = false;
  let instance: SceneInstance | null = null;
  let environment: Texture | null = null;
  let disposeEnvironment: (() => void) | null = null;
  let raf = 0;
  let active = false;
  let needsFrame = true;
  let lastTime = 0;
  let elapsed = 0;

  const size: StageSize = { width: 1, height: 1, dpr: 1 };

  function measure() {
    const rect = container.getBoundingClientRect();
    const dprLimit = capture ? 3 : quality.dprCap;
    size.width = Math.max(1, Math.round(rect.width));
    size.height = Math.max(1, Math.round(rect.height));
    size.dpr = Math.min(window.devicePixelRatio || 1, dprLimit);
    renderer.setPixelRatio(size.dpr);
    renderer.setSize(size.width, size.height, false);
    if (debug) debug.dpr = size.dpr;
  }

  function schedule() {
    if (raf || !active || disposed || !instance) return;
    raf = requestAnimationFrame(frame);
    if (debug) debug.running = true;
  }

  function frame(now: number) {
    raf = 0;
    if (!active || disposed || !instance) {
      if (debug) debug.running = false;
      return;
    }
    const delta = lastTime ? Math.min(now - lastTime, 100) : 16.7;
    lastTime = now;
    elapsed += delta;
    needsFrame = false;
    const animating = instance.update?.(delta, elapsed) ?? false;
    renderer.render(instance.scene, instance.camera);
    if (debug) debug.frames += 1;
    if (animating || needsFrame) {
      schedule();
    } else {
      lastTime = 0;
      if (debug) debug.running = false;
    }
  }

  function invalidate() {
    needsFrame = true;
    schedule();
  }

  const context: SceneContext = {
    renderer,
    canvas,
    container,
    quality,
    capture,
    firstMount: options.firstMount,
    size,
    invalidate,
    input: (key, fallback = 0) => options.inputs.get(key) ?? fallback,
    output: (key, value) => options.onOutput(key, value),
    environment() {
      if (!environment) {
        const studio = createStudioEnvironment(renderer, quality.tier === "low" ? "low" : "high");
        environment = studio.texture;
        disposeEnvironment = studio.dispose;
      }
      return environment;
    },
  };

  function onContextLost(event: Event) {
    event.preventDefault();
    if (!disposed) options.onContextLost();
  }
  canvas.addEventListener("webglcontextlost", onContextLost);

  const resizeObserver = new ResizeObserver(() => {
    if (disposed) return;
    measure();
    if (instance) instance.resize?.(size);
    invalidate();
  });

  function dispose() {
    if (disposed) return;
    disposed = true;
    active = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    if (instance) {
      instance.dispose?.();
      disposeObject(instance.scene);
    }
    instance = null;
    disposeEnvironment?.();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    if (debug) {
      debug.running = false;
      debug.contexts = 0;
    }
  }

  try {
    measure();
    host.appendChild(canvas);
    const created = await module.createScene(context);
    if (disposed) {
      created.dispose?.();
      disposeObject(created.scene);
      throw new Error("stage disposed during scene creation");
    }
    instance = created;
    instance.resize?.(size);
    // Compile off the main thread where KHR_parallel_shader_compile exists, so the first frame does not jank.
    await renderer.compileAsync(instance.scene, instance.camera);
    if (disposed) throw new Error("stage disposed during shader compilation");
    instance.update?.(0, 0);
    renderer.render(instance.scene, instance.camera);
    resizeObserver.observe(container);

    if (debug) {
      const info = renderer.info;
      debug.triangles = info.render.triangles;
      debug.calls = info.render.calls;
      debug.geometries = info.memory.geometries;
      debug.textures = info.memory.textures;
      debug.tier = quality.tier;
      debug.contexts = 1;
      debug.frames += 1;
      if (DEBUG) {
        console.info(
          `[three:${id}] ${quality.tier} tier (${quality.reason}), dpr ${size.dpr}, ` +
            `${info.render.triangles} triangles, ${info.render.calls} draw calls, ` +
            `${info.memory.geometries} geometries, ${info.memory.textures} textures`,
        );
      }
    }
    canvas.dataset.ready = "true";
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    canvas,
    setInput(key, value) {
      options.inputs.set(key, value);
      instance?.onInput?.(key, value);
      invalidate();
    },
    setActive(next) {
      if (active === next) return;
      active = next;
      if (debug) debug.visible = next;
      if (next) {
        lastTime = 0;
        invalidate();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        if (debug) debug.running = false;
      }
    },
    invalidate,
    dispose,
  };
}
