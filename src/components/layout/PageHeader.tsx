import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  backLink?: string
  backLabel?: string
  actions?: ReactNode
  className?: string
  titleTransitionName?: string
}

export function PageHeader({ title, subtitle, backLink, backLabel = 'Back', actions, className, titleTransitionName }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className={`py-6 ${className ?? ''}`}>
      {backLink && (
        <Link
          to={backLink}
          viewTransition
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text transition-colors mb-3 group py-2"
        >
          <IconChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{backLabel}</span>
        </Link>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1
            className="text-2xl font-bold text-text leading-tight truncate"
            style={titleTransitionName ? { viewTransitionName: titleTransitionName } : undefined}
          >{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
