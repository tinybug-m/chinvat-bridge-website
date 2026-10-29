import { type BudgetMember, acquireContext, releaseContext } from "./budget";
import { debugEntry } from "./debug";
import { detectQuality } from "./quality";
import type { Runtime } from "./runtime";
import { captureMode } from "./switches";
import type { QualityProfile, SceneModule, StageHandle, StageState } from "./types";

/*
 * Decides when a stage holds a WebGL context. No three.js in here: the
 * runtime and the scene are import()ed only once the stage is near the
 * viewport and the page has finished loading and gone idle.
 *
 *   near (mountMargin)        after load + idle: create the context and the scene
 *   quality                   probed once (a throwaway WebGL 2 context) on first
 *                             approach or when the browser is idle, never during hydration
 *   visible (0px margin)      run the loop; pause it offscreen or in a hidden tab
 *   far (beyond releaseMargin) dispose everything, including the context
 *   budget                    at most two live contexts; the farthest is suspended
 */

export type SceneLoader = () => Promise<SceneModule | { default: SceneModule }>;

export interface StageOptions {
  id: string;
  load: SceneLoader;
  /** IntersectionObserver rootMargin inside which the stage mounts. */
  mountMargin?: string;
  /** Outside this rootMargin the stage releases its context. */
  releaseMargin?: string;
  /** Under prefers-reduced-motion: show the poster ("fallback", default) or render one still frame ("static"). */
  reducedMotion?: "fallback" | "static";
}

type Listener = () => void;

/** requestIdleCallback with a timeout, or a short timer where it is missing. */
function onIdle(callback: () => void, signal: AbortSignal, timeout: number) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    signal.addEventListener("abort", () => window.cancelIdleCallback(id));
  } else {
    const id = setTimeout(callback, 200);
    signal.addEventListener("abort", () => clearTimeout(id));
  }
}

function whenLoadedAndIdle(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const idle = () => {
      if (signal.aborted) return;
      if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 1500 });
      else setTimeout(resolve, 200);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true, signal });
  });
}

export class StageController implements BudgetMember, StageHandle {
  state: StageState = "idle";

  private readonly options: StageOptions;
  private readonly listeners = new Set<Listener>();
  private readonly inputs = new Map<string, number>();
  private outputListener: ((key: string, value: number) => void) | null = null;
  private root: HTMLElement | null = null;
  private host: HTMLElement | null = null;
  private runtime: Runtime | null = null;
  private quality: QualityProfile | null = null;
  private abort: AbortController | null = null;
  private generation = 0;
  private loading = false;
  private ready = false;
  private near = false;
  private visible = false;
  private everLive = false;
  private capture = false;
  private reducedMotion = false;

  constructor(options: StageOptions) {
    this.options = options;
  }

  // --- React store -------------------------------------------------------

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => this.state;

  private setState(state: StageState) {
    if (this.state === state) return;
    this.state = state;
    const debug = debugEntry(this.options.id);
    if (debug) debug.state = state;
    this.listeners.forEach((listener) => listener());
  }

  // --- StageHandle -------------------------------------------------------

  set(key: string, value: number) {
    if (this.inputs.get(key) === value) return;
    if (this.runtime) this.runtime.setInput(key, value);
    else this.inputs.set(key, value);
  }

  get(key: string) {
    return this.inputs.get(key);
  }

  setOutputListener(listener: ((key: string, value: number) => void) | null) {
    this.outputListener = listener;
  }

  // --- Lifecycle ---------------------------------------------------------

  attach(root: HTMLElement, host: HTMLElement) {
    this.detach();
    this.root = root;
    this.host = host;
    const abort = new AbortController();
    this.abort = abort;
    const { signal } = abort;
    this.capture = captureMode();
    debugEntry(this.options.id);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = reduce.matches;
    reduce.addEventListener(
      "change",
      () => {
        this.reducedMotion = reduce.matches;
        if (this.blockedByMotion()) {
          this.release("fallback");
        } else if (this.state === "fallback" && this.quality?.tier !== "none") {
          this.setState(this.everLive ? "suspended" : "idle");
          this.maybeMount();
        }
      },
      { signal },
    );

    if (this.quality?.tier === "none" || this.blockedByMotion()) this.setState("fallback");
    onIdle(() => this.detect(), signal, 2000);

    const observe = (rootMargin: string, onChange: (entry: IntersectionObserverEntry) => void) => {
      const observer = new IntersectionObserver((entries) => entries.forEach(onChange), { rootMargin });
      observer.observe(root);
      signal.addEventListener("abort", () => observer.disconnect());
    };
    observe("0px", (entry) => {
      this.visible = entry.isIntersecting;
      this.syncActive();
    });
    observe(this.options.mountMargin ?? "50% 0px", (entry) => {
      if (entry.isIntersecting) this.detect();
      this.near = entry.isIntersecting || this.capture;
      this.maybeMount();
    });
    observe(this.options.releaseMargin ?? "150% 0px", (entry) => {
      if (!entry.isIntersecting && !this.capture) this.release(this.everLive ? "suspended" : "idle");
    });
    document.addEventListener("visibilitychange", () => this.syncActive(), { signal });

    if (this.capture) {
      this.ready = true;
      this.near = true;
      this.maybeMount();
    } else {
      void whenLoadedAndIdle(signal).then(() => {
        if (signal.aborted) return;
        this.ready = true;
        this.maybeMount();
      });
    }
  }

  detach() {
    this.abort?.abort();
    this.abort = null;
    this.release(this.state === "fallback" ? "fallback" : this.everLive ? "suspended" : "idle");
    this.ready = false;
    this.near = false;
    this.visible = false;
    this.root = null;
    this.host = null;
  }

  /** Decide the quality tier, once per controller (detectQuality caches it per page). */
  private detect() {
    if (this.quality) return;
    const quality = detectQuality();
    this.quality = this.capture ? { ...quality, tier: quality.tier === "none" ? "none" : "high" } : quality;
    if (this.quality.tier === "none") this.release("fallback");
  }

  private blockedByMotion() {
    return this.reducedMotion && (this.options.reducedMotion ?? "fallback") === "fallback" && !this.capture;
  }

  private syncActive() {
    this.runtime?.setActive(this.visible && document.visibilityState === "visible");
  }

  private maybeMount() {
    if (!this.ready || !this.near || this.runtime || this.loading) return;
    this.detect();
    if (!this.root || !this.host || !this.quality || this.quality.tier === "none") return;
    if (this.state === "fallback" || this.blockedByMotion()) return;
    if (!acquireContext(this)) return;
    void this.mount();
  }

  private async mount() {
    const generation = ++this.generation;
    const root = this.root!;
    const host = this.host!;
    const quality = this.quality!;
    this.loading = true;
    this.setState(this.everLive ? "resuming" : "loading");
    try {
      const [{ createRuntime }, loaded] = await Promise.all([import("./runtime"), this.options.load()]);
      if (generation !== this.generation) return;
      const sceneModule = "createScene" in loaded ? loaded : loaded.default;
      const runtime = await createRuntime({
        id: this.options.id,
        host,
        container: root,
        module: sceneModule,
        quality,
        capture: this.capture,
        firstMount: !this.everLive,
        inputs: this.inputs,
        onOutput: (key, value) => this.outputListener?.(key, value),
        onContextLost: () => this.release(this.everLive ? "suspended" : "idle"),
      });
      if (generation !== this.generation) {
        runtime.dispose();
        return;
      }
      this.runtime = runtime;
      this.everLive = true;
      this.setState("live");
      this.syncActive();
    } catch (error) {
      if (generation !== this.generation) return;
      console.warn(`[three:${this.options.id}] falling back to the poster`, error);
      releaseContext(this);
      this.setState("fallback");
    } finally {
      if (generation === this.generation) this.loading = false;
    }
  }

  /** Drop the context (if any) and move to `state`. Fallback is sticky: only the motion listener leaves it. */
  private release(state: StageState) {
    if (this.state === "fallback" && state !== "fallback") state = "fallback";
    this.generation += 1;
    this.loading = false;
    this.runtime?.dispose();
    this.runtime = null;
    releaseContext(this);
    this.setState(state);
  }

  // --- BudgetMember ------------------------------------------------------

  distance() {
    if (!this.root) return Infinity;
    const rect = this.root.getBoundingClientRect();
    return Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
  }

  suspend() {
    this.release(this.everLive ? "suspended" : "idle");
  }

  retry() {
    this.maybeMount();
  }
}
