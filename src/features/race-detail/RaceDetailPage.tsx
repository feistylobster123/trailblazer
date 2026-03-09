import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useRace } from '@/hooks/useRace'
import { useCountdown } from '@/hooks/useCountdown'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { CourseMap } from '@/components/maps/CourseMap'
import { ElevationProfile } from '@/components/maps/ElevationProfile'
import type { Race, RaceEdition, CourseData } from '@/services/interfaces/race.service'
import type { ElevationPoint, AidStation as MapAidStation } from '@/types/race'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MI_TO_KM = 1.60934
const FT_TO_M = 0.3048

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: string | undefined) {
  switch (status) {
    case 'registration_open':
      return <Badge variant="success" dot>Registration Open</Badge>
    case 'registration_closed':
      return <Badge variant="warning" dot>Registration Closed</Badge>
    case 'in_progress':
      return <Badge variant="accent" dot>In Progress</Badge>
    case 'completed':
      return <Badge variant="default">Completed</Badge>
    case 'cancelled':
      return <Badge variant="danger" dot>Cancelled</Badge>
    default:
      return <Badge variant="info" dot>Upcoming</Badge>
  }
}

function formatTime(totalHours: number): string {
  const h = Math.floor(totalHours)
  const m = Math.round((totalHours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatCurrency(amount: number, currency?: string): string {
  const sym = currency === 'EUR' ? '\u20AC' : currency === 'GBP' ? '\u00A3' : '$'
  return `${sym}${amount}`
}

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':')
}

/** Convert service elevation profile (mi/ft) to the format the ElevationProfile component expects */
function toElevationPoints(
  profile: CourseData['elevationProfile'],
): ElevationPoint[] {
  return profile.map((p, i, arr) => {
    const distanceKm = p.distanceMi * MI_TO_KM
    const elevationM = p.elevationFt * FT_TO_M
    let grade = 0
    if (i > 0) {
      const dDist = (p.distanceMi - arr[i - 1].distanceMi) * MI_TO_KM * 1000
      const dElev = (p.elevationFt - arr[i - 1].elevationFt) * FT_TO_M
      grade = dDist > 0 ? (dElev / dDist) * 100 : 0
    }
    return { distanceKm, elevationM, grade }
  })
}

/** Convert service aid stations to the format the CourseMap component expects */
function toMapAidStations(
  stations: CourseData['aidStations'],
): MapAidStation[] {
  return stations.map((s) => ({
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
  }))
}

// ---------------------------------------------------------------------------
// Skeleton loading
// ---------------------------------------------------------------------------

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`bg-border/40 rounded-lg animate-pulse ${className}`} />
}

function RaceDetailSkeleton() {
  return (
    <div className="pb-24 md:pb-8">
      {/* Hero skeleton - matches hero banner structure so container transforms work during loading */}
      <div
        className="relative bg-gradient-to-br from-primary via-primary-light to-emerald-600 overflow-hidden"
        style={{ viewTransitionName: 'race-hero', contain: 'layout' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-8">
          <SkeletonBlock className="h-4 w-20 mb-4 !bg-white/20" />
          <div style={{ viewTransitionName: 'race-title' }}>
            <SkeletonBlock className="h-9 w-2/3 mb-2 !bg-white/20" />
          </div>
          <SkeletonBlock className="h-4 w-1/3 !bg-white/20" />
          <div className="flex gap-3 mt-4">
            <SkeletonBlock className="h-6 w-24 !bg-white/20 !rounded-full" />
            <SkeletonBlock className="h-6 w-16 !bg-white/20 !rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24" />
          ))}
        </div>
        <SkeletonBlock className="h-10 w-full mb-6" />
        <SkeletonBlock className="h-[400px] w-full mb-4" />
        <SkeletonBlock className="h-[200px] w-full" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Countdown display
// ---------------------------------------------------------------------------

function RegistrationCountdown({ closeDate }: { closeDate: string }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(closeDate)

  if (isExpired) return null

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-white/70">Registration closes in</span>
      <div className="flex gap-1.5 flex-wrap">
        {days > 0 && (
          <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded">
            {days}d
          </span>
        )}
        <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded">
          {hours}h
        </span>
        <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded">
          {minutes}m
        </span>
        <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded">
          {seconds}s
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Aid Station Card
// ---------------------------------------------------------------------------

function AidStationCard({ station }: { station: CourseData['aidStations'][number] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card
      variant="interactive"
      padding="sm"
      className="cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-text truncate">{station.name}</p>
          <p className="text-xs text-text-secondary">
            {station.distanceMi.toFixed(1)} mi / {(station.distanceMi * MI_TO_KM).toFixed(1)} km
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {station.crewAccessible && <Badge variant="success" size="sm">Crew</Badge>}
          {station.dropBagsAllowed && <Badge variant="info" size="sm">Drop Bags</Badge>}
          {station.cutoffTime && <Badge variant="warning" size="sm">Cutoff</Badge>}
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
          {station.coordinates.elevationFt != null && (
            <p className="text-text-secondary">
              Elevation: {station.coordinates.elevationFt.toLocaleString()} ft
              ({Math.round(station.coordinates.elevationFt * FT_TO_M).toLocaleString()} m)
            </p>
          )}
          {station.cutoffTime && (
            <p className="text-text-secondary">
              Cutoff: {station.cutoffTime}
            </p>
          )}
          {station.services.length > 0 && (
            <div>
              <p className="text-text-secondary font-medium mb-1">Supplies:</p>
              <div className="flex flex-wrap gap-1">
                {station.services.map((s) => (
                  <Badge key={s} variant="default" size="sm">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Tab: Course
// ---------------------------------------------------------------------------

function CourseTab({
  race,
  courseData,
}: {
  race: Race
  courseData: CourseData | null
}) {
  const elevationPoints = useMemo(
    () => (courseData ? toElevationPoints(courseData.elevationProfile) : []),
    [courseData],
  )
  const mapAidStations = useMemo(
    () => (courseData ? toMapAidStations(courseData.aidStations) : []),
    [courseData],
  )

  return (
    <div className="space-y-6 py-6">
      {/* Course Map */}
      <div>
        <h3 className="text-lg font-bold text-text mb-3">Course Map</h3>
        <CourseMap
          aidStations={mapAidStations}
          height="400px"
        />
      </div>

      {/* Elevation Profile */}
      {elevationPoints.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Elevation Profile</h3>
          <Card padding="sm">
            <ElevationProfile elevationData={elevationPoints} height={220} />
          </Card>
        </div>
      )}

      {/* Course Stats */}
      {courseData && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Course Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Highest Point"
              value={`${courseData.highPointFt.toLocaleString()} ft`}
              size="sm"
            />
            <StatCard
              label="Lowest Point"
              value={`${courseData.lowPointFt.toLocaleString()} ft`}
              size="sm"
            />
            <StatCard
              label="Total Gain"
              value={`${courseData.totalElevationGainFt.toLocaleString()} ft`}
              size="sm"
            />
            <StatCard
              label="Total Loss"
              value={`${courseData.totalElevationLossFt.toLocaleString()} ft`}
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Aid Stations */}
      {courseData && courseData.aidStations.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">
            Aid Stations ({courseData.aidStations.length})
          </h3>
          <div className="space-y-2">
            {courseData.aidStations.map((station) => (
              <AidStationCard key={station.id} station={station} />
            ))}
          </div>
        </div>
      )}

      {courseData && courseData.aidStations.length === 0 && (
        <Card padding="md">
          <p className="text-text-secondary text-sm text-center">
            Aid station details will be published closer to race day.
          </p>
        </Card>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Info
// ---------------------------------------------------------------------------

function InfoTab({ race }: { race: Race }) {
  const edition = race.currentEdition ?? race.editions[0]

  return (
    <div className="space-y-8 py-6">
      {/* Description */}
      <div>
        <h3 className="text-lg font-bold text-text mb-3">About the Race</h3>
        <Card padding="md">
          <p className="text-text leading-relaxed whitespace-pre-line">
            {race.description}
          </p>
        </Card>
      </div>

      {/* Requirements */}
      {race.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {race.tags.map((tag) => (
              <Badge key={tag} variant="default" size="md">{tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Registration Details */}
      {edition && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Registration Details</h3>
          <Card padding="md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {edition.registrationOpenDate && (
                <div>
                  <p className="text-text-secondary">Registration Opens</p>
                  <p className="font-semibold text-text">{formatDate(edition.registrationOpenDate)}</p>
                </div>
              )}
              {edition.registrationCloseDate && (
                <div>
                  <p className="text-text-secondary">Registration Closes</p>
                  <p className="font-semibold text-text">{formatDate(edition.registrationCloseDate)}</p>
                </div>
              )}
              <div>
                <p className="text-text-secondary">Entry Fee</p>
                <p className="font-semibold text-text">{formatCurrency(edition.entryFee)}</p>
              </div>
              <div>
                <p className="text-text-secondary">Max Participants</p>
                <p className="font-semibold text-text">{edition.maxParticipants}</p>
              </div>
              <div>
                <p className="text-text-secondary">Currently Registered</p>
                <p className="font-semibold text-text">{edition.registeredCount}</p>
              </div>
              {edition.waitlistCount > 0 && (
                <div>
                  <p className="text-text-secondary">Waitlisted</p>
                  <p className="font-semibold text-text">{edition.waitlistCount}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Past Editions */}
      {race.editions.length > 1 && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Past Editions</h3>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Starters</th>
                    <th className="px-4 py-3 font-medium">Max Spots</th>
                    <th className="px-4 py-3 font-medium">Entry Fee</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {race.editions
                    .filter((e) => e.status === 'completed')
                    .sort((a, b) => b.year - a.year)
                    .map((ed) => (
                      <tr key={ed.id} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 font-semibold text-text">{ed.year}</td>
                        <td className="px-4 py-3 text-text">{ed.registeredCount}</td>
                        <td className="px-4 py-3 text-text">{ed.maxParticipants}</td>
                        <td className="px-4 py-3 text-text">{formatCurrency(ed.entryFee)}</td>
                        <td className="px-4 py-3">{statusBadge(ed.status)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Results
// ---------------------------------------------------------------------------

function ResultsTab({ race }: { race: Race }) {
  const completedEditions = race.editions
    .filter((e) => e.status === 'completed')
    .sort((a, b) => b.year - a.year)

  const latestEdition = completedEditions[0]

  if (!latestEdition) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">No race results available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6">
      {/* Link to full results */}
      <Card variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{latestEdition.year} Results</CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              {latestEdition.registeredCount} participants
            </p>
          </div>
          <Link to={`/races/${race.id}/results/${latestEdition.year}`} viewTransition>
            <Button variant="primary" size="md">
              View Full Results
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick stats from latest edition */}
      <div>
        <h3 className="text-lg font-bold text-text mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            label="Starters"
            value={latestEdition.registeredCount}
            size="sm"
          />
          <StatCard
            label="Max Participants"
            value={latestEdition.maxParticipants}
            size="sm"
          />
          <StatCard
            label="Entry Fee"
            value={formatCurrency(latestEdition.entryFee)}
            size="sm"
          />
        </div>
      </div>

      {/* Previous editions links */}
      {completedEditions.length > 1 && (
        <div>
          <h3 className="text-lg font-bold text-text mb-3">Previous Years</h3>
          <div className="flex flex-wrap gap-2">
            {completedEditions.slice(1).map((ed) => (
              <Link key={ed.id} to={`/races/${race.id}/results/${ed.year}`} viewTransition>
                <Button variant="secondary" size="sm">{ed.year}</Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Live
// ---------------------------------------------------------------------------

function LiveTab({ race }: { race: Race }) {
  return (
    <div className="space-y-6 py-6">
      <Card variant="elevated" padding="lg">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-danger" />
            </span>
            <span className="font-bold text-text text-lg">Race is Live</span>
          </div>
          <p className="text-text-secondary">
            Follow runners in real-time with GPS tracking, live splits, and interactive course map.
          </p>
          <Link to={`/races/${race.id}/live`} viewTransition>
            <Button variant="accent" size="lg">
              Open Live Tracking
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export function RaceDetailPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const { race, courseData, isLoading, error } = useRace(raceId)
  const [activeTab, setActiveTab] = useState('course')

  const edition: RaceEdition | undefined = race?.currentEdition ?? race?.editions[0]
  const status = edition?.status

  const tabs = useMemo(() => {
    const base = [
      { id: 'course', label: 'Course' },
      { id: 'info', label: 'Info' },
      { id: 'results', label: 'Results' },
    ]
    if (status === 'in_progress') {
      base.push({ id: 'live', label: 'Live' })
    }
    return base
  }, [status])

  // Loading state: show skeleton when we have no data yet (first mount or fetch in progress)
  if (!race && !error) {
    return <RaceDetailSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-text mb-2">Something went wrong</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <Link to="/">
          <Button variant="secondary">Back to Races</Button>
        </Link>
      </div>
    )
  }

  // No race found
  if (!race) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-text mb-2">Race not found</h2>
        <p className="text-text-secondary mb-6">
          The race you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/">
          <Button variant="secondary">Back to Races</Button>
        </Link>
      </div>
    )
  }

  const distanceKm = (race.distanceMi * MI_TO_KM).toFixed(1)
  const elevGainM = Math.round(race.elevationGainFt * FT_TO_M)
  const spotsRemaining = edition ? edition.maxParticipants - edition.registeredCount : 0

  return (
    <div className="pb-24 md:pb-8">
      {/* Hero banner - container transform destination */}
      <div
        className="relative bg-gradient-to-br from-primary via-primary-light to-emerald-600 overflow-hidden"
        style={{ viewTransitionName: 'race-hero', contain: 'layout' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-6 pb-8">
          <Link
            to="/"
            viewTransition
            onClick={() => {
              document.documentElement.dataset.navParallax = 'back'
              setTimeout(() => { delete document.documentElement.dataset.navParallax }, 500)
            }}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            All Races
          </Link>
          <h1
            className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight"
            style={{ viewTransitionName: 'race-title' }}
          >
            {race.name}
          </h1>
          <p className="text-white/80 mt-1.5 text-sm md:text-base">
            {race.location}, {race.country}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {statusBadge(status)}
            <Badge variant="accent">{race.distance.toUpperCase()}</Badge>
            {edition && (
              <span className="text-white/70 text-sm">{formatDate(edition.startDate)}</span>
            )}
          </div>
          {race.tagline && (
            <p className="text-white/70 italic text-sm mt-3 max-w-2xl">{race.tagline}</p>
          )}
          {status === 'registration_open' && edition?.registrationCloseDate && (
            <div className="mt-3">
              <RegistrationCountdown closeDate={edition.registrationCloseDate} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-8">
        <StatCard
          label="Distance"
          value={`${race.distanceMi} mi`}
          change={`${distanceKm} km`}
          size="sm"
        />
        <StatCard
          label="Elevation Gain"
          value={`${race.elevationGainFt.toLocaleString()} ft`}
          change={`${elevGainM.toLocaleString()} m`}
          size="sm"
        />
        <StatCard
          label="Difficulty"
          value={race.difficulty.charAt(0).toUpperCase() + race.difficulty.slice(1)}
          size="sm"
        />
        <StatCard
          label="Distance Class"
          value={race.distance.toUpperCase()}
          size="sm"
        />
        {edition && (
          <StatCard
            label="Entry Fee"
            value={formatCurrency(edition.entryFee)}
            size="sm"
          />
        )}
        {edition && (
          <StatCard
            label="Spots"
            value={`${edition.registeredCount}/${edition.maxParticipants}`}
            change={spotsRemaining > 0 ? `${spotsRemaining} remaining` : 'Full'}
            changeType={spotsRemaining > 0 ? 'positive' : 'negative'}
            size="sm"
          />
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <TabPanel tabId="course" activeTab={activeTab}>
        <CourseTab race={race} courseData={courseData} />
      </TabPanel>

      <TabPanel tabId="info" activeTab={activeTab}>
        <InfoTab race={race} />
      </TabPanel>

      <TabPanel tabId="results" activeTab={activeTab}>
        <ResultsTab race={race} />
      </TabPanel>

      <TabPanel tabId="live" activeTab={activeTab}>
        <LiveTab race={race} />
      </TabPanel>

      {/* Registration CTA - sticky on mobile */}
      {status === 'registration_open' && spotsRemaining > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-surface border-t border-border p-4 md:static md:border-t-0 md:p-0 md:mt-8 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:block">
              <p className="text-sm text-text-secondary">
                {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
            <Link to={`/races/${raceId}/register`} viewTransition className="w-full md:w-auto">
              <Button variant="accent" size="lg" className="w-full md:w-auto">
                Register Now
              </Button>
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default RaceDetailPage
