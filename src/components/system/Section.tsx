import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  /** id of the heading that names this section. */
  labelledBy?: string;
  /** Draws the hairline that opens a new chapter. */
  ruled?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({ id, labelledBy, ruled = false, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative scroll-mt-20 py-section", ruled && "border-t border-line", className)}
    >
      {children}
    </section>
  );
}
