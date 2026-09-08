import type { ReactNode } from "react";

interface CornerFrameProps {
  children: ReactNode;
  className?: string;
  offset?: "sm" | "md";
  colorClassName?: string;
}

const OFFSET_CLASSES = {
  sm: "top-2 left-2 right-2 bottom-2",
  md: "top-3 left-3 right-3 bottom-3",
};

export function CornerFrame({
  children,
  className = "",
  offset = "sm",
  colorClassName = "border-gold-500/60",
}: CornerFrameProps) {
  const [top, left, right, bottom] = OFFSET_CLASSES[offset].split(" ");

  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className={`absolute ${top} ${left} w-3 h-3 border-t-2 border-l-2 ${colorClassName}`} />
      <div aria-hidden="true" className={`absolute ${top} ${right} w-3 h-3 border-t-2 border-r-2 ${colorClassName}`} />
      <div aria-hidden="true" className={`absolute ${bottom} ${left} w-3 h-3 border-b-2 border-l-2 ${colorClassName}`} />
      <div aria-hidden="true" className={`absolute ${bottom} ${right} w-3 h-3 border-b-2 border-r-2 ${colorClassName}`} />
      {children}
    </div>
  );
}
