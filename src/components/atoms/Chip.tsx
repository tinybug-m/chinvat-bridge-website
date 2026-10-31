import { cn } from "@/lib/utils";

interface ChipProps {
  children: string;
  emphasized?: boolean;
}

export function Chip({ children, emphasized = false }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-2 py-0.5 text-[0.8125rem] leading-5",
        emphasized ? "border-line-strong text-ink" : "border-line text-ink-muted",
      )}
    >
      {children}
    </span>
  );
}
