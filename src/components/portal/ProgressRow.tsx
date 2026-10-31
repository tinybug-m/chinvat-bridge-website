import { SteppedProgressBar } from "@/components/atoms/SteppedProgressBar";

interface ProgressRowProps {
  label: string;
  percentLabel: string;
  totalSteps: number;
  completedSteps: number;
  note?: string | null;
}

export function ProgressRow({ label, percentLabel, totalSteps, completedSteps, note }: ProgressRowProps) {
  return (
    <li className="space-y-3 px-5 py-5 sm:px-6">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-body font-medium text-ink">{label}</span>
        <span className="shrink-0 text-small text-ink-soft tabular-nums">{percentLabel}</span>
      </div>
      <SteppedProgressBar totalSteps={totalSteps} completedSteps={completedSteps} />
      {note ? <p className="text-small text-pretty text-ink-muted">{note}</p> : null}
    </li>
  );
}
