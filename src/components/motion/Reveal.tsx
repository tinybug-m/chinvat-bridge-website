import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  /** Stagger offset in milliseconds. */
  delay?: number;
  className?: string;
  /** Extra inline style, such as CSS variables for the helpers in motion.css. */
  style?: CSSProperties;
  /** Something other than scrolling into view reveals it (for example "energy", see EnergyFlow); the runtime skips it. */
  revealBy?: string;
  children: ReactNode;
}

/** Rises into place once when scrolled into view (see reveal-runtime.ts). */
export function Reveal({ as: Tag = "div", delay = 0, className, style, revealBy, children }: RevealProps) {
  return (
    <Tag
      data-reveal=""
      data-reveal-by={revealBy}
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties) : style}
      // The runtime marks revealed elements before React hydrates.
      suppressHydrationWarning
    >
      {children}
    </Tag>
  );
}
