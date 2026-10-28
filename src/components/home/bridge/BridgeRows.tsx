import type { TransitionItem } from "@/data/transition";
import { cn } from "@/lib/utils";

/*
 * The five comparisons under the stage. A row is DRAWN (today emphasised,
 * the next state in muted ink on a dashed leader) until the seam passes it,
 * then BUILT (the next state in ink, a solid leader ending in a ring node).
 * Both states are always present as text.
 */

interface BridgeRowsProps {
  current: TransitionItem[];
  next: TransitionItem[];
  /** How many rows the seam has passed. */
  count: number;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function BridgeRows({ current, next, count, className }: BridgeRowsProps) {
  return (
    <div className={className}>
      <div
        aria-hidden="true"
        className="hidden grid-cols-12 gap-x-6 pb-4 font-label text-label uppercase text-ink-muted md:grid"
      >
        <span className="col-span-5 col-start-2">Current state</span>
        <span className="col-span-5 col-start-8">Future direction</span>
      </div>
      <ol className="border-b border-line">
        {current.map((today, index) => {
          const tomorrow = next[index];
          const built = index < count;
          return (
            <li
              key={today.label}
              data-state={built ? "built" : "drawn"}
              className="grid grid-cols-[2rem_1fr] gap-x-4 gap-y-5 border-t border-line py-6 md:grid-cols-12 md:items-center md:gap-x-6 md:py-7"
            >
              <span
                className={cn(
                  "row-span-2 pt-1 font-label text-label tabular-nums transition-colors duration-200 md:col-span-1 md:row-span-1 md:pt-0",
                  built ? "text-ink" : "text-ink-muted",
                )}
              >
                {pad(index + 1)}
              </span>

              <div className="md:col-span-5">
                <p className="font-label text-label uppercase text-ink-muted md:sr-only">Current</p>
                <p
                  className={cn(
                    "mt-1 text-subheading font-medium transition-colors duration-200 md:mt-0",
                    built ? "text-ink-muted" : "text-ink",
                  )}
                >
                  {today.label}
                </p>
                <p className="mt-1.5 font-label text-label uppercase text-ink-muted">{today.status}</p>
              </div>

              <span aria-hidden="true" className="relative hidden h-px items-center md:col-span-1 md:flex">
                <span
                  className={cn(
                    "h-px w-full transition-colors duration-200",
                    built
                      ? "bg-ink"
                      : "bg-[repeating-linear-gradient(90deg,var(--color-line-strong)_0_4px,transparent_4px_8px)]",
                  )}
                />
                <span
                  className={cn(
                    "absolute right-0 size-[11px] translate-x-1/2 rounded-full border-2 bg-paper-raised transition-colors duration-200",
                    built ? "border-saffron-500" : "border-line-strong",
                  )}
                />
              </span>

              <div className="col-start-2 md:col-span-5 md:col-start-8">
                <p className="font-label text-label uppercase text-ink-muted md:sr-only">Next</p>
                <p
                  className={cn(
                    "mt-1 text-subheading font-medium transition-colors duration-200 md:mt-0",
                    built ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {tomorrow.label}
                </p>
                <p
                  className={cn(
                    "mt-1.5 flex items-center gap-2 font-label text-label uppercase transition-colors duration-200",
                    built ? "text-ink" : "text-ink-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 shrink-0 rounded-full border transition-colors duration-200",
                      built ? "border-saffron-600 bg-saffron-500" : "border-line-strong",
                    )}
                  />
                  {tomorrow.status}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
