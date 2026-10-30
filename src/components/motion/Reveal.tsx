import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  /** Stagger offset in milliseconds. */
  delay?: number;
  className?: string;
  /** Extra inline style, such as CSS variables for the helpers in motion.css. */
  style?: CSSProperties;
  children: ReactNode;
}

/** Rises into place once when scrolled into view (see reveal-runtime.ts). */
export function Reveal({ as: Tag = "div", delay = 0, className, style, children }: RevealProps) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties) : style}
      // The runtime marks revealed elements before React hydrates.
      suppressHydrationWarning
    >
      {children}
    </Tag>
  );
}
