import { useState, useMemo, useCallback, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useResults } from '@/hooks/useResults'
import { useRace } from '@/hooks/useRace'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui'
import { SearchInput, Badge, Select, StatCard, Skeleton } from '@/components/ui'
import { SplitComparisonChart } from '@/components/charts/SplitComparisonChart'
import { PaceChart } from '@/components/charts/PaceChart'
import { formatDuration } from '@/utils/time'
import type { RaceResult } from '@/services/interfaces/results.service'

type SortField = 'overallPlace' | 'finishTimeSeconds' | 'runnerName' | 'gender' | 'ageGroup'
type SortDir = 'asc' | 'desc'
type StatusFilter = 'all' | 'finished' | 'dnf'
type GenderFilter = 'all' | 'M' | 'F'

function statusBadge(status: RaceResult['status']) {
  switch (status) {
    case 'finished':
      return <Badge variant="success" size="sm">Finished</Badge>
    case 'dnf':
      return <Badge variant="danger" size="sm">DNF</Badge>
    case 'dns':
      return <Badge variant="default" size="sm">DNS</Badge>
    case 'dq':
      return <Badge variant="danger" size="sm">DQ</Badge>
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
        <path d="M3 4.5l3-3 3 3M3 7.5l3 3 3-3" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
      {dir === 'asc' ? <path d="M3 7.5l3-3 3 3" /> : <path d="M3 4.5l3 3 3-3" />}
    </svg>
  )
}

// -- Expanded Row Detail --
function ExpandedRowDetail({ result }: { result: RaceResult }) {
  // Build split data for the charts from the result's available info.
  // The RaceResult from the service interface doesn't carry splits inline,
  // so we show what we have and provide a link to a deeper runner profile.

  return (
    <tr>
      <td colSpan={8} className="p-0">
        <div className="bg-bg/50 border-t border-border px-4 py-5 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="space-y-3">
              <h4 className="font-bold text-text text-sm">Runner Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-secondary text-xs">Overall Place</p>
                  <p className="font-semibold text-text">{result.overallPlace ?? '--'}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Gender Place</p>
                  <p className="font-semibold text-text">{result.genderPlace ?? '--'}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Age Group</p>
                  <p className="font-semibold text-text">{result.ageGroup}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">AG Place</p>
                  <p className="font-semibold text-text">{result.ageGroupPlace ?? '--'}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Performance Index</p>
                  <p className="font-semibold text-text">
                    {result.performanceIndex != null ? result.performanceIndex.toFixed(1) : '--'}
                  </p>
                </div>
                {result.status === 'dnf' && result.dnfLocation && (
                  <div>
                    <p className="text-text-secondary text-xs">DNF Location</p>
                    <p className="font-semibold text-danger">{result.dnfLocation}</p>
                  </div>
                )}
                {result.status === 'dnf' && result.dnfReason && (
                  <div className="col-span-2">
                    <p className="text-text-secondary text-xs">DNF Reason</p>
                    <p className="font-semibold text-text">{result.dnfReason}</p>
                  </div>
                )}
              </div>

              <Link
                to={`/runners/${result.runnerId}`}
                className="inline-block text-sm font-semibold text-primary hover:text-primary-light transition-colors mt-2"
              >
                View full runner profile &rarr;
              </Link>
            </div>

            {/* Placeholder for split charts */}
            <div className="space-y-3">
              <h4 className="font-bold text-text text-sm">Race Performance</h4>
              <div className="flex items-center justify-center h-32 bg-surface border border-border rounded-lg text-sm text-text-secondary">
                Split analysis available on runner profile
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

// -- Mobile Card View for a single result --
function ResultCard({
  result,
  isExpanded,
  onToggle,
}: {
  result: RaceResult
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden transition-transform duration-150 active:scale-[0.98]">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
              {result.overallPlace ?? '--'}
            </span>
            <div>
              <p className="font-semibold text-text text-sm">{result.runnerName}</p>
              <p className="text-xs text-text-secondary">
                Bib #{result.bibNumber} | {result.gender} | {result.ageGroup}
              </p>
            </div>
          </div>
          {statusBadge(result.status)}
        </div>
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span className="font-mono">
            {result.finishTimeSeconds != null ? formatDuration(result.finishTimeSeconds) : '--'}
          </span>
          {result.genderPlace != null && <span>Gender #{result.genderPlace}</span>}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border px-4 py-4 bg-bg/50">
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <p className="text-text-secondary text-xs">AG Place</p>
              <p className="font-semibold text-text">{result.ageGroupPlace ?? '--'}</p>
            </div>
            <div>
              <p className="text-text-secondary text-xs">Performance</p>
              <p className="font-semibold text-text">
                {result.performanceIndex != null ? result.performanceIndex.toFixed(1) : '--'}
              </p>
            </div>
            {result.dnfLocation && (
              <div className="col-span-2">
                <p className="text-text-secondary text-xs">DNF at</p>
                <p className="font-semibold text-danger">{result.dnfLocation}</p>
              </div>
            )}
          </div>
          <Link
            to={`/runners/${result.runnerId}`}
            className="text-sm font-semibold text-primary hover:text-primary-light transition-colors"
          >
            View runner profile &rarr;
          </Link>
        </div>
      )}
    </div>
  )
}

// -- Main Page --
export function ResultsPage() {
  const { raceId, year: yearParam } = useParams<{ raceId: string; year: string }>()
  const year = yearParam ? Number(yearParam) : undefined
  const { race, isLoading: raceLoading } = useRace(raceId)
  const { results, summary, isLoading: resultsLoading } = useResults(raceId, year)

  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('overallPlace')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDir('asc')
      }
    },
    [sortField],
  )

  const toggleExpand = useCallback(
    (id: string) => {
      setExpandedId((prev) => (prev === id ? null : id))
    },
    [],
  )

  // Filter and sort
  const filteredResults = useMemo(() => {
    let items = [...results]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (r) =>
          r.runnerName.toLowerCase().includes(q) ||
          r.bibNumber.toLowerCase().includes(q),
      )
    }

    // Gender filter
    if (genderFilter !== 'all') {
      items = items.filter((r) => r.gender.toUpperCase() === genderFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter((r) => r.status === statusFilter)
    }

    // Sort
    items.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'overallPlace':
          cmp = (a.overallPlace ?? 9999) - (b.overallPlace ?? 9999)
          break
        case 'finishTimeSeconds':
          cmp = (a.finishTimeSeconds ?? Infinity) - (b.finishTimeSeconds ?? Infinity)
          break
        case 'runnerName':
          cmp = a.runnerName.localeCompare(b.runnerName)
          break
        case 'gender':
          cmp = a.gender.localeCompare(b.gender)
          break
        case 'ageGroup':
          cmp = a.ageGroup.localeCompare(b.ageGroup)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return items
  }, [results, search, genderFilter, statusFilter, sortField, sortDir])

  const isLoading = raceLoading || resultsLoading

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <PageHeader title="Results" backLink={raceId ? `/races/${raceId}` : '/'} backLabel="Back to Race" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={80} />
          ))}
        </div>
        <Skeleton variant="rectangular" height={400} />
      </div>
    )
  }

  const completionRate = summary
    ? `${(summary.finishRate * 100).toFixed(1)}%`
    : '--'

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <PageHeader
        title={race ? race.name : 'Race Results'}
        subtitle={
          summary
            ? `${summary.editionYear} Edition | ${race?.location ?? ''}`
            : race?.location
        }
        backLink={raceId ? `/races/${raceId}` : '/'}
        backLabel="Back to Race"
      />

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard
            label="Starters"
            value={summary.totalStarters}
            size="sm"
          />
          <StatCard
            label="Finishers"
            value={summary.totalFinishers}
            size="sm"
          />
          <StatCard
            label="DNFs"
            value={summary.dnfCount}
            size="sm"
          />
          <StatCard
            label="Completion"
            value={completionRate}
            size="sm"
          />
          <StatCard
            label="Winning Time"
            value={
              summary.courseRecord?.overall
                ? formatDuration(summary.courseRecord.overall.timeSeconds)
                : summary.winnerMale?.finishTimeSeconds
                  ? formatDuration(summary.winnerMale.finishTimeSeconds)
                  : '--'
            }
            size="sm"
          />
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          placeholder="Search by name or bib..."
          value={search}
          onChange={setSearch}
          className="flex-1"
        />
        <Select
          options={[
            { value: 'all', label: 'All Genders' },
            { value: 'M', label: 'Male' },
            { value: 'F', label: 'Female' },
          ]}
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value as GenderFilter)}
          className="w-full sm:w-36"
        />
        <Select
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'finished', label: 'Finished' },
            { value: 'dnf', label: 'DNF' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-full sm:w-36"
        />
      </div>

      {/* Results Count */}
      <p className="text-sm text-text-secondary mb-3">
        Showing {filteredResults.length} of {results.length} results
      </p>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/70 border-b border-border">
                  {([
                    ['overallPlace', 'Place', 'w-16'],
                    ['', 'Bib', 'w-16'],
                    ['runnerName', 'Name', ''],
                    ['gender', 'Gender', 'w-20'],
                    ['ageGroup', 'Age Group', 'w-24'],
                    ['finishTimeSeconds', 'Time', 'w-28'],
                    ['', 'Status', 'w-24'],
                  ] as [SortField | '', string, string][]).map(([field, label, width]) => (
                    <th
                      key={label}
                      className={`text-left px-4 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider ${width}
                        ${field ? 'cursor-pointer hover:text-text select-none' : ''}`}
                      onClick={field ? () => handleSort(field as SortField) : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {field && <SortIcon active={sortField === field} dir={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-secondary">
                      No results found
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => (
                    <Fragment key={result.id}>
                      <tr
                        onClick={() => toggleExpand(result.id)}
                        className={`border-b border-border/50 cursor-pointer transition-colors
                          ${expandedId === result.id ? 'bg-primary/5' : 'hover:bg-bg/50'}`}
                      >
                        <td className="px-4 py-3 font-bold text-text">
                          {result.overallPlace ?? '--'}
                        </td>
                        <td className="px-4 py-3 font-mono text-text-secondary text-xs">
                          #{result.bibNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold text-text">
                          {result.runnerName}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {result.gender}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {result.ageGroup}
                        </td>
                        <td className="px-4 py-3 font-mono text-text">
                          {result.finishTimeSeconds != null
                            ? formatDuration(result.finishTimeSeconds)
                            : '--'}
                        </td>
                        <td className="px-4 py-3">
                          {statusBadge(result.status)}
                        </td>
                      </tr>
                      {expandedId === result.id && (
                        <ExpandedRowDetail result={result} />
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredResults.length === 0 ? (
          <p className="text-center text-text-secondary py-12">No results found</p>
        ) : (
          filteredResults.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              isExpanded={expandedId === result.id}
              onToggle={() => toggleExpand(result.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ResultsPage
