"use client";

import Image from "next/image";
import { type KeyboardEvent, type PointerEvent, useEffect, useRef } from "react";
import type { SceneLoader } from "@/components/three/core/controller";
import { ThreeStage } from "@/components/three/core/ThreeStage";
import type { StageHandle } from "@/components/three/core/types";
import { cn } from "@/lib/utils";
import { STUDY_BY_ID, type StudyId } from "./studies";

/*
 * One bridge in a stage the visitor can turn. The scenes take the view as
 * inputs (yaw, pitch, zoom) and ease toward it, so this only tracks the drag
 * and the keys; the state lives with the caller, which lets the side-by-side
 * pair share one view. The canvas layer takes no pointers, so a transparent
 * surface above it does: horizontal drags turn the bridge, vertical drags
 * tilt it with a mouse and scroll the page on touch (touch-action: pan-y).
 */

export interface StudyView {
  yaw: number;
  pitch: number;
  zoom: number;
}

export const REST_VIEW: StudyView = { yaw: 0, pitch: 0, zoom: 1 };
const PITCH_RANGE = [-0.3, 1.05] as const;
export const ZOOM_LIMITS = [0.6, 1.5] as const;

/** The WebGL studies; the SVG ones are drawn by StudyPicture. */
const LOADERS: Partial<Record<StudyId, SceneLoader>> = {
  original: () => import("@/components/three/scenes/bridge-studies/original"),
  etching: () => import("@/components/three/scenes/bridge-studies/etching"),
};

export const clampView = (view: StudyView): StudyView => ({
  yaw: Math.max(-Math.PI, Math.min(Math.PI, view.yaw)),
  pitch: Math.max(PITCH_RANGE[0], Math.min(PITCH_RANGE[1], view.pitch)),
  zoom: Math.max(ZOOM_LIMITS[0], Math.min(ZOOM_LIMITS[1], view.zoom)),
});

interface StudyStageProps {
  /** Unique on the page. */
  stageId: string;
  study: StudyId;
  view: StudyView;
  /** Share built, 0..1. */
  built: number;
  onViewChange: (view: StudyView) => void;
  className?: string;
  /** The poster's sizes attribute. */
  sizes?: string;
}

export function StudyStage({ stageId, study, view, built, onViewChange, className, sizes = "100vw" }: StudyStageProps) {
  const { name, poster, ground } = STUDY_BY_ID[study];
  const handle = useRef<StageHandle>(null);
  const drag = useRef<{ id: number; x: number; y: number; from: StudyView } | null>(null);

  useEffect(() => {
    handle.current?.set("yaw", view.yaw);
    handle.current?.set("pitch", view.pitch);
    handle.current?.set("zoom", view.zoom);
  }, [view]);

  useEffect(() => {
    handle.current?.set("built", built);
  }, [built]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, from: view };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const width = event.currentTarget.clientWidth || 1;
    // A full drag across the stage turns the bridge about 200 degrees.
    const dx = ((event.clientX - start.x) / width) * 3.5;
    const dy = event.pointerType === "touch" ? 0 : ((event.clientY - start.y) / width) * 2.4;
    onViewChange(clampView({ ...start.from, yaw: start.from.yaw - dx, pitch: start.from.pitch + dy }));
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === event.pointerId) drag.current = null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.4 : 0.12;
    const next: Record<string, () => StudyView> = {
      ArrowLeft: () => ({ ...view, yaw: view.yaw + step }),
      ArrowRight: () => ({ ...view, yaw: view.yaw - step }),
      ArrowUp: () => ({ ...view, pitch: view.pitch + step }),
      ArrowDown: () => ({ ...view, pitch: view.pitch - step }),
      "+": () => ({ ...view, zoom: view.zoom / 1.12 }),
      "=": () => ({ ...view, zoom: view.zoom / 1.12 }),
      "-": () => ({ ...view, zoom: view.zoom * 1.12 }),
      "0": () => REST_VIEW,
      Home: () => REST_VIEW,
    };
    const action = next[event.key];
    if (!action) return;
    event.preventDefault();
    onViewChange(clampView(action()));
  }

  return (
    <ThreeStage
      id={stageId}
      load={LOADERS[study]!}
      handleRef={handle}
      className={cn("overflow-hidden", className)}
      style={{ background: ground }}
      mountMargin="25% 0px"
      releaseMargin="120% 0px"
      reducedMotion="static"
    >
      {poster ? (
        <Image
          src={poster}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-opacity duration-[400ms] group-data-[stage-state=live]/stage:opacity-0"
        />
      ) : null}
      <div
        role="group"
        tabIndex={0}
        aria-roledescription="3D view"
        aria-label={`${name}: drag or use the arrow keys to turn it, plus and minus to zoom, 0 to reset`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onDoubleClick={() => onViewChange(REST_VIEW)}
        className="absolute inset-0 z-10 cursor-grab touch-pan-y outline-none select-none active:cursor-grabbing focus-visible:shadow-[inset_0_0_0_2px_var(--color-cobalt-700)]"
      />
    </ThreeStage>
  );
}
