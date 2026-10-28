"use client";

import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/utils";
import { type SceneLoader, StageController } from "./controller";
import type { StageHandle, StageState } from "./types";

/*
 * A box that may hold a WebGL scene. It server-renders its children (poster,
 * line drawing, anything that should show before or instead of WebGL) and
 * later appends a canvas above them. The root carries data-stage-state, so
 * children can style themselves per state with the group/stage variant:
 *
 *   group-data-[stage-state=live]/stage:opacity-0
 *
 * three.js is never in the initial bundle: the controller import()s the
 * runtime and the scene module when the stage is near the viewport and the
 * page has loaded and gone idle.
 */

export interface ThreeStageProps {
  /** Unique per page; used for the dev probe window.__three[id]. */
  id: string;
  /** Dynamic import of the scene module, e.g. () => import("@/components/three/scenes/seam"). */
  load: SceneLoader;
  className?: string;
  style?: CSSProperties;
  /** Extra classes for the canvas layer (it fades in when the stage goes live). */
  canvasClassName?: string;
  /** Layers under the canvas: the poster, a first-paint drawing. */
  children?: ReactNode;
  /** Imperative handle: set(key, value) feeds the scene's inputs. */
  handleRef?: Ref<StageHandle>;
  /** Values the scene publishes with context.output(). */
  onOutput?: (key: string, value: number) => void;
  /** Called when the stage state changes (after React commits). */
  onStateChange?: (state: StageState) => void;
  mountMargin?: string;
  releaseMargin?: string;
  reducedMotion?: "fallback" | "static";
}

const serverState = (): StageState => "idle";

export function ThreeStage({
  id,
  load,
  className,
  style,
  canvasClassName,
  children,
  handleRef,
  onOutput,
  onStateChange,
  mountMargin,
  releaseMargin,
  reducedMotion,
}: ThreeStageProps) {
  // Options are read once; a stage keeps its scene for its whole life.
  const [controller] = useState(() => new StageController({ id, load, mountMargin, releaseMargin, reducedMotion }));
  const state = useSyncExternalStore(controller.subscribe, controller.getState, serverState);
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(handleRef, () => controller, [controller]);

  useEffect(() => {
    controller.setOutputListener(onOutput ?? null);
  }, [controller, onOutput]);

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  useEffect(() => {
    if (!rootRef.current || !hostRef.current) return;
    controller.attach(rootRef.current, hostRef.current);
    return () => controller.detach();
  }, [controller]);

  return (
    <div
      ref={rootRef}
      data-stage={id}
      data-stage-state={state}
      className={cn("group/stage relative", className)}
      style={style}
    >
      {children}
      <div
        ref={hostRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out-quart group-data-[stage-state=live]/stage:opacity-100",
          canvasClassName,
        )}
      />
    </div>
  );
}
