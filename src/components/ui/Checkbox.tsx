import { forwardRef, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, checked, onChange, ...props }, ref) => {
    const checkboxId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    const isChecked = !!checked

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="sr-only"
              checked={checked}
              onChange={onChange}
              {...props}
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${isChecked
                  ? 'bg-primary border-primary'
                  : 'border-border bg-surface group-hover:border-primary/50'
                }`}
            >
              <svg
                className={`w-3 h-3 text-white transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`}
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
