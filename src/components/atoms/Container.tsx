import type { ReactNode } from "react";

type ContainerSize = "4xl" | "5xl" | "7xl";

const SIZE_CLASSES: Record<ContainerSize, string> = {
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
};

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  /** Adds the wider `lg:px-12` gutter on top of the base `px-6`. */
  wide?: boolean;
  className?: string;
}

export function Container({ children, size = "7xl", wide = true, className = "" }: ContainerProps) {
  return (
    <div className={`${SIZE_CLASSES[size]} mx-auto px-6 ${wide ? "lg:px-12" : ""} ${className}`}>
      {children}
    </div>
  );
}
