import { cn } from "@/lib/utils";

type Direction = "right" | "down" | "up-right";

const ROTATION: Record<Direction, string> = {
  right: "",
  down: "rotate-90",
  "up-right": "-rotate-45",
};

/** Monoline arrow drawn to match the mark's square-ended struts. */
export function ArrowIcon({ direction = "right", className }: { direction?: Direction; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className={cn("size-4 shrink-0", ROTATION[direction], className)}
    >
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
