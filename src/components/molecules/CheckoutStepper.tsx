const STEPS = ["Plan", "Details", "Payment", "Confirmation"];

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

/**
 * A quiet numbered line: each step sits under a hairline segment that turns
 * ink once reached. Only the current step is set in full ink and medium weight.
 */
export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout progress">
      <ol className="grid grid-cols-4 gap-x-1.5 sm:gap-x-3">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const isComplete = step < currentStep;
          const isActive = step === currentStep;

          return (
            <li key={label} aria-current={isActive ? "step" : undefined} className="min-w-0">
              <div aria-hidden="true" className={`h-0.5 ${isComplete || isActive ? "bg-ink" : "bg-line"}`} />
              <p
                className={`sr-only sm:not-sr-only sm:mt-3 sm:flex sm:min-w-0 sm:items-baseline sm:gap-2 sm:text-small sm:leading-tight ${
                  isActive ? "font-medium text-ink" : isComplete ? "text-ink-soft" : "text-ink-muted"
                }`}
              >
                <span className="tabular-nums">{step}</span>
                <span className="truncate">{label}</span>
                {isComplete ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className="size-3 shrink-0 self-center text-ink-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2.5 6.5l2.25 2.25L9.5 3.5" />
                  </svg>
                ) : null}
                {isActive ? <span className="sr-only"> (current step)</span> : null}
                {isComplete ? <span className="sr-only"> (complete)</span> : null}
              </p>
            </li>
          );
        })}
      </ol>
      {/* Phones: four labels don't fit across, so the line says where you are instead. */}
      <p aria-hidden="true" className="mt-3 text-small text-ink-muted sm:hidden">
        Step {currentStep} of {STEPS.length}: <span className="font-medium text-ink">{STEPS[currentStep - 1]}</span>
      </p>
    </nav>
  );
}
