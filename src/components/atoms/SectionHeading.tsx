import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** h1 when the heading is the page's title. */
  as?: "h1" | "h2";
}

export function SectionHeading({ children, className = "", id, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <Tag
      id={id}
      className={`font-serif-monument text-3xl sm:text-5xl text-parchment-50 uppercase font-normal ${className}`}
    >
      {children}
    </Tag>
  );
}
