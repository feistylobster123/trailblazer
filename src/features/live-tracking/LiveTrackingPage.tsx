import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTrackingStore } from '@/stores/tracking.store'
import { useRace } from '@/hooks/useRace'
import { CourseMap } from '@/components/maps/CourseMap'
import { ElevationProfile } from '@/components/maps/ElevationProfile'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui'
import { SearchInput, Badge, Button, Skeleton } from '@/components/ui'
import { formatDuration } from '@/utils/time'
import type { RunnerPosition, TrackingEvent } from '@/services/interfaces/tracking.service'
import type { AidStation as TypesAidStation, ElevationPoint } from '@/types/race'
import type { AidStation as ServiceAidStation } from '@/services/interfaces/race.service'

const KM_TO_MI = 0.621371
const MI_TO_KM = 1.60934
const FT_TO_M = 0.3048

function toTypesAidStation(s: ServiceAidStation): TypesAidStation {
  return {
    id: s.id,
    name: s.name,
    distanceKm: s.distanceMi * MI_TO_KM,
    distanceMi: s.distanceMi,
    elevationM: Math.round((s.coordinates.elevationFt ?? 0) * FT_TO_M),
    elevationFt: s.coordinates.elevationFt ?? 0,
    location: { lat: s.coordinates.lat, lng: s.coordinates.lng },
    cutoffTime: s.cutoffTime,
    crewAccess: s.crewAccessible,
    pacerAccess: false,
    dropBags: s.dropBagsAllowed,
    supplies: s.services,
    description: '',
  }
}

function toElevationPoints(profile: Array<{ distanceMi: number; elevationFt: number }>): ElevationPoint[] {
  return profile.map((p, i, arr) => {
    const distanceKm = p.distanceMi * MI_TO_KM
    const elevationM = p.elevationFt * FT_TO_M
    let grade = 0
    if (i > 0) {
      const prevDist = arr[i - 1].distanceMi * MI_TO_KM
      const prevElev = arr[i - 1].elevationFt * FT_TO_M
      const dDist = (distanceKm - prevDist) * 1000
      if (dDist > 0) grade = ((elevationM - prevElev) / dDist) * 100
    }
    return { distanceKm, elevationM, grade }
  })
}

const PLAYBACK_SPEEDS = [1, 2, 5, 10]

function statusBadge(status: RunnerPosition['status']) {
  switch (status) {
    case 'racing':
      return <Badge variant="success" dot size="sm">Racing</Badge>
    case 'at_aid_station':
      return <Badge variant="warning" dot size="sm">At Aid</Badge>
    case 'dnf':
      return <Badge variant="danger" dot size="sm">DNF</Badge>
    case 'finished':
      return <Badge variant="success" size="sm">Finished</Badge>
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

function formatMiles(distanceMi: number): string {
  return `${distanceMi.toFixed(1)} mi`
}

function formatSpeed(mph: number): string {
  if (!mph || !isFinite(mph) || mph <= 0) return '--:--/mi'
  const minPerMi = 60 / mph
  const mins = Math.floor(minPerMi)
  const secs = Math.round((minPerMi - mins) * 60)
  return `${mins}:${String(secs).padStart(2, '0')}/mi`
}

function eventIcon(type: TrackingEvent['type']): string {
  switch (type) {
    case 'aid_station_passthrough':
      return '\u25CF'
    case 'status_change':
      return '\u25B2'
    default:
      return '\u2022'
  }
}

function eventColor(event: TrackingEvent): string {
  if (event.type === 'status_change') {
    const payload = event.payload as Record<string, unknown>
    if (payload.status === 'finished') return 'text-success'
    if (payload.status === 'dnf') return 'text-danger'
  }
  return 'text-accent'
}

function eventMessage(event: TrackingEvent): string {
  const payload = event.payload as Record<string, unknown>

  if (event.type === 'aid_station_passthrough') {
    const name = (payload.runnerName as string) || 'Runner'
    const station = (payload.aidStationName as string) || 'aid station'
    return `${name} arrived at ${station}`
  }

  if (event.type === 'status_change') {
    const name = (payload.runnerName as string) || 'Runner'
    const status = payload.status as string
    if (status === 'finished') {
      return `${name} has finished!`
    }
    if (status === 'dnf') {
      const location = (payload.dnfLocation as string) || ''
      return `${name} has DNF'd${location ? ` at ${location}` : ''}`
    }
    return `${name}: ${status}`
  }

  return JSON.stringify(payload).slice(0, 80)
}

// -- Leaderboard Row --
function LeaderboardRow({
  runner,
  rank,
  isSelected,
  onClick,
}: {
  runner: RunnerPosition
  rank: number
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 rounded-lg cursor-pointer active:scale-[0.98]
        ${isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-bg border border-transparent'}`}
    >
      <span className="w-8 text-center font-bold text-text-secondary text-sm shrink-0">
        {runner.status === 'finished' ? '\u2713' : runner.status === 'dnf' ? '--' : rank}
      </span>
      <span className="w-10 font-mono text-xs text-text-secondary shrink-0">#{runner.bibNumber}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{runner.runnerName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {statusBadge(runner.status)}
          <span className="text-xs text-text-secondary">{formatMiles(runner.distanceMi)}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-mono text-text">{formatSpeed(runner.speed)}</p>
      </div>
    </button>
  )
}

// -- Selected Runner Panel --
function SelectedRunnerPanel({
  runner,
  onClose,
}: {
  runner: RunnerPosition
  onClose: () => void
}) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-text text-lg">{runner.runnerName}</h3>
          <p className="text-sm text-text-secondary">Bib #{runner.bibNumber}</p>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text transition-all duration-150 active:scale-[0.85] p-1 cursor-pointer"
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-text-secondary text-xs">Distance</p>
          <p className="font-semibold text-text">{formatMiles(runner.distanceMi)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Pace</p>
          <p className="font-semibold text-text">{formatSpeed(runner.speed)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Elevation</p>
          <p className="font-semibold text-text">{Math.round(runner.elevationFt).toLocaleString()} ft</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Status</p>
          <div className="mt-0.5">{statusBadge(runner.status)}</div>
        </div>
        {runner.nextAidStationDistanceMi != null && (
          <div className="col-span-2">
            <p className="text-text-secondary text-xs">Next Aid Station</p>
            <p className="font-semibold text-text">
              {runner.nextAidStationDistanceMi.toFixed(1)} mi away
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

// -- Playback Controls --
function PlaybackControls({
  isPlaying,
  playbackSpeed,
  elapsedSeconds,
  totalDurationSeconds,
  onPlayPause,
  onSpeedChange,
  onSeek,
}: {
  isPlaying: boolean
  playbackSpeed: number
  elapsedSeconds: number
  totalDurationSeconds: number
  onPlayPause: () => void
  onSpeedChange: (speed: number) => void
  onSeek: (seconds: number) => void
}) {
  const progress = totalDurationSeconds > 0 ? (elapsedSeconds / totalDurationSeconds) * 100 : 0

  return (
    <div className="bg-surface border border-border rounded-xl px-3 sm:px-4 py-3 space-y-2 sm:space-y-0">
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-light transition-all duration-150 active:scale-[0.88] shrink-0 cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="3.5" height="12" rx="1" />
              <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5v11l9.5-5.5z" />
            </svg>
          )}
        </button>

        {/* Elapsed / Total */}
        <span className="text-xs font-mono text-text-secondary shrink-0 text-center">
          {formatDuration(elapsedSeconds)} / {formatDuration(totalDurationSeconds)}
        </span>

        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={totalDurationSeconds}
          value={elapsedSeconds}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-1 h-1.5 accent-primary cursor-pointer min-w-0"
        />
      </div>

      {/* Speed buttons - separate row on mobile */}
      <div className="flex items-center gap-1 justify-center sm:justify-end">
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-all duration-150 cursor-pointer active:scale-[0.90]
              ${playbackSpeed === speed
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-bg'
              }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  )
}

// -- Main Page --
export function LiveTrackingPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const { race, courseData, isLoading: raceLoading } = useRace(raceId)
  const store = useTrackingStore()

  const [search, setSearch] = useState('')
  const eventsFeedRef = useRef<HTMLDivElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  // Start tracking when page loads
  useEffect(() => {
    if (!raceId || hasStarted) return
    setHasStarted(true)
    store.startTracking(raceId, 'current')
  }, [raceId, hasStarted])

  // Auto-scroll events feed
  useEffect(() => {
    if (eventsFeedRef.current) {
      eventsFeedRef.current.scrollTop = 0
    }
  }, [store.recentEvents.length])

  // Sorted runners for leaderboard (by distance descending)
  const sortedRunners = useMemo(() => {
    let runners = [...store.runnerPositions]

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      runners = runners.filter(
        (r) =>
          r.runnerName.toLowerCase().includes(q) ||
          r.bibNumber.toLowerCase().includes(q),
      )
    }

    // Sort: finished first (by distance desc), then racing by distance desc, then DNF
    runners.sort((a, b) => {
      const statusOrder = { finished: 0, racing: 1, at_aid_station: 1, dnf: 2 }
      const aOrder = statusOrder[a.status] ?? 1
      const bOrder = statusOrder[b.status] ?? 1
      if (aOrder !== bOrder) return aOrder - bOrder
      return b.distanceMi - a.distanceMi
    })

    return runners
  }, [store.runnerPositions, search])

  const selectedRunner = useMemo(() => {
    if (!store.selectedRunnerId) return null
    return store.runnerPositions.find((r) => r.runnerId === store.selectedRunnerId) ?? null
  }, [store.selectedRunnerId, store.runnerPositions])

  const handlePlayPause = useCallback(() => {
    if (store.isPlaying) {
      store.pauseTracking()
    } else {
      store.resumeTracking()
    }
  }, [store.isPlaying])

  const handleSpeedChange = useCallback((speed: number) => {
    store.setPlaybackSpeed(speed)
  }, [])

  const handleSeek = useCallback((seconds: number) => {
    store.seekTo(seconds)
  }, [])

  const handleSelectRunner = useCallback((runnerId: string) => {
    store.selectRunner(store.selectedRunnerId === runnerId ? null : runnerId)
  }, [store.selectedRunnerId])

  // Map runner positions to the format CourseMap expects
  const mapPositions = useMemo(
    () =>
      store.runnerPositions.map((r) => ({
        runnerId: r.runnerId,
        lat: r.coordinates.lat,
        lng: r.coordinates.lng,
        status: r.status === 'at_aid_station' ? 'at_aid' : r.status,
      })),
    [store.runnerPositions],
  )

  // Calculate total race duration (use store or fallback estimate)
  const totalDurationSeconds = 36 * 3600 // ~36 hours for an ultra

  if (raceLoading || store.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <PageHeader title="Live Tracking" backLink={raceId ? `/races/${raceId}` : '/'} backLabel="Back to Race" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton variant="rectangular" height={400} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={180} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton variant="rectangular" height={500} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <PageHeader
        title={race ? `${race.name} - Live` : 'Live Tracking'}
        subtitle={race ? `${race.location} | ${race.distanceMi} mi` : undefined}
        backLink={raceId ? `/races/${raceId}` : '/'}
        backLabel="Back to Race"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN - Map, controls, elevation */}
        <div className="lg:col-span-3 space-y-4">
          {/* Course Map */}
          <CourseMap
            courseGeoJSON={undefined}
            aidStations={courseData?.aidStations?.map(toTypesAidStation)}
            runnerPositions={mapPositions}
            selectedRunnerId={store.selectedRunnerId ?? undefined}
            onRunnerClick={handleSelectRunner}
            height="420px"
          />

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={store.isPlaying}
            playbackSpeed={store.playbackSpeed}
            elapsedSeconds={store.elapsedSeconds}
            totalDurationSeconds={totalDurationSeconds}
            onPlayPause={handlePlayPause}
            onSpeedChange={handleSpeedChange}
            onSeek={handleSeek}
          />

          {/* Elevation Profile */}
          {courseData && (
            <Card padding="sm">
              <ElevationProfile
                elevationData={toElevationPoints(courseData.elevationProfile)}
                aidStations={courseData.aidStations.map(toTypesAidStation)}
                runnerDistanceKm={
                  selectedRunner ? selectedRunner.distanceMi / KM_TO_MI : undefined
                }
                height={180}
                unit="imperial"
              />
            </Card>
          )}

          {/* Selected Runner Detail (mobile: below map, desktop: below elevation) */}
          {selectedRunner && (
            <div className="lg:hidden">
              <SelectedRunnerPanel
                runner={selectedRunner}
                onClose={() => store.selectRunner(null)}
              />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Leaderboard, events, selected runner */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selected Runner Panel (desktop only) */}
          {selectedRunner && (
            <div className="hidden lg:block">
              <SelectedRunnerPanel
                runner={selectedRunner}
                onClose={() => store.selectRunner(null)}
              />
            </div>
          )}

          {/* Leaderboard */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
              </CardHeader>
              <SearchInput
                placeholder="Search runners..."
                value={search}
                onChange={setSearch}
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto px-2 pb-2">
              {sortedRunners.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-8">
                  {search ? 'No runners match your search' : 'No runners yet'}
                </p>
              ) : (
                sortedRunners.map((runner, idx) => (
                  <LeaderboardRow
                    key={runner.runnerId}
                    runner={runner}
                    rank={idx + 1}
                    isSelected={runner.runnerId === store.selectedRunnerId}
                    onClick={() => handleSelectRunner(runner.runnerId)}
                  />
                ))
              )}
            </div>

            <div className="border-t border-border px-4 py-2 text-xs text-text-secondary text-center">
              {store.runnerPositions.length} runners on course
            </div>
          </Card>

          {/* Events Feed */}
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <CardHeader>
                <CardTitle>Events Feed</CardTitle>
              </CardHeader>
            </div>

            <div
              ref={eventsFeedRef}
              className="max-h-[280px] overflow-y-auto px-4 pb-3 space-y-2"
            >
              {store.recentEvents.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-6">
                  No events yet. Start the simulation to see race events.
                </p>
              ) : (
                store.recentEvents.map((event, idx) => (
                  <div
                    key={`${event.timestamp}-${idx}`}
                    className="flex items-start gap-2 text-sm py-1.5 border-b border-border/50 last:border-0"
                  >
                    <span className={`mt-0.5 text-xs ${eventColor(event)}`}>
                      {eventIcon(event.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-text leading-snug">{eventMessage(event)}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatDuration(store.elapsedSeconds)} into race
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LiveTrackingPage
