import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRaceList } from '@/hooks/useRace'
import { useCountdown } from '@/hooks/useCountdown'
import {
  Badge,
  Button,
  Card,
  SearchInput,
  Select,
  Skeleton,
  SkeletonCard,
  StatRow,
} from '@/components/ui'
import type { RaceSummary, RaceDistance, RaceStatus } from '@/services/interfaces/race.service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const distanceLabel: Record<RaceDistance, string> = {
  '50k': '50K',
  '50mi': '50 Mi',
  '100k': '100K',
  '100mi': '100 Mi',
  other: 'Other',
}

const statusConfig: Record<
  RaceStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'accent' }
> = {
  registration_open: { label: 'Registration Open', variant: 'success' },
  upcoming: { label: 'Upcoming', variant: 'info' },
  registration_closed: { label: 'Reg. Closed', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'accent' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
}

const difficultyVariant: Record<string, 'warning' | 'danger' | 'default'> = {
  moderate: 'default',
  hard: 'warning',
  extreme: 'danger',
}

function gradientForIndex(index: number): string {
  const gradients = [
    'from-primary to-primary-light',
    'from-accent to-accent-light',
    'from-emerald-700 to-teal-500',
    'from-amber-700 to-yellow-500',
    'from-rose-700 to-pink-400',
    'from-violet-700 to-purple-400',
  ]
  return gradients[index % gradients.length]
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RaceCountdown({ date }: { date: string }) {
  const { days, hours, minutes, isExpired } = useCountdown(date)
  if (isExpired) return null
  return (
    <span className="text-xs text-text-secondary font-medium tabular-nums">
      {days > 0 ? `${days}d ` : ''}
      {hours}h {minutes}m
    </span>
  )
}

function FeaturedRaceCard({ race, index }: { race: RaceSummary; index: number }) {
  const cfg = statusConfig[race.status] ?? statusConfig.upcoming
  return (
    <Link to={`/races/${race.slug}`} className="block group">
      <Card variant="interactive" padding="none" className="overflow-hidden h-full flex flex-col">
        {/* Image / gradient header */}
        <div
          className={`relative h-44 bg-gradient-to-br ${gradientForIndex(index)} flex items-end`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 px-5 pb-4 w-full">
            <h3 className="text-white text-lg font-bold leading-snug drop-shadow-sm">
              {race.name}
            </h3>
            <p className="text-white/80 text-sm mt-0.5">{race.location}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="accent">{distanceLabel[race.distance] ?? race.distance}</Badge>
            <Badge variant={difficultyVariant[race.difficulty] ?? 'default'}>
              {race.difficulty}
            </Badge>
            <Badge variant={cfg.variant} dot>
              {cfg.label}
            </Badge>
          </div>

          {/* Date + distance */}
          <div className="text-sm text-text-secondary mb-1">
            {race.nextEditionDate
              ? new Date(race.nextEditionDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Date TBD'}
            {' \u00B7 '}
            {race.distanceMi} mi
          </div>

          {/* Countdown */}
          {race.nextEditionDate &&
            (race.status === 'upcoming' || race.status === 'registration_open') && (
              <div className="mt-auto pt-3 flex items-center justify-between">
                <RaceCountdown date={race.nextEditionDate} />
                <Button size="sm" variant="primary" className="pointer-events-none">
                  View Race
                </Button>
              </div>
            )}
          {race.status !== 'upcoming' && race.status !== 'registration_open' && (
            <div className="mt-auto pt-3 flex justify-end">
              <Button size="sm" variant="secondary" className="pointer-events-none">
                View Race
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

function RaceRow({ race, index }: { race: RaceSummary; index: number }) {
  const cfg = statusConfig[race.status] ?? statusConfig.upcoming
  return (
    <Link to={`/races/${race.slug}`} className="block group">
      <Card variant="interactive" padding="none" className="overflow-hidden flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div
          className={`sm:w-40 h-28 sm:h-auto shrink-0 bg-gradient-to-br ${gradientForIndex(index)} flex items-center justify-center`}
        >
          <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
            {distanceLabel[race.distance] ?? race.distance}
          </span>
        </div>
        {/* Info */}
        <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-text truncate group-hover:text-primary transition-colors">
              {race.name}
            </h4>
            <p className="text-sm text-text-secondary truncate">{race.location}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {race.nextEditionDate
                ? new Date(race.nextEditionDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Date TBD'}
              {' \u00B7 '}
              {race.distanceMi} mi
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Badge variant={difficultyVariant[race.difficulty] ?? 'default'} size="sm">
              {race.difficulty}
            </Badge>
            <Badge variant={cfg.variant} dot size="sm">
              {cfg.label}
            </Badge>
            {race.nextEditionDate &&
              (race.status === 'upcoming' || race.status === 'registration_open') && (
                <RaceCountdown date={race.nextEditionDate} />
              )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

function LiveBanner({ race }: { race: RaceSummary }) {
  return (
    <section className="max-w-7xl mx-auto px-4 mb-8">
      <Link to={`/races/${race.slug}/live`}>
        <div className="rounded-xl bg-gradient-to-r from-danger/10 to-accent/10 border border-danger/30 p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-danger" />
            </span>
            <span className="text-danger font-bold text-sm uppercase tracking-wider">
              Live Now
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text truncate">{race.name}</p>
            <p className="text-sm text-text-secondary">{race.location}</p>
          </div>
          <Button variant="accent" size="sm">
            Watch Live
          </Button>
        </div>
      </Link>
    </section>
  )
}

// Quick-filter chips for the hero
const QUICK_FILTERS: { label: string; distance?: RaceDistance; status?: RaceStatus }[] = [
  { label: '100 Milers', distance: '100mi' },
  { label: '50K', distance: '50k' },
  { label: '50 Milers', distance: '50mi' },
  { label: '100K', distance: '100k' },
  { label: 'Reg. Open', status: 'registration_open' },
]

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function LandingPage() {
  const { races, featuredRaces, isLoading } = useRaceList()

  // Hero search and quick-filter state
  const [heroSearch, setHeroSearch] = useState('')
  const [activeChip, setActiveChip] = useState<string | null>(null)

  // Discovery section filters + sort
  const [discoverySearch, setDiscoverySearch] = useState('')
  const [distanceFilter, setDistanceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('date')

  // Apply hero quick-filter chip
  const handleChipClick = (chip: (typeof QUICK_FILTERS)[number]) => {
    if (activeChip === chip.label) {
      setActiveChip(null)
      return
    }
    setActiveChip(chip.label)
  }

  // Compute live races
  const liveRaces = useMemo(
    () => races.filter((r) => r.status === 'in_progress'),
    [races],
  )

  // Derive filtered + sorted race list for discovery section
  const discoveryRaces = useMemo(() => {
    let list = [...races]

    // Text search
    const q = discoverySearch.toLowerCase().trim()
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q),
      )
    }

    // Distance filter
    if (distanceFilter) {
      list = list.filter((r) => r.distance === distanceFilter)
    }

    // Status filter
    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter)
    }

    // Sort
    if (sortBy === 'date') {
      list.sort((a, b) => {
        const da = a.nextEditionDate ? new Date(a.nextEditionDate).getTime() : Infinity
        const db = b.nextEditionDate ? new Date(b.nextEditionDate).getTime() : Infinity
        return da - db
      })
    } else if (sortBy === 'distance') {
      list.sort((a, b) => a.distanceMi - b.distanceMi)
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [races, discoverySearch, distanceFilter, statusFilter, sortBy])

  // Hero-filtered featured list (by chip or hero search)
  const heroFilteredFeatured = useMemo(() => {
    let list = featuredRaces.length > 0 ? featuredRaces : races.slice(0, 4)
    const chip = QUICK_FILTERS.find((c) => c.label === activeChip)
    if (chip) {
      const filtered = races.filter((r) => {
        if (chip.distance && r.distance !== chip.distance) return false
        if (chip.status && r.status !== chip.status) return false
        return true
      })
      list = filtered.slice(0, 4)
    }
    if (heroSearch.trim()) {
      const q = heroSearch.toLowerCase()
      list = races
        .filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q),
        )
        .slice(0, 4)
    }
    return list
  }, [featuredRaces, races, activeChip, heroSearch])

  // Aggregate stats
  const totalRaces = races.length
  const uniqueLocations = useMemo(
    () => new Set(races.map((r) => r.location.split(',').pop()?.trim() ?? r.location)).size,
    [races],
  )

  return (
    <div className="min-h-screen bg-bg">
      {/* ---------------------------------------------------------------- */}
      {/* HERO SECTION                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-emerald-600">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Find Your Next Ultra
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/80 max-w-xl mx-auto">
              Discover, track, and register for the world's most iconic endurance races, all in
              one place.
            </p>

            {/* Search */}
            <div className="mt-8 max-w-xl mx-auto">
              <SearchInput
                value={heroSearch}
                onChange={setHeroSearch}
                placeholder="Search races by name or location..."
                className="[&_input]:bg-white/95 [&_input]:border-white/20 [&_input]:py-3.5 [&_input]:text-base [&_input]:shadow-lg"
              />
            </div>

            {/* Quick filter chips */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {QUICK_FILTERS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleChipClick(chip)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer
                    ${
                      activeChip === chip.label
                        ? 'bg-white text-primary shadow-md'
                        : 'bg-white/15 text-white/90 hover:bg-white/25'
                    }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-10">
              {isLoading ? (
                <div className="flex justify-center gap-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} width={80} className="h-12 !bg-white/10 rounded-lg" />
                  ))}
                </div>
              ) : (
                <StatRow
                  className="justify-center [&_p]:text-white [&_p]:text-white/70"
                  stats={[
                    { label: 'Races', value: totalRaces },
                    { label: 'Distances', value: '50K - 100mi+' },
                    { label: 'Regions', value: uniqueLocations },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* LIVE NOW BANNER                                                   */}
      {/* ---------------------------------------------------------------- */}
      {liveRaces.length > 0 && (
        <div className="mt-8">
          {liveRaces.map((r) => (
            <LiveBanner key={r.id} race={r} />
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* FEATURED RACES                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-text">Featured Races</h2>
            <p className="text-text-secondary mt-1">
              Hand-picked iconic ultras from around the world
            </p>
          </div>
          <Link
            to="/"
            onClick={() => {
              document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="hidden md:inline-flex text-sm font-semibold text-primary hover:text-primary-light transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : heroFilteredFeatured.length === 0 ? (
          <p className="text-text-secondary text-center py-12">
            No races match your current filters. Try clearing them above.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {heroFilteredFeatured.map((race, i) => (
              <FeaturedRaceCard key={race.id} race={race} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* RACE DISCOVERY                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section id="discovery" className="bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-text mb-8">All Races</h2>

          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <SearchInput
              value={discoverySearch}
              onChange={setDiscoverySearch}
              placeholder="Search races..."
              className="sm:w-64"
            />
            <Select
              options={[
                { value: '50k', label: '50K' },
                { value: '50mi', label: '50 Miles' },
                { value: '100k', label: '100K' },
                { value: '100mi', label: '100 Miles' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Distance"
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
              className="sm:w-40"
            />
            <Select
              options={[
                { value: 'registration_open', label: 'Reg. Open' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'registration_closed', label: 'Reg. Closed' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
              ]}
              placeholder="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-40"
            />
            <Select
              options={[
                { value: 'date', label: 'Date' },
                { value: 'distance', label: 'Distance' },
                { value: 'name', label: 'Name' },
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sm:w-36"
            />
            {(distanceFilter || statusFilter || discoverySearch) && (
              <button
                onClick={() => {
                  setDistanceFilter('')
                  setStatusFilter('')
                  setDiscoverySearch('')
                }}
                className="text-sm text-text-secondary hover:text-text transition-colors cursor-pointer self-center"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Race list */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={96} />
              ))}
            </div>
          ) : discoveryRaces.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary text-lg">No races found</p>
              <p className="text-text-secondary text-sm mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {discoveryRaces.map((race, i) => (
                <RaceRow key={race.id} race={race} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FOOTER CTA                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-gradient-to-br from-primary to-primary-light">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Ready to Push Your Limits?
          </h2>
          <p className="mt-3 text-white/80 text-lg max-w-md mx-auto">
            Create an account to track races, manage registrations, and connect with the
            endurance community.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                Sign Up Free
              </Button>
            </Link>
            <Link
              to="/"
              onClick={() => {
                document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Button
                size="lg"
                variant="ghost"
                className="text-white/90 hover:text-white hover:bg-white/10"
              >
                Browse Races
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
