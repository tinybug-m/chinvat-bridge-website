import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  centered?: boolean;
  className?: string;
}

export function Eyebrow({ children, centered = false, className = "" }: EyebrowProps) {
  if (centered) {
    return (
      <div className={`flex items-center justify-center gap-3 text-gold-500 ${className}`}>
        <span aria-hidden="true" className="h-px w-12 bg-gold-500/40" />
        <span className="font-mono text-[10px] tracking-technical uppercase">{children}</span>
        <span aria-hidden="true" className="h-px w-12 bg-gold-500/40" />
      </div>
    );
  }

  return (
    <span className={`font-mono text-[10px] tracking-technical text-gold-500 uppercase block mb-1.5 ${className}`}>
      {children}
    </span>
  );
}
