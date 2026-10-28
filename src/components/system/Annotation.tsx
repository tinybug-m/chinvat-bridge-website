import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnnotationProps {
  /** Two-digit callout number, e.g. "01". */
  index?: string;
  children: ReactNode;
  /** Which side the leader line runs out from, if any. */
  leader?: "start" | "end" | "none";
  /** Leader length as a CSS length. */
  leaderLength?: string;
  className?: string;
}

/**
 * Drawing-style callout: mono caption on a hairline leader that ends in a
 * ring node, the joint used throughout the mark.
 */
export function Annotation({ index, children, leader = "none", leaderLength = "3rem", className }: AnnotationProps) {
  const line = (
    <span aria-hidden="true" className={cn("flex items-center", leader === "end" && "flex-row-reverse")}>
      <span className="size-1.5 shrink-0 rounded-full border border-saffron-600" />
      <span className="h-px bg-line-strong" style={{ width: leaderLength }} />
    </span>
  );

  return (
    <span className={cn("inline-flex items-center gap-2 font-label text-label uppercase text-ink-muted", className)}>
      {leader === "start" ? line : null}
      {index ? <span className="text-ink">{index}</span> : null}
      <span>{children}</span>
      {leader === "end" ? line : null}
    </span>
  );
}
