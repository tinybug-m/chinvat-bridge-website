import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  /** Stagger offset in milliseconds. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** Rises into place once when scrolled into view (see reveal-runtime.ts). */
export function Reveal({ as: Tag = "div", delay = 0, className, children }: RevealProps) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
      // The runtime marks revealed elements before React hydrates.
      suppressHydrationWarning
    >
      {children}
    </Tag>
  );
}
