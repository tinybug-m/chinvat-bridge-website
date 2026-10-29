import type { TransitionItem } from "@/data/transition";
import { cn } from "@/lib/utils";

/*
 * The five comparisons under the stage. A row is DRAWN (today emphasised,
 * the next state in muted ink) until the seam passes it, then BUILT (the
 * next state in ink). Both states are always present as
 * text; rows are separated by space, not rules.
 */

interface BridgeRowsProps {
  current: TransitionItem[];
  next: TransitionItem[];
  /** How many rows the seam has passed. */
  count: number;
  className?: string;
}

export function BridgeRows({ current, next, count, className }: BridgeRowsProps) {
  return (
    <ol className={cn("grid gap-y-10 md:gap-y-12", className)}>
      {current.map((today, index) => {
        const tomorrow = next[index];
        const built = index < count;
        return (
          <li
            key={today.label}
            data-state={built ? "built" : "drawn"}
            className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-12 md:items-baseline"
          >
            <div className="md:col-span-5">
              <p className="text-small text-ink-muted md:sr-only">Current</p>
              <p
                className={cn(
                  "mt-1 text-subheading font-medium transition-colors duration-200 md:mt-0",
                  built ? "text-ink-muted" : "text-ink",
                )}
              >
                {today.label}
              </p>
              <p className="mt-1.5 text-small text-ink-muted">{today.status}</p>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              <p className="text-small text-ink-muted md:sr-only">Next</p>
              <p
                className={cn(
                  "mt-1 font-display text-heading font-medium transition-colors duration-200 md:mt-0",
                  built ? "text-ink" : "text-ink-muted",
                )}
              >
                {tomorrow.label}
              </p>
              <p
                className={cn(
                  "mt-1.5 text-small transition-colors duration-200",
                  built ? "font-medium text-ink" : "text-ink-muted",
                )}
              >
                {tomorrow.status}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
