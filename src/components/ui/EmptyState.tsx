import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {icon ? (
        <div className="text-text-secondary/40 mb-4">{icon}</div>
      ) : (
        <div className="mb-4">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-text-secondary/30">
            <rect x="8" y="16" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M8 28h48" stroke="currentColor" strokeWidth="2" />
            <circle cx="20" cy="22" r="2" fill="currentColor" />
            <circle cx="28" cy="22" r="2" fill="currentColor" />
            <circle cx="36" cy="22" r="2" fill="currentColor" />
            <path d="M24 40l6-6 8 8 6-4 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
