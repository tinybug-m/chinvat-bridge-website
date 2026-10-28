import { cn } from "@/lib/utils";

interface SectionMarkerProps {
  /** Two-digit chapter number, e.g. "02". */
  index: string;
  label: string;
  className?: string;
}

/** Mono chapter marker: index, hairline, name. */
export function SectionMarker({ index, label, className }: SectionMarkerProps) {
  return (
    <p className={cn("flex items-center gap-3 font-label text-label uppercase text-ink-muted", className)}>
      <span className="text-ink">{index}</span>
      <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
      <span>{label}</span>
    </p>
  );
}
