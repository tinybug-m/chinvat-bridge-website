import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import "./services.css";
import "./loop.css";
import { PlateLoop } from "./PlateLoop";
import type { EnergyPorts } from "./energy/EnergyFlow";

interface PlateDiagramProps {
  /** Crop of the 400 x 300 board, so each plate can frame its own artwork. */
  viewBox: string;
  className?: string;
  /** CSS variables for the figure (for example "--delay"); they inherit into the SVG. */
  style?: CSSProperties;
  /**
   * Opt in to the .draw line draw-on inside this figure. It makes the figure a
   * size container (to compensate the stroke width), so set it only on a figure
   * with a definite width (a grid cell, a w-* box), never a shrink-to-fit one.
   */
  draw?: boolean;
  /** Mount the looping-animation controller (see loop.css). Only the Services plates have .loop nodes. */
  loop?: boolean;
  /** Where the energy wire meets this plate; the wire's arrival then reveals it (EnergyFlow), not scrolling. */
  energy?: EnergyPorts;
  children: ReactNode;
}

/**
 * Frameless diagram. The SVG is drawn on the left of the board (x < 200) and
 * built on the right; the meaning is carried by the plate's text, so it is
 * hidden from assistive tech.
 */
export function PlateDiagram({ viewBox, className, style, draw, loop, energy, children }: PlateDiagramProps) {
  // The viewBox width in user units, so CSS can turn a screen-pixel stroke into user units.
  const vbw = Number(viewBox.split(/[\s,]+/)[2]) || 400;
  return (
    <Reveal
      delay={80}
      className={cn("svc-fig", draw && "draw-scope", className)}
      style={{ "--vbw": vbw, ...style } as CSSProperties}
      revealBy={energy ? "energy" : undefined}
    >
      {loop ? <PlateLoop /> : null}
      <svg
        aria-hidden="true"
        viewBox={viewBox}
        focusable="false"
        className="block h-auto w-full overflow-visible"
        data-energy-ports={energy ? JSON.stringify(energy) : undefined}
      >
        {children}
      </svg>
    </Reveal>
  );
}
