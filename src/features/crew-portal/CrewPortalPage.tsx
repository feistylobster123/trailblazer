import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRace } from '@/hooks/useRace'
import { useCrew } from '@/hooks/useCrew'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import type { ChecklistItem } from '@/services/interfaces/crew.service'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RacePhase = 'pre_race' | 'live' | 'finished'

type RunnerStatus = 'pre_race' | 'racing' | 'at_aid_station' | 'dnf' | 'finished'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function racePhaseFromStatus(status: string | undefined): RacePhase {
  if (status === 'in_progress') return 'live'
  if (status === 'completed') return 'finished'
  return 'pre_race'
}

function formatETA(isoTimestamp: string): string {
  const eta = new Date(isoTimestamp)
  const now = new Date()
  const diffMs = eta.getTime() - now.getTime()
  if (diffMs <= 0) return 'Now'
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 60) return `~${diffMin}m`
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`
}

function formatTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function runnerStatusBadge(status: RunnerStatus) {
  switch (status) {
    case 'racing':
      return <Badge variant="success" dot>On Course</Badge>
    case 'at_aid_station':
      return <Badge variant="warning" dot>At Aid Station</Badge>
    case 'finished':
      return <Badge variant="info" dot>Finished</Badge>
    case 'dnf':
      return <Badge variant="danger" dot>DNF</Badge>
    default:
      return <Badge variant="default" dot>Pre-Race</Badge>
  }
}

function roleBadge(role: string) {
  switch (role) {
    case 'pacer':
      return <Badge variant="accent">Pacer</Badge>
    case 'crew_chief':
      return <Badge variant="info">Crew Chief</Badge>
    case 'driver':
      return <Badge variant="default">Driver</Badge>
    default:
      return <Badge variant="default">Support</Badge>
  }
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function RunnerCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded bg-border/60" />
          <div className="h-3 w-20 rounded bg-border/40" />
        </div>
        <div className="h-6 w-20 rounded-full bg-border/40" />
      </div>
      <div className="h-2.5 w-full rounded-full bg-border/40 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 rounded-lg bg-border/30" />
        <div className="h-12 rounded-lg bg-border/30" />
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Race Status Header
// ---------------------------------------------------------------------------

function RaceStatusHeader({ phase, lastUpdated }: { phase: RacePhase; lastUpdated?: string }) {
  return (
    <div className="flex items-center gap-3">
      {phase === 'live' && (
        <Badge variant="danger" dot size="md">Race Live</Badge>
      )}
      {phase === 'pre_race' && (
        <Badge variant="info" dot size="md">Pre-Race</Badge>
      )}
      {phase === 'finished' && (
        <Badge variant="default" size="md">Finished</Badge>
      )}
      {lastUpdated && (
        <span className="text-xs text-text-secondary">
          Updated {formatTime(lastUpdated)}
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Runner card
// ---------------------------------------------------------------------------

interface RunnerCardProps {
  runnerId: string
  runnerName: string
  bibNumber: string
  currentStatus: RunnerStatus
  currentDistanceMi?: number
  raceTotalMi: number
  nextAidStation?: string
  nextETA?: string
  overallPlace?: number
}

function RunnerCard({
  runnerName,
  bibNumber,
  currentStatus,
  currentDistanceMi = 0,
  raceTotalMi,
  nextAidStation,
  nextETA,
  overallPlace,
}: RunnerCardProps) {
  const pct = raceTotalMi > 0 ? (currentDistanceMi / raceTotalMi) * 100 : 0

  return (
    <Card variant="elevated" className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-text">{runnerName}</h3>
          <p className="text-xs text-text-secondary mt-0.5">Bib #{bibNumber}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {runnerStatusBadge(currentStatus)}
          {overallPlace != null && currentStatus === 'racing' && (
            <span className="text-xs text-text-secondary">Place #{overallPlace}</span>
          )}
        </div>
      </div>

      <ProgressBar
        value={pct}
        max={100}
        label={`${currentDistanceMi.toFixed(1)} mi of ${raceTotalMi} mi`}
        showValue
        color={currentStatus === 'dnf' ? 'danger' : currentStatus === 'finished' ? 'success' : 'accent'}
        size="md"
      />

      {nextAidStation && currentStatus === 'racing' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-bg border border-border p-3">
            <p className="text-xs text-text-secondary mb-0.5">Next Aid Station</p>
            <p className="text-sm font-semibold text-text leading-tight">{nextAidStation}</p>
          </div>
          {nextETA && (
            <div className="rounded-lg bg-bg border border-border p-3">
              <p className="text-xs text-text-secondary mb-0.5">ETA</p>
              <p className="text-sm font-semibold text-primary">{formatETA(nextETA)}</p>
              <p className="text-xs text-text-secondary">{formatTime(nextETA)}</p>
            </div>
          )}
        </div>
      )}

      {currentStatus === 'finished' && (
        <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0">
            <path d="M3 8l4 4 6-6" />
          </svg>
          <span className="text-sm font-semibold text-success">
            Finished{overallPlace != null ? ` — Place #${overallPlace}` : ''}
          </span>
        </div>
      )}

      {currentStatus === 'dnf' && (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2">
          <span className="text-sm font-semibold text-danger">Did Not Finish</span>
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Aid station info panel
// ---------------------------------------------------------------------------

interface AidStationPanelProps {
  stationName: string
  distanceMi: number
  parkingNotes?: string
  directionsUrl?: string
  checklist: ChecklistItem[]
  onCheckItem: (itemId: string, checked: boolean) => void
}

function AidStationPanel({
  stationName,
  distanceMi,
  parkingNotes,
  directionsUrl,
  checklist,
  onCheckItem,
}: AidStationPanelProps) {
  const stationChecklist = checklist.filter(
    (item) => !item.aidStationId || item.aidStationId === stationName
  )

  return (
    <Card variant="elevated" className="space-y-5">
      <CardHeader className="mb-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Next Crew Point</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">
              {stationName} &mdash; Mile {distanceMi.toFixed(1)}
            </p>
          </div>
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="secondary" size="sm">
                Directions
              </Button>
            </a>
          )}
        </div>
      </CardHeader>

      {parkingNotes && (
        <div className="rounded-lg bg-warning/10 border border-warning/20 px-3 py-2">
          <p className="text-xs font-semibold text-amber-700 mb-0.5">Parking Note</p>
          <p className="text-sm text-text-secondary">{parkingNotes}</p>
        </div>
      )}

      {stationChecklist.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text mb-3">Prep Checklist</h4>
          <div className="space-y-2">
            {stationChecklist.map((item) => (
              <Checkbox
                key={item.id}
                id={`checklist-${item.id}`}
                label={item.label}
                checked={item.completed}
                onChange={(e) => onCheckItem(item.id, e.target.checked)}
              />
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-3">
            {stationChecklist.filter((i) => i.completed).length} of {stationChecklist.length} items checked
          </p>
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Crew assignments panel
// ---------------------------------------------------------------------------

interface AssignmentsPanelProps {
  assignments: Array<{
    id: string
    crewMemberName: string
    crewPhone?: string
    role: string
    aidStations: string[]
  }>
}

function AssignmentsPanel({ assignments }: AssignmentsPanelProps) {
  if (assignments.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-secondary">No crew assignments recorded.</p>
      </Card>
    )
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Crew Assignments</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-border last:border-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-text">{assignment.crewMemberName}</span>
                {roleBadge(assignment.role)}
              </div>
              {assignment.crewPhone && (
                <a
                  href={`tel:${assignment.crewPhone}`}
                  className="text-xs text-primary hover:underline mt-0.5 block"
                >
                  {assignment.crewPhone}
                </a>
              )}
            </div>
            {assignment.aidStations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {assignment.aidStations.map((station) => (
                  <span
                    key={station}
                    className="text-xs bg-bg border border-border rounded px-2 py-0.5 text-text-secondary"
                  >
                    {station}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="flex flex-col items-center text-center py-10 space-y-3">
      <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-sm text-text-secondary max-w-xs">{message}</p>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function CrewPortalPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const { race, isLoading: raceLoading } = useRace(raceId)
  const { dashboard, assignments, isLoading, error, updateChecklist, refresh } = useCrew(raceId)

  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})

  const phase = racePhaseFromStatus(race?.currentEdition?.status)
  const raceTotalMi = race?.distanceMi ?? 0

  // Merge server checklist state with local optimistic updates
  const mergedChecklist: ChecklistItem[] = (dashboard?.checklist ?? []).map((item) => ({
    ...item,
    completed: item.id in checklistState ? checklistState[item.id] : item.completed,
  }))

  async function handleCheckItem(itemId: string, checked: boolean) {
    setChecklistState((prev) => ({ ...prev, [itemId]: checked }))
    await updateChecklist(itemId, checked)
  }

  const nextCrewPoint = dashboard?.upcomingCrewPoints?.[0]

  const runners = dashboard?.runners ?? []

  return (
    <div className="max-w-7xl mx-auto px-4">
      <PageHeader
        title="Crew Portal"
        subtitle={race?.name ?? (raceLoading ? 'Loading...' : 'Race')}
        actions={
          <div className="flex items-center gap-3">
            <RaceStatusHeader phase={phase} lastUpdated={dashboard?.lastUpdatedAt} />
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? 'animate-spin' : ''}>
                <path d="M13 2v4H9" />
                <path d="M1 12v-4h4" />
                <path d="M1.5 8A6 6 0 0 1 7 2a6 6 0 0 1 5 2.5" />
                <path d="M12.5 6A6 6 0 0 1 7 12a6 6 0 0 1-5-2.5" />
              </svg>
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        {/* Main column: runner cards */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-text mb-4">
              Runners{runners.length > 0 ? ` (${runners.length})` : ''}
            </h2>

            {isLoading && runners.length === 0 ? (
              <div className="space-y-4">
                <RunnerCardSkeleton />
                <RunnerCardSkeleton />
              </div>
            ) : runners.length === 0 ? (
              <EmptyState message="No runners are linked to this crew portal yet." />
            ) : (
              <div className="space-y-4">
                {runners.map((runner) => (
                  <RunnerCard
                    key={runner.runnerId}
                    runnerId={runner.runnerId}
                    runnerName={runner.runnerName}
                    bibNumber={runner.bibNumber}
                    currentStatus={runner.currentStatus}
                    currentDistanceMi={runner.currentDistanceMi}
                    raceTotalMi={raceTotalMi}
                    nextAidStation={runner.nextAidStation ?? undefined}
                    nextETA={runner.nextETA ?? undefined}
                    overallPlace={runner.overallPlace ?? undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Crew assignments */}
          <div>
            <h2 className="text-lg font-bold text-text mb-4">Crew Assignments</h2>
            {isLoading && assignments.length === 0 ? (
              <Card className="animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 w-48 rounded bg-border/50" />
                  <div className="h-4 w-36 rounded bg-border/40" />
                  <div className="h-4 w-52 rounded bg-border/40" />
                </div>
              </Card>
            ) : (
              <AssignmentsPanel
                assignments={assignments.map((a) => ({
                  id: a.id,
                  crewMemberName: a.crewMemberName,
                  role: a.role,
                  aidStations: a.aidStations,
                }))}
              />
            )}
          </div>
        </div>

        {/* Sidebar: aid station info */}
        <div className="space-y-6">
          {isLoading && !nextCrewPoint ? (
            <Card className="animate-pulse space-y-3">
              <div className="h-5 w-36 rounded bg-border/50" />
              <div className="h-3 w-24 rounded bg-border/40" />
              <div className="h-20 rounded-lg bg-border/30" />
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full rounded bg-border/30" />
                <div className="h-4 w-4/5 rounded bg-border/30" />
                <div className="h-4 w-3/4 rounded bg-border/30" />
              </div>
            </Card>
          ) : nextCrewPoint ? (
            <AidStationPanel
              stationName={nextCrewPoint.aidStationName}
              distanceMi={nextCrewPoint.distanceMi}
              parkingNotes={nextCrewPoint.parkingNotes}
              directionsUrl={nextCrewPoint.directionsUrl}
              checklist={mergedChecklist}
              onCheckItem={handleCheckItem}
            />
          ) : (
            <Card>
              <p className="text-sm text-text-secondary">
                No upcoming crew-accessible aid stations.
              </p>
            </Card>
          )}

          {/* All upcoming crew points */}
          {(dashboard?.upcomingCrewPoints ?? []).length > 1 && (
            <Card>
              <h4 className="text-sm font-semibold text-text mb-3">Upcoming Crew Points</h4>
              <div className="space-y-2">
                {(dashboard?.upcomingCrewPoints ?? []).slice(1).map((point) => (
                  <div
                    key={point.aidStationId}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm text-text">{point.aidStationName}</p>
                      <p className="text-xs text-text-secondary">
                        Mile {point.distanceMi.toFixed(1)}
                      </p>
                    </div>
                    {point.estimatedDriveMinutesFromPrevious != null && (
                      <span className="text-xs text-text-secondary">
                        ~{point.estimatedDriveMinutesFromPrevious}m drive
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrewPortalPage
