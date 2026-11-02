import type { CSSProperties } from "react";
import { MARK_RING_PATHS } from "@/components/three/geometry/mark-outline";
import { SEAM_FRAME } from "@/components/three/scenes/seam/config";
import { cn } from "@/lib/utils";
import { MarkChromeCanvas } from "./MarkChromeCanvas";
import "./hero.css";

/**
 * The first-paint state of the hero object: the mark as an ink line drawing,
 * framed exactly like the 3D camera frames the silhouette, so the maquette
 * that replaces it lands on the same lines. Inline SVG, so the lines cost no
 * request and are never the LCP element.
 *
 * The built half's chrome is a <canvas> under the lines (MarkChromeCanvas),
 * not an SVG <image>: a large image would be the LCP candidate, and the
 * canvas fetches its texture only when chrome is the chosen material.
 *
 * One path per ring so it can draw on: the outer ring first, then the holes
 * (see hero.css). Together the paths are the welded outline. Where the draw
 * cannot keep a 1px stroke (see hero.css) it stays the static drawing.
 */
export function MarkDrawing({ className }: { className?: string }) {
  const { x, y, width, height } = SEAM_FRAME;
  return (
    <>
      <MarkChromeCanvas className="mark-chrome-canvas absolute inset-0 size-full" />
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={`${x} ${y} ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn("absolute inset-0 size-full", className)}
        style={{ "--vbw": width, "--vbh": height } as CSSProperties}
      >
        {MARK_RING_PATHS.map((d, index) => (
          <path
            key={index}
            d={d}
            pathLength={1}
            className="mark-ring"
            data-ring={index === 0 ? "outer" : "hole"}
            style={{ "--i": index } as CSSProperties}
            fill="none"
            fillRule="evenodd"
            stroke="var(--color-ink)"
            strokeOpacity="0.62"
            strokeWidth="1"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </>
  );
}
