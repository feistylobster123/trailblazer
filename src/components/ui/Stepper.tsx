interface StepperStep {
  label: string
  description?: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <nav className={`flex items-center ${className}`} aria-label="Progress">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.label}
              className={`flex items-center ${isLast ? '' : 'flex-1'}`}
            >
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                    ${isComplete ? 'bg-primary text-white' : ''}
                    ${isCurrent ? 'bg-primary/10 text-primary border-2 border-primary' : ''}
                    ${!isComplete && !isCurrent ? 'bg-border/50 text-text-secondary' : ''}
                  `}
                >
                  {isComplete ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 7l4 4 6-6" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden sm:block">
                  <p
                    className={`text-xs font-medium whitespace-nowrap
                      ${isCurrent ? 'text-primary' : isComplete ? 'text-text' : 'text-text-secondary'}
                    `}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-text-secondary whitespace-nowrap">{step.description}</p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded transition-colors
                    ${isComplete ? 'bg-primary' : 'bg-border'}
                  `}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
