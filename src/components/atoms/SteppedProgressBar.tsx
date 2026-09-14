interface SteppedProgressBarProps {
  totalSteps: number;
  completedSteps: number;
}

export function SteppedProgressBar({ totalSteps, completedSteps }: SteppedProgressBarProps) {
  return (
    <div
      className="grid gap-1.5 h-2 w-full"
      style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={index < completedSteps ? "bg-gold-500" : "bg-obsidian-700 border border-stone-border"}
        />
      ))}
    </div>
  );
}
