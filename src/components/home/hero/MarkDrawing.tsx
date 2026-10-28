import { MARK_OUTLINE_PATH } from "@/components/three/geometry/mark-outline";
import { SEAM_FRAME } from "@/components/three/scenes/seam/config";
import { cn } from "@/lib/utils";

/**
 * The first-paint state of the hero object: the mark as an ink line drawing,
 * framed exactly like the 3D camera frames the silhouette, so the maquette
 * that replaces it lands on the same lines. Inline SVG, so it costs no
 * request and is never the LCP element.
 */
export function MarkDrawing({ className }: { className?: string }) {
  const { x, y, width, height } = SEAM_FRAME;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("absolute inset-0 size-full", className)}
    >
      <path
        d={MARK_OUTLINE_PATH}
        fill="none"
        fillRule="evenodd"
        stroke="var(--color-ink)"
        strokeOpacity="0.62"
        strokeWidth="1"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
