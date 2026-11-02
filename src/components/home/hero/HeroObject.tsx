import Image from "next/image";
import type { ReactNode } from "react";
import { SEAM_FRAME_ASPECT } from "@/components/three/scenes/seam/config";
import { cn } from "@/lib/utils";
import { HeroStage } from "./HeroStage";
import { MarkDrawing } from "./MarkDrawing";

/*
 * The hero object, in a box with the scene frame's aspect ratio, so the line
 * drawing, the poster, the canvas and the annotations share one coordinate
 * system and nothing shifts when WebGL arrives.
 *
 * Layers, by stage state (data-stage-state on the stage root):
 *   idle / loading      the ink line drawing: first paint, no request, and
 *                       never the LCP element (the H1 is)
 *   live                the canvas fades in over it, starting fully drawn,
 *                       then the seam sweeps to the axis
 *   fallback, suspended,
 *   resuming            the rest-pose poster: no WebGL, reduced motion, no
 *                       JS, or the context was released far offscreen. It
 *                       cross-fades out (after the canvas is in) on return.
 */

export const POSTER_SRC = "/hero/seam-poster-chrome.png";

const drawingLayer = cn(
  "absolute inset-0 opacity-0 transition-opacity duration-[400ms] ease-out-quart",
  "group-data-[stage-state=idle]/stage:opacity-100 group-data-[stage-state=loading]/stage:opacity-100",
  "motion-reduce:hidden",
);

const posterLayer = cn(
  "absolute inset-0 hidden opacity-0 transition-[opacity,display] transition-discrete delay-300 duration-[400ms] ease-out-quart",
  "group-data-[stage-state=fallback]/stage:block group-data-[stage-state=fallback]/stage:opacity-100",
  "group-data-[stage-state=suspended]/stage:block group-data-[stage-state=suspended]/stage:opacity-100",
  "group-data-[stage-state=resuming]/stage:block group-data-[stage-state=resuming]/stage:opacity-100",
  "motion-reduce:block motion-reduce:opacity-100",
);

interface HeroObjectProps {
  className?: string;
  /** next/image sizes for the poster. */
  sizes: string;
  /** Annotations, positioned in the same frame (percentages from scenes/seam/config). */
  children?: ReactNode;
}

export function HeroObject({ className, sizes, children }: HeroObjectProps) {
  return (
    <div className={cn("relative", className)} style={{ aspectRatio: SEAM_FRAME_ASPECT }}>
      <HeroStage className="absolute inset-0">
        <div data-layer="drawing" className={drawingLayer}>
          <MarkDrawing />
        </div>
        <div data-layer="poster" className={posterLayer}>
          {/* Eager: under reduced motion or without WebGL this poster is the hero's main image. */}
          <Image src={POSTER_SRC} alt="" fill sizes={sizes} loading="eager" className="object-contain" />
        </div>
      </HeroStage>
      {children}
      <noscript>
        <style>{`[data-stage="seam"] [data-layer="drawing"]{display:none}[data-stage="seam"] [data-layer="poster"]{display:block;opacity:1}`}</style>
      </noscript>
    </div>
  );
}
