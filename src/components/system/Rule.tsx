import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface RuleProps {
  /** Where the seam crosses this rule, as a percentage of its width. */
  node?: number;
  className?: string;
}

/** Hairline with the brand's ring node where the seam crosses it. */
export function Rule({ node, className }: RuleProps) {
  return (
    <div aria-hidden="true" className={cn("relative h-px bg-line", className)}>
      {node !== undefined ? (
        <span
          className="absolute top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-saffron-500 bg-paper"
          style={{ left: `${node}%` } as CSSProperties}
        />
      ) : null}
    </div>
  );
}
