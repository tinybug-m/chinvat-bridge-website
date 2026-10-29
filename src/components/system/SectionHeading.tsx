import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id: string;
  children: ReactNode;
  /** `display` is the hero scale; use it for at most one section lower down. */
  size?: "title" | "display";
  /** Tailwind max-width utility. Defaults to a tight 18ch measure. */
  measure?: string;
  className?: string;
}

/**
 * The one place the section H2 type recipe lives, so a section can change
 * size or measure on purpose instead of each pasting the same class string.
 */
export function SectionHeading({ id, children, size = "title", measure = "max-w-[18ch]", className }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn(
        "text-balance font-display font-medium [font-stretch:100%] lg:[font-stretch:112%]",
        size === "display" ? "text-display" : "text-title",
        measure,
        className,
      )}
    >
      {children}
    </h2>
  );
}
