import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRunner } from '@/hooks/useRunner'
import type { PersonalRecord, PerformanceIndexPoint } from '@/services/interfaces/runner.service'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { PerformanceIndexChart } from '@/components/charts/PerformanceIndexChart'
import { RaceHistoryTimeline } from '@/components/charts/RaceHistoryTimeline'

// Performance Index thresholds match the chart bands
const PI_CATEGORIES: Array<{ min: number; max: number; label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' }> = [
  { min: 800, max: Infinity, label: 'World Class', variant: 'accent' },
  { min: 600, max: 799, label: 'Elite', variant: 'accent' },
  { min: 500, max: 599, label: 'Expert', variant: 'info' },
  { min: 400, max: 499, label: 'Competitive', variant: 'success' },
  { min: 300, max: 399, label: 'Trail Runner', variant: 'default' },
  { min: 0, max: 299, label: 'Newcomer', variant: 'default' },
]

function getPICategory(pi: number) {
  return PI_CATEGORIES.find(c => pi >= c.min && pi <= c.max) ?? PI_CATEGORIES[PI_CATEGORIES.length - 1]
}

function formatSeconds(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${m}m ${String(s).padStart(2, '0')}s`
}

function formatDistance(mi: number): string {
  return `${mi.toFixed(1)} mi`
}

function formatElevation(ft: number): string {
  return ft >= 1000 ? `${(ft / 1000).toFixed(1)}k ft` : `${Math.round(ft)} ft`
}

// Skeleton placeholder for loading state
function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-border/40 rounded-lg animate-pulse ${className}`} />
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="flex items-start gap-5 mb-8">
        <SkeletonBlock className="w-20 h-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-64" />
          <SkeletonBlock className="h-4 w-40" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Content skeleton */}
      <SkeletonBlock className="h-8 w-full mb-6" />
      <SkeletonBlock className="h-64 w-full" />
    </div>
  )
}

const TABS = [
  { id: 'history', label: 'Race History', icon: '🏁' },
  { id: 'performance', label: 'Performance', icon: '📈' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]

export function RunnerProfilePage() {
  const { runnerId } = useParams<{ runnerId: string }>()
  const { runner, stats, raceHistory, personalRecords, piHistory, isLoading, error } = useRunner(runnerId)
  const [activeTab, setActiveTab] = useState('history')

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-danger text-lg font-semibold">Failed to load runner profile</p>
        <p className="text-text-secondary mt-2 text-sm">{error.message}</p>
      </div>
    )
  }

  if (!runner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-text-secondary">Runner not found.</p>
      </div>
    )
  }

  const fullName = runner.displayName || `${runner.firstName} ${runner.lastName}`.trim()
  const piCategory = getPICategory(runner.performanceIndex)
  const dnfCount = stats ? stats.dnfs : 0
  const totalRaces = stats ? stats.totalRaces : 0
  const finishes = stats ? stats.finishes : 0
  const finishRate = totalRaces > 0 ? ((finishes / totalRaces) * 100).toFixed(0) : '0'

  // Map runner service RaceHistoryEntry to RaceHistoryTimeline's expected shape
  const timelineRaces = raceHistory.map(r => ({
    raceId: r.raceId,
    raceName: r.raceName,
    date: r.startDate,
    distanceKm: r.distanceMi * 1.60934,
    finishTimeSeconds: r.finishTimeSeconds,
    placement: r.overallPlace,
    totalFinishers: undefined as number | undefined,
    status: (r.status === 'dq' ? 'dnf' : r.status) as 'finished' | 'dnf' | 'dns',
    performanceIndex: r.performanceIndexEarned,
  }))

  // Map PerformanceIndexPoint to chart shape
  const chartData: Array<{ date: string; value: number; raceName?: string }> = piHistory.map(
    (p: PerformanceIndexPoint) => ({
      date: p.date,
      value: p.value,
      raceName: p.raceName,
    })
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card variant="elevated" padding="lg" className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <Avatar
            src={runner.avatarUrl}
            name={fullName}
            size="xl"
            className="shrink-0 self-center sm:self-start"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-text leading-tight">{fullName}</h1>
              <Badge variant={piCategory.variant} size="md">
                {piCategory.label}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary mb-3">
              {runner.location && (
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  {runner.location}
                  {runner.country && runner.country !== runner.location ? `, ${runner.country}` : ''}
                </span>
              )}
              {runner.ageGroup && (
                <span className="flex items-center gap-1">
                  <span>👤</span>
                  {runner.ageGroup}
                </span>
              )}
              {runner.gender && runner.gender !== 'prefer_not_to_say' && (
                <span>{runner.gender === 'M' ? 'Male' : runner.gender === 'F' ? 'Female' : 'Non-binary'}</span>
              )}
            </div>

            {runner.bio && (
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{runner.bio}</p>
            )}
          </div>

          <div className="text-center sm:text-right shrink-0">
            <p className="text-3xl font-extrabold text-primary">{runner.performanceIndex}</p>
            <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mt-0.5">
              Performance Index
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Races"
          value={totalRaces}
          icon={<span>🏃</span>}
        />
        <StatCard
          label="Finishes"
          value={finishes}
          icon={<span>✅</span>}
          changeType="positive"
        />
        <StatCard
          label="DNFs"
          value={dnfCount}
          icon={<span>🚩</span>}
          changeType={dnfCount > 0 ? 'negative' : 'neutral'}
        />
        <StatCard
          label="Finish Rate"
          value={`${finishRate}%`}
          icon={<span>📊</span>}
          changeType={Number(finishRate) >= 80 ? 'positive' : Number(finishRate) >= 60 ? 'neutral' : 'negative'}
        />
      </div>

      {/* Personal Records by distance */}
      {personalRecords.length > 0 && (
        <Card variant="default" padding="md" className="mb-6">
          <CardHeader className="mb-3">
            <CardTitle>Personal Records</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {personalRecords.map((pr: PersonalRecord) => (
              <div
                key={pr.distance}
                className="bg-bg rounded-lg p-3 text-center border border-border/60"
              >
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
                  {pr.distance}
                </p>
                <p className="text-sm font-bold text-primary font-mono">
                  {formatSeconds(pr.finishTimeSeconds)}
                </p>
                <p className="text-xs text-text-secondary mt-1 truncate">{pr.raceName}</p>
                <p className="text-xs text-text-secondary">{pr.editionYear}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Tab: Race History */}
      <TabPanel tabId="history" activeTab={activeTab}>
        {timelineRaces.length === 0 ? (
          <div className="py-16 text-center text-text-secondary">No race history available.</div>
        ) : (
          <RaceHistoryTimeline races={timelineRaces} className="mt-4" />
        )}
      </TabPanel>

      {/* Tab: Performance */}
      <TabPanel tabId="performance" activeTab={activeTab}>
        <div className="mt-4 space-y-6">
          {/* Current PI badge */}
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Current Performance Index
                </p>
                <p className="text-4xl font-extrabold text-primary mt-1">{runner.performanceIndex}</p>
                <Badge variant={piCategory.variant} className="mt-2">
                  {piCategory.label}
                </Badge>
              </div>
              {stats && (
                <div className="text-right text-sm text-text-secondary space-y-1">
                  <p>
                    Rank:{' '}
                    <span className="font-semibold text-text">
                      {stats.performanceIndexRank != null ? `#${stats.performanceIndexRank}` : 'N/A'}
                    </span>
                  </p>
                  <p>
                    Avg pace:{' '}
                    <span className="font-semibold text-text font-mono">
                      {stats.averagePaceMinPerMi.toFixed(1)} min/mi
                    </span>
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* PI over time chart */}
          {chartData.length > 0 ? (
            <Card variant="default" padding="md">
              <CardHeader className="mb-2">
                <CardTitle>PI Over Time</CardTitle>
              </CardHeader>
              <PerformanceIndexChart data={chartData} height={300} />
            </Card>
          ) : (
            <div className="py-12 text-center text-text-secondary text-sm">
              Not enough data to show performance chart.
            </div>
          )}

          {/* Personal records table */}
          {personalRecords.length > 0 && (
            <Card variant="default" padding="md">
              <CardHeader className="mb-3">
                <CardTitle>Personal Records</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      <th className="pb-2 pr-4">Distance</th>
                      <th className="pb-2 pr-4">Time</th>
                      <th className="pb-2 pr-4">Race</th>
                      <th className="pb-2">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {personalRecords.map((pr: PersonalRecord) => (
                      <tr key={pr.distance} className="hover:bg-bg transition-colors">
                        <td className="py-2.5 pr-4 font-semibold text-text">{pr.distance}</td>
                        <td className="py-2.5 pr-4 font-mono font-medium text-primary">
                          {formatSeconds(pr.finishTimeSeconds)}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary truncate max-w-[160px]">
                          {pr.raceName}
                        </td>
                        <td className="py-2.5 text-text-secondary">{pr.editionYear}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </TabPanel>

      {/* Tab: Stats */}
      <TabPanel tabId="stats" activeTab={activeTab}>
        <div className="mt-4 space-y-4">
          {stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard
                  label="Total Distance"
                  value={formatDistance(stats.totalDistanceMi)}
                  icon={<span>🛤️</span>}
                  size="md"
                />
                <StatCard
                  label="Total Elevation Gain"
                  value={formatElevation(stats.totalElevationGainFt)}
                  icon={<span>⛰️</span>}
                  size="md"
                />
                <StatCard
                  label="Finish Rate"
                  value={`${(stats.finishRate * 100).toFixed(0)}%`}
                  icon={<span>✅</span>}
                  changeType={stats.finishRate >= 0.8 ? 'positive' : stats.finishRate >= 0.6 ? 'neutral' : 'negative'}
                  size="md"
                />
                <StatCard
                  label="Total Moving Time"
                  value={formatSeconds(stats.totalMovingTimeSeconds)}
                  icon={<span>⏱️</span>}
                  size="md"
                />
                <StatCard
                  label="Avg Pace"
                  value={`${stats.averagePaceMinPerMi.toFixed(1)} min/mi`}
                  icon={<span>🚀</span>}
                  size="md"
                />
                <StatCard
                  label="Total Races"
                  value={stats.totalRaces}
                  icon={<span>🏁</span>}
                  size="md"
                />
              </div>

              {/* Speed records */}
              {(stats.fastestHundredMileFinishSeconds ||
                stats.fastestFiftyMileFinishSeconds ||
                stats.fastestHundredKFinishSeconds ||
                stats.fastestFiftyKFinishSeconds) && (
                <Card variant="default" padding="md">
                  <CardHeader className="mb-3">
                    <CardTitle>Best Times by Distance</CardTitle>
                  </CardHeader>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stats.fastestFiftyKFinishSeconds && (
                      <div className="bg-bg rounded-lg p-3 border border-border/60 text-center">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">50K</p>
                        <p className="font-mono font-bold text-primary text-sm">
                          {formatSeconds(stats.fastestFiftyKFinishSeconds)}
                        </p>
                      </div>
                    )}
                    {stats.fastestHundredKFinishSeconds && (
                      <div className="bg-bg rounded-lg p-3 border border-border/60 text-center">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">100K</p>
                        <p className="font-mono font-bold text-primary text-sm">
                          {formatSeconds(stats.fastestHundredKFinishSeconds)}
                        </p>
                      </div>
                    )}
                    {stats.fastestFiftyMileFinishSeconds && (
                      <div className="bg-bg rounded-lg p-3 border border-border/60 text-center">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">50 Mi</p>
                        <p className="font-mono font-bold text-primary text-sm">
                          {formatSeconds(stats.fastestFiftyMileFinishSeconds)}
                        </p>
                      </div>
                    )}
                    {stats.fastestHundredMileFinishSeconds && (
                      <div className="bg-bg rounded-lg p-3 border border-border/60 text-center">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-1">100 Mi</p>
                        <p className="font-mono font-bold text-primary text-sm">
                          {formatSeconds(stats.fastestHundredMileFinishSeconds)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-text-secondary">No stats available.</div>
          )}
        </div>
      </TabPanel>
    </div>
  )
}
