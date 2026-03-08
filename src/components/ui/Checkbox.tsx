import { forwardRef, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              {...props}
            />
            <div
              className="w-5 h-5 rounded border-2 border-border bg-surface
                peer-checked:bg-primary peer-checked:border-primary
                peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20
                peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                transition-colors flex items-center justify-center"
            >
              <svg
                className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 6l3 3 5-5" />
              </svg>
            </div>
            {/* Visible checkmark overlay since peer selector on sibling doesn't work for nested */}
          </div>
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-text-secondary mt-0.5">{description}</span>
            )}
          </div>
        </label>
        {error && <p className="text-xs text-danger ml-8">{error}</p>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
