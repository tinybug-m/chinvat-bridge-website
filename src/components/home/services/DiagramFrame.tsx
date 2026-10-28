import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Annotation } from "@/components/system/Annotation";
import { Seam } from "@/components/system/Seam";
import "./services.css";

const CORNERS = [
  "-left-1 -top-1",
  "-right-1 -top-1",
  "-bottom-1 -left-1",
  "-bottom-1 -right-1",
] as const;

interface DiagramFrameProps {
  /** Figure number, e.g. "01". */
  figure: string;
  /** Where the ring node sits on the seam, in percent of the frame height. */
  node: number;
  children: ReactNode;
}

/**
 * Diagram frame: registration marks, caption, and a vertical seam at the
 * centre. The SVG inside is drawn on the left (viewBox x < 200) and built on
 * the right. Decorative: the meaning is carried by the plate's text.
 */
export function DiagramFrame({ figure, node, children }: DiagramFrameProps) {
  return (
    <Reveal delay={80} className="svc-fig relative aspect-[4/3] w-full max-w-[40rem] border border-line lg:max-w-none">
      <div aria-hidden="true" className="absolute inset-0">
        <svg viewBox="0 0 400 300" focusable="false" className="absolute inset-0 size-full">
          {children}
        </svg>
        <Seam node={node} className="absolute inset-y-0 left-1/2" />
        <Annotation className="absolute left-3 top-3">Fig. {figure} · Drawn</Annotation>
        <Annotation className="absolute left-[calc(50%+0.75rem)] top-3">Built</Annotation>
        {CORNERS.map((position) => (
          <span key={position} className={`absolute size-2 ${position}`}>
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-control" />
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-control" />
          </span>
        ))}
      </div>
    </Reveal>
  );
}
