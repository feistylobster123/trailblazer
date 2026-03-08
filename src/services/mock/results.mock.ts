import type {
  IResultsService,
  RaceResult,
  ResultsSummary,
  Split,
  SegmentAnalysis,
  PaceAnalysis,
  RunnerComparison,
  ResultsFilterParams,
  PaginatedResults,
} from '../interfaces/results.service.ts'
import { getGeneratedResults } from '@/data/runners/generator.ts'
import { races } from '@/data/races.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, Math.random() * 50 + 50))
}

function applyFilters(results: RaceResult[], params: ResultsFilterParams): RaceResult[] {
  let filtered = results

  if (params.gender) {
    filtered = filtered.filter((r) => r.gender === params.gender)
  }
  if (params.ageGroup) {
    filtered = filtered.filter((r) => r.ageGroup === params.ageGroup)
  }
  if (params.status && params.status.length > 0) {
    filtered = filtered.filter((r) => params.status!.includes(r.status))
  }
  if (params.nationality) {
    filtered = filtered.filter((r) => r.nationality === params.nationality)
  }

  // Sort
  const sortBy = params.sortBy ?? 'overall_place'
  const asc = true // default ascending for place/time
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'finish_time') {
      const ta = a.finishTimeSeconds ?? Infinity
      const tb = b.finishTimeSeconds ?? Infinity
      return ta - tb
    }
    if (sortBy === 'performance_index') {
      return (b.performanceIndex ?? 0) - (a.performanceIndex ?? 0) // descending PI
    }
    // overall_place default
    const pa = a.overallPlace ?? Infinity
    const pb = b.overallPlace ?? Infinity
    return pa - pb
  })

  return filtered
}

function medianFinishTime(results: RaceResult[]): number | undefined {
  const finishers = results
    .filter((r) => r.status === 'finished' && r.finishTimeSeconds)
    .map((r) => r.finishTimeSeconds!)
    .sort((a, b) => a - b)

  if (finishers.length === 0) return undefined
  const mid = Math.floor(finishers.length / 2)
  return finishers.length % 2 === 0
    ? Math.round((finishers[mid - 1] + finishers[mid]) / 2)
    : finishers[mid]
}

// ---------------------------------------------------------------------------
// MockResultsService
// ---------------------------------------------------------------------------

export class MockResultsService implements IResultsService {
  async getResults(
    raceId: string,
    _editionId: string,
    params: ResultsFilterParams = {},
  ): Promise<PaginatedResults> {
    await delay()
    const allResults = getGeneratedResults(raceId)
    const filtered = applyFilters(allResults, params)

    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 50
    const start = (page - 1) * pageSize
    const paged = filtered.slice(start, start + pageSize)

    return {
      items: paged,
      total: filtered.length,
      page,
      pageSize,
      hasMore: start + pageSize < filtered.length,
    }
  }

  async getResultsSummary(raceId: string, editionId: string): Promise<ResultsSummary> {
    await delay()
    const results = getGeneratedResults(raceId)
    const race = races.find((r) => r.id === raceId)

    const finishers = results.filter((r) => r.status === 'finished')
    const dnfs = results.filter((r) => r.status === 'dnf')
    const dqs = results.filter((r) => r.status === 'dq')
    const dns = results.filter((r) => r.status === 'dns')
    const starters = finishers.length + dnfs.length

    const maleFinishers = finishers.filter((r) => r.gender === 'M')
    const femaleFinishers = finishers.filter((r) => r.gender === 'F')

    const winnerMale = maleFinishers.length > 0
      ? maleFinishers.reduce((best, r) =>
          (r.finishTimeSeconds ?? Infinity) < (best.finishTimeSeconds ?? Infinity) ? r : best
        )
      : undefined

    const winnerFemale = femaleFinishers.length > 0
      ? femaleFinishers.reduce((best, r) =>
          (r.finishTimeSeconds ?? Infinity) < (best.finishTimeSeconds ?? Infinity) ? r : best
        )
      : undefined

    const median = medianFinishTime(results)

    return {
      raceId,
      editionId,
      raceName: race?.name ?? raceId,
      editionYear: race?.editions[0]?.year ?? 2024,
      totalStarters: starters,
      totalFinishers: finishers.length,
      dnfCount: dnfs.length,
      dqCount: dqs.length,
      dnsCount: dns.length,
      finishRate: starters > 0 ? Math.round((finishers.length / starters) * 1000) / 1000 : 0,
      winnerMale,
      winnerFemale,
      medianFinishTimeSeconds: median,
    }
  }

  async getRunnerResult(raceId: string, _editionId: string, runnerId: string): Promise<RaceResult> {
    await delay()
    const results = getGeneratedResults(raceId)
    const result = results.find((r) => r.runnerId === runnerId)
    if (!result) throw new Error(`Result not found for runner ${runnerId} in race ${raceId}`)
    return result
  }

  async getSplits(raceId: string, _editionId: string, runnerId: string): Promise<Split[]> {
    await delay()
    const results = getGeneratedResults(raceId)
    const result = results.find((r) => r.runnerId === runnerId)
    if (!result) throw new Error(`Result not found for runner ${runnerId} in race ${raceId}`)
    return result.splits
  }

  async getSegmentAnalysis(raceId: string, _editionId: string, runnerId: string): Promise<SegmentAnalysis[]> {
    await delay()
    const results = getGeneratedResults(raceId)
    const result = results.find((r) => r.runnerId === runnerId)
    if (!result) throw new Error(`Result not found for runner ${runnerId} in race ${raceId}`)

    const finishers = results.filter((r) => r.status === 'finished')
    const race = races.find((r) => r.id === raceId)
    const segments: SegmentAnalysis[] = []

    for (let i = 0; i < result.splits.length; i++) {
      const split = result.splits[i]
      const prevSplit = i > 0 ? result.splits[i - 1] : null
      const fromStation = prevSplit?.aidStationName ?? 'Start'
      const toStation = split.aidStationName
      const segDistMi = prevSplit ? split.distanceMi - prevSplit.distanceMi : split.distanceMi
      const runnerLegSeconds = split.legTimeSeconds

      if (segDistMi <= 0) continue

      // Compute field average for this segment
      const fieldLegTimes: number[] = []
      for (const fr of finishers) {
        const fSplit = fr.splits[i]
        if (fSplit && fSplit.legTimeSeconds > 0) {
          fieldLegTimes.push(fSplit.legTimeSeconds)
        }
      }
      const fieldAvg = fieldLegTimes.length > 0
        ? fieldLegTimes.reduce((s, t) => s + t, 0) / fieldLegTimes.length
        : runnerLegSeconds

      // Percentile: how many did this runner beat in this segment
      const sorted = [...fieldLegTimes].sort((a, b) => a - b)
      const rank = sorted.filter((t) => t > runnerLegSeconds).length
      const percentile = fieldLegTimes.length > 0
        ? Math.round((rank / fieldLegTimes.length) * 100)
        : 50

      // Rough elevation estimate per segment
      const totalElevFt = race?.elevationGainFt ?? 18000
      const totalDist = race?.distanceMi ?? 100
      const segElevGainFt = Math.round((segDistMi / totalDist) * totalElevFt)
      const segElevLossFt = Math.round(segElevGainFt * 0.9)

      segments.push({
        segmentId: `${raceId}-seg-${i}`,
        fromAidStation: fromStation,
        toAidStation: toStation,
        distanceMi: Math.round(segDistMi * 100) / 100,
        runnerTimeSeconds: runnerLegSeconds,
        runnerPaceMinPerMi: segDistMi > 0
          ? Math.round((runnerLegSeconds / 60 / segDistMi) * 100) / 100
          : 0,
        fieldAverageTimeSeconds: Math.round(fieldAvg),
        fieldAveragePaceMinPerMi: segDistMi > 0
          ? Math.round((fieldAvg / 60 / segDistMi) * 100) / 100
          : 0,
        percentileRank: percentile,
        elevationGainFt: segElevGainFt,
        elevationLossFt: segElevLossFt,
      })
    }

    return segments
  }

  async getPaceAnalysis(raceId: string, editionId: string, runnerId: string): Promise<PaceAnalysis> {
    await delay()
    const results = getGeneratedResults(raceId)
    const result = results.find((r) => r.runnerId === runnerId)
    if (!result) throw new Error(`Result not found for runner ${runnerId} in race ${raceId}`)

    const race = races.find((r) => r.id === raceId)
    const totalDistMi = race?.distanceMi ?? 100

    const overallPace = result.finishTimeSeconds && totalDistMi > 0
      ? Math.round((result.finishTimeSeconds / 60 / totalDistMi) * 100) / 100
      : 0

    const paceBySegment: Array<{ segmentId: string; paceMinPerMi: number }> = []
    let fastestSeg: { id: string; pace: number } | null = null
    let slowestSeg: { id: string; pace: number } | null = null
    let firstHalfTime = 0
    let firstHalfDist = 0
    let secondHalfTime = 0
    let secondHalfDist = 0
    const halfwayDist = totalDistMi / 2

    for (let i = 0; i < result.splits.length; i++) {
      const split = result.splits[i]
      const prevSplit = i > 0 ? result.splits[i - 1] : null
      const segDist = prevSplit ? split.distanceMi - prevSplit.distanceMi : split.distanceMi
      const segId = `${raceId}-seg-${i}`

      if (segDist <= 0) continue

      const pace = (split.legTimeSeconds / 60) / segDist
      const roundedPace = Math.round(pace * 100) / 100
      paceBySegment.push({ segmentId: segId, paceMinPerMi: roundedPace })

      if (!fastestSeg || pace < fastestSeg.pace) fastestSeg = { id: segId, pace }
      if (!slowestSeg || pace > slowestSeg.pace) slowestSeg = { id: segId, pace }

      // First vs second half
      if (split.distanceMi <= halfwayDist) {
        firstHalfTime += split.legTimeSeconds
        firstHalfDist += segDist
      } else {
        secondHalfTime += split.legTimeSeconds
        secondHalfDist += segDist
      }
    }

    const firstHalfPace = firstHalfDist > 0 ? (firstHalfTime / 60) / firstHalfDist : undefined
    const secondHalfPace = secondHalfDist > 0 ? (secondHalfTime / 60) / secondHalfDist : undefined
    const paceDelta = firstHalfPace && secondHalfPace
      ? Math.round(((secondHalfPace - firstHalfPace) / firstHalfPace) * 10000) / 100
      : undefined

    return {
      runnerId,
      raceId,
      editionId,
      overallPaceMinPerMi: overallPace,
      firstHalfPaceMinPerMi: firstHalfPace ? Math.round(firstHalfPace * 100) / 100 : undefined,
      secondHalfPaceMinPerMi: secondHalfPace ? Math.round(secondHalfPace * 100) / 100 : undefined,
      paceDeltaPercent: paceDelta,
      fastestSegmentId: fastestSeg?.id,
      slowestSegmentId: slowestSeg?.id,
      paceBySegment,
    }
  }

  async compareRunners(raceId: string, editionId: string, runnerIds: string[]): Promise<RunnerComparison> {
    await delay()
    const allResults = getGeneratedResults(raceId)

    const runners: RunnerComparison['runners'] = []

    for (const runnerId of runnerIds) {
      const result = allResults.find((r) => r.runnerId === runnerId)
      if (!result) continue

      const paceAnalysis = await this.getPaceAnalysis(raceId, editionId, runnerId)

      runners.push({
        runnerId,
        runnerName: result.runnerName,
        result,
        splits: result.splits,
        paceAnalysis,
      })
    }

    return {
      runners,
      raceId,
      editionId,
    }
  }
}
