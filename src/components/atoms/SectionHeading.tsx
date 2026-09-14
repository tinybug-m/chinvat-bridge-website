import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SectionHeading({ children, className = "", id }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={`font-serif-monument text-3xl sm:text-5xl text-parchment-50 uppercase font-normal ${className}`}
    >
      {children}
    </h2>
  );
}
