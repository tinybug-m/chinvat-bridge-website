import { cn } from "@/lib/utils";

type Direction = "right" | "down" | "up-right";

const ROTATION: Record<Direction, string> = {
  right: "",
  down: "rotate-90",
  "up-right": "-rotate-45",
};

// The nudge follows whichever control owns the arrow: a Button (group/button) or a TextLink (group/link).
const NUDGE: Record<Direction, string> = {
  right: "group-hover/button:translate-x-0.5 group-hover/link:translate-x-0.5",
  down: "group-hover/button:translate-y-0.5 group-hover/link:translate-y-0.5",
  "up-right": "group-hover/button:translate-x-0.5 group-hover/link:translate-x-0.5",
};

/** Monoline arrow drawn to match the mark's square-ended struts. */
export function ArrowIcon({ direction = "right", className }: { direction?: Direction; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={cn(
        "size-4 shrink-0 transition-transform duration-200 ease-out-quart motion-reduce:transition-none",
        ROTATION[direction],
        NUDGE[direction],
        className,
      )}
    >
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
