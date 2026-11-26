interface SteppedProgressBarProps {
  totalSteps: number;
  completedSteps: number;
  /** Accessible name, e.g. the item's label. */
  label?: string;
}

/** Above this many steps the segments would be slivers, so the bar is drawn continuous. */
const MAX_SEGMENTS = 24;

export function SteppedProgressBar({ totalSteps, completedSteps, label }: SteppedProgressBarProps) {
  const total = Math.max(1, Math.floor(totalSteps));
  const done = Math.min(total, Math.max(0, Math.floor(completedSteps)));
  const a11y = {
    role: "progressbar",
    "aria-label": label,
    "aria-valuemin": 0,
    "aria-valuemax": total,
    "aria-valuenow": done,
    "aria-valuetext": `${done} of ${total}`,
  } as const;

  if (total > MAX_SEGMENTS) {
    return (
      <div className="h-1 w-full bg-line" {...a11y}>
        <div className="h-full bg-ink" style={{ width: `${(done / total) * 100}%` }} />
      </div>
    );
  }

  return (
    <div className="grid h-1 w-full gap-1" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} {...a11y}>
      {Array.from({ length: total }).map((_, index) => (
        <div key={index} className={index < done ? "bg-ink" : "bg-line"} />
      ))}
    </div>
  );
}
