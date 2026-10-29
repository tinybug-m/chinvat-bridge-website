import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnnotationProps {
  children: ReactNode;
  /** Which side the leader line runs out from, if any. */
  leader?: "start" | "end" | "none";
  /** Leader length as a CSS length. */
  leaderLength?: string;
  className?: string;
}

/**
 * Drawing-style callout: a short mono caption, optionally on a hairline leader
 * that ends in a ring node. Reserve it for the hero mark and the seam; a
 * caption on every frame turns it into decoration.
 */
export function Annotation({ children, leader = "none", leaderLength = "3rem", className }: AnnotationProps) {
  const line = (
    <span aria-hidden="true" className={cn("flex items-center", leader === "end" && "flex-row-reverse")}>
      <span className="size-1.5 shrink-0 rounded-full border border-saffron-600" />
      <span className="h-px bg-line-strong" style={{ width: leaderLength }} />
    </span>
  );

  return (
    <span className={cn("inline-flex items-center gap-2 font-label text-label text-ink-muted", className)}>
      {leader === "start" ? line : null}
      <span>{children}</span>
      {leader === "end" ? line : null}
    </span>
  );
}
