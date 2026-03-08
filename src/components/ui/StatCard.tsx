import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeType = 'neutral',
  className = '',
  size = 'md',
}: StatCardProps) {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-text-secondary',
  }

  return (
    <div className={`bg-surface border border-border rounded-xl ${size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4'} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
          <p className={`font-extrabold text-text mt-1 ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
            {value}
          </p>
          {change && (
            <p className={`text-xs font-medium mt-1 ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-text-muted text-xl shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatRowProps {
  stats: Array<{
    label: string
    value: string | number
  }>
  className?: string
}

export function StatRow({ stats, className = '' }: StatRowProps) {
  return (
    <div className={`flex gap-6 ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <p className="text-2xl font-extrabold text-text">{stat.value}</p>
          <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
