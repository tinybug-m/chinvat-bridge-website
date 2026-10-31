interface SteppedProgressBarProps {
  totalSteps: number;
  completedSteps: number;
}

export function SteppedProgressBar({ totalSteps, completedSteps }: SteppedProgressBarProps) {
  return (
    <div
      className="grid h-1 w-full gap-1"
      style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className={index < completedSteps ? "bg-ink" : "bg-line"} />
      ))}
    </div>
  );
}
