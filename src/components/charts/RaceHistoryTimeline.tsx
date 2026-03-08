interface RaceHistoryTimelineProps {
  races: Array<{
    raceId: string
    raceName: string
    date: string
    distanceKm: number
    finishTimeSeconds?: number
    placement?: number
    totalFinishers?: number
    status: 'finished' | 'dnf' | 'dns'
    performanceIndex?: number
  }>
  className?: string
}

const STATUS_CONFIG = {
  finished: {
    dot: 'bg-success',
    border: 'border-success',
    badge: 'bg-success/10 text-success',
    label: 'Finished',
  },
  dnf: {
    dot: 'bg-danger',
    border: 'border-danger',
    badge: 'bg-danger/10 text-danger',
    label: 'DNF',
  },
  dns: {
    dot: 'bg-border',
    border: 'border-border',
    badge: 'bg-border/50 text-text-secondary',
    label: 'DNS',
  },
} as const

function formatFinishTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDistance(km: number): string {
  if (km >= 160) return '100mi'
  if (km >= 100) return '100km'
  if (km >= 80) return '80km'
  if (km >= 50) return '50km'
  return `${Math.round(km)}km`
}

export function RaceHistoryTimeline({ races, className }: RaceHistoryTimelineProps) {
  const sorted = [...races].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className={`py-12 text-center text-text-secondary ${className ?? ''}`}>
        No race history yet.
      </div>
    )
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Vertical spine */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />

      <ol className="space-y-6">
        {sorted.map((race, idx) => {
          const config = STATUS_CONFIG[race.status]

          return (
            <li key={`${race.raceId}-${idx}`} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0 flex items-start pt-1">
                <span
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${config.dot} ${config.border}`}
                  aria-label={config.label}
                />
              </div>

              {/* Card */}
              <div className="flex-1 bg-surface border border-border rounded-lg p-4 shadow-sm min-w-0">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text leading-tight truncate">
                      {race.raceName}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {formatDate(race.date)} &middot; {formatDistance(race.distanceKm)}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${config.badge}`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Stats row */}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  {race.status === 'finished' && race.finishTimeSeconds != null && (
                    <span className="text-text">
                      <span className="text-text-secondary text-xs">Time </span>
                      <span className="font-mono font-medium">
                        {formatFinishTime(race.finishTimeSeconds)}
                      </span>
                    </span>
                  )}

                  {race.placement != null && race.totalFinishers != null && (
                    <span className="text-text">
                      <span className="text-text-secondary text-xs">Place </span>
                      <span className="font-medium">
                        {race.placement}/{race.totalFinishers}
                      </span>
                    </span>
                  )}

                  {race.performanceIndex != null && race.performanceIndex > 0 && (
                    <span className="text-text">
                      <span className="text-text-secondary text-xs">PI </span>
                      <span className="font-medium text-primary">
                        {race.performanceIndex}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
