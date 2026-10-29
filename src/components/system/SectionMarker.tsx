import { cn } from "@/lib/utils";

interface SectionMarkerProps {
  label: string;
  className?: string;
}

/**
 * Quiet section name above a heading. Plain sentence-case text: no rule, no
 * mono caps. Use it sparingly (two or three sections at most) so it stays a
 * choice and never becomes the page's template.
 */
export function SectionMarker({ label, className }: SectionMarkerProps) {
  return <p className={cn("text-small font-medium text-ink-muted", className)}>{label}</p>;
}
