import { cn } from "@/lib/utils";

interface SeamProps {
  /** Where the ring node sits along the seam, in percent. Omit for none. */
  node?: number;
  className?: string;
}

/**
 * The signature seam: a vertical hairline where drawn becomes built. Position
 * it with className (e.g. `absolute inset-y-0 left-1/2`).
 */
export function Seam({ node, className }: SeamProps) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none relative block w-px bg-line-strong", className)}>
      {node !== undefined ? (
        <span
          className="absolute left-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-saffron-500 bg-paper"
          style={{ top: `${node}%` }}
        />
      ) : null}
    </span>
  );
}
