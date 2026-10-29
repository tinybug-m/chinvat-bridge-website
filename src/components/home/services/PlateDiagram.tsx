import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import "./services.css";

interface PlateDiagramProps {
  /** Crop of the 400 x 300 board, so each plate can frame its own artwork. */
  viewBox: string;
  className?: string;
  children: ReactNode;
}

/**
 * Frameless diagram. The SVG is drawn on the left of the board (x < 200) and
 * built on the right; the meaning is carried by the plate's text, so it is
 * hidden from assistive tech.
 */
export function PlateDiagram({ viewBox, className, children }: PlateDiagramProps) {
  return (
    <Reveal delay={80} className={cn("svc-fig", className)}>
      <svg aria-hidden="true" viewBox={viewBox} focusable="false" className="block h-auto w-full overflow-visible">
        {children}
      </svg>
    </Reveal>
  );
}
