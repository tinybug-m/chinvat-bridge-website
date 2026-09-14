const STEPS = ["Plan", "Details", "Payment", "Confirmation"];

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress">
      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const isComplete = step < currentStep;
          const isActive = step === currentStep;

          return (
            <li
              key={label}
              aria-current={isActive ? "step" : undefined}
              className={`border rounded-sm px-3 py-2.5 flex items-center justify-between ${
                isActive
                  ? "bg-obsidian-800 border-2 border-gold-500 shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                  : isComplete
                    ? "bg-obsidian-850 border-stone-borderLight"
                    : "bg-obsidian-900/60 border-stone-border opacity-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs font-bold ${
                    isActive || isComplete ? "text-gold-500" : "text-parchment-dim"
                  }`}
                >
                  {String(step).padStart(2, "0")}
                </span>
                <span
                  className={`font-mono text-xs uppercase tracking-technical ${
                    isActive
                      ? "text-parchment-50 font-bold"
                      : isComplete
                        ? "text-parchment-200"
                        : "text-parchment-dim"
                  }`}
                >
                  {label}
                </span>
                {isActive ? <span className="sr-only"> (current step)</span> : null}
              </div>
              {isComplete ? (
                <span aria-hidden="true" className="text-gold-500 font-bold text-xs">
                  &#10003;
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
