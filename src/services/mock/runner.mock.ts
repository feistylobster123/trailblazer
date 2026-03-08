import type {
  IRunnerService,
  Runner,
  RunnerStats,
  RaceHistoryEntry,
  PersonalRecord,
  PerformanceIndexPoint,
  RunnerSearchParams,
  PaginatedRunners,
} from '../interfaces/runner.service.ts'
import { getGeneratedRunners, getGeneratedResults, getRunnerRaceHistory, getInternalRunner } from '@/data/runners/generator.ts'
import { races } from '@/data/races.ts'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, Math.random() * 50 + 50))
}

function kmToMi(km: number): number {
  return km / 1.60934
}

function ftToM(ft: number): number {
  return ft * 0.3048
}

// ---------------------------------------------------------------------------
// MockRunnerService
// ---------------------------------------------------------------------------

export class MockRunnerService implements IRunnerService {
  async getRunner(runnerId: string): Promise<Runner> {
    await delay()
    const runners = getGeneratedRunners()
    const runner = runners.find((r) => r.id === runnerId)
    if (!runner) throw new Error(`Runner not found: ${runnerId}`)
    return runner
  }

  async getRunnerStats(runnerId: string): Promise<RunnerStats> {
    await delay()
    const runner = getGeneratedRunners().find((r) => r.id === runnerId)
    if (!runner) throw new Error(`Runner not found: ${runnerId}`)

    const history = getRunnerRaceHistory(runnerId)

    let totalRaces = history.length
    let finishes = 0
    let dnfs = 0
    let dqs = 0
    let totalDistanceMi = 0
    let totalElevationGainFt = 0
    let totalMovingTimeSeconds = 0
    let fastest100mi: number | undefined
    let fastest50mi: number | undefined
    let fastest100k: number | undefined
    let fastest50k: number | undefined

    for (const entry of history) {
      const race = races.find((r) => r.id === entry.raceId)
      if (!race) continue

      if (entry.result.status === 'finished') {
        finishes++
        totalDistanceMi += race.distanceMi
        totalElevationGainFt += race.elevationGainFt
        const ft = entry.result.finishTimeSeconds ?? 0
        totalMovingTimeSeconds += ft

        // Check distance categories for PRs
        if (race.distanceMi >= 99 && race.distanceMi <= 110) {
          if (!fastest100mi || ft < fastest100mi) fastest100mi = ft
        }
        if (race.distanceMi >= 49 && race.distanceMi < 55) {
          if (!fastest50mi || ft < fastest50mi) fastest50mi = ft
        }
        // 100k ~62mi
        if (race.distanceMi >= 60 && race.distanceMi < 70) {
          if (!fastest100k || ft < fastest100k) fastest100k = ft
        }
        // 50k ~31mi
        if (race.distanceMi >= 30 && race.distanceMi < 35) {
          if (!fastest50k || ft < fastest50k) fastest50k = ft
        }
      } else if (entry.result.status === 'dnf') {
        dnfs++
      } else if (entry.result.status === 'dq') {
        dqs++
      }
    }

    const avgPace = totalMovingTimeSeconds > 0 && totalDistanceMi > 0
      ? (totalMovingTimeSeconds / 60) / totalDistanceMi
      : 0

    return {
      runnerId,
      totalRaces,
      finishes,
      dnfs,
      dqs,
      totalDistanceMi: Math.round(totalDistanceMi),
      totalElevationGainFt: Math.round(totalElevationGainFt),
      totalMovingTimeSeconds: Math.round(totalMovingTimeSeconds),
      averagePaceMinPerMi: Math.round(avgPace * 100) / 100,
      performanceIndex: runner.performanceIndex,
      finishRate: totalRaces > 0 ? Math.round((finishes / totalRaces) * 1000) / 1000 : 0,
      fastestHundredMileFinishSeconds: fastest100mi,
      fastestFiftyMileFinishSeconds: fastest50mi,
      fastestHundredKFinishSeconds: fastest100k,
      fastestFiftyKFinishSeconds: fastest50k,
    }
  }

  async getRaceHistory(
    runnerId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ items: RaceHistoryEntry[]; total: number; hasMore: boolean }> {
    await delay()
    const runner = getGeneratedRunners().find((r) => r.id === runnerId)
    if (!runner) throw new Error(`Runner not found: ${runnerId}`)

    const history = getRunnerRaceHistory(runnerId)
    const entries: RaceHistoryEntry[] = history.map((h) => {
      const race = races.find((r) => r.id === h.raceId)
      const edition = race?.editions[0]
      return {
        raceId: h.raceId,
        raceName: h.raceName,
        raceSlug: race?.slug ?? h.raceId,
        editionId: edition?.id ?? `${h.raceId}-2024`,
        editionYear: edition?.year ?? 2024,
        distanceMi: race?.distanceMi ?? 100,
        startDate: edition?.startDate ?? '2024-06-01T00:00:00Z',
        status: h.result.status === 'finished' ? 'finished' : h.result.status === 'dnf' ? 'dnf' : 'dns',
        finishTimeSeconds: h.result.finishTimeSeconds,
        overallPlace: h.result.overallPlace,
        genderPlace: h.result.genderPlace,
        ageGroupPlace: h.result.ageGroupPlace,
        performanceIndexEarned: h.result.performanceIndex,
      }
    })

    const start = (page - 1) * pageSize
    const paged = entries.slice(start, start + pageSize)
    return {
      items: paged,
      total: entries.length,
      hasMore: start + pageSize < entries.length,
    }
  }

  async getPersonalRecords(runnerId: string): Promise<PersonalRecord[]> {
    await delay()
    const runner = getGeneratedRunners().find((r) => r.id === runnerId)
    if (!runner) throw new Error(`Runner not found: ${runnerId}`)

    const history = getRunnerRaceHistory(runnerId)
    const bestByCategory = new Map<string, PersonalRecord>()

    for (const h of history) {
      if (h.result.status !== 'finished' || !h.result.finishTimeSeconds) continue
      const race = races.find((r) => r.id === h.raceId)
      if (!race) continue

      const category = race.distance === 'other'
        ? `${Math.round(race.distanceMi)}mi`
        : race.distance

      const existing = bestByCategory.get(category)
      if (!existing || h.result.finishTimeSeconds < existing.finishTimeSeconds) {
        const edition = race.editions[0]
        bestByCategory.set(category, {
          distance: category,
          raceId: h.raceId,
          raceName: h.raceName,
          editionYear: edition?.year ?? 2024,
          finishTimeSeconds: h.result.finishTimeSeconds,
          date: edition?.startDate ?? '2024-01-01',
        })
      }
    }

    return Array.from(bestByCategory.values())
  }

  async getPerformanceIndexHistory(runnerId: string, _limitDays?: number): Promise<PerformanceIndexPoint[]> {
    await delay()
    const runner = getGeneratedRunners().find((r) => r.id === runnerId)
    if (!runner) throw new Error(`Runner not found: ${runnerId}`)

    const history = getRunnerRaceHistory(runnerId)
    return history
      .filter((h) => h.result.status === 'finished' && h.result.performanceIndex)
      .map((h) => {
        const race = races.find((r) => r.id === h.raceId)
        const edition = race?.editions[0]
        return {
          date: edition?.startDate ?? '2024-01-01',
          value: h.result.performanceIndex ?? 0,
          raceId: h.raceId,
          raceName: h.raceName,
        }
      })
  }

  async searchRunners(params: RunnerSearchParams): Promise<PaginatedRunners> {
    await delay()
    let runners = getGeneratedRunners()

    if (params.query) {
      const q = params.query.toLowerCase()
      runners = runners.filter((r) =>
        r.displayName.toLowerCase().includes(q) ||
        (r.location?.toLowerCase().includes(q) ?? false) ||
        (r.country?.toLowerCase().includes(q) ?? false)
      )
    }
    if (params.gender) {
      runners = runners.filter((r) => r.gender === params.gender)
    }
    if (params.ageGroup) {
      runners = runners.filter((r) => r.ageGroup === params.ageGroup)
    }
    if (params.country) {
      runners = runners.filter((r) => r.country === params.country)
    }
    if (params.minPerformanceIndex !== undefined) {
      runners = runners.filter((r) => r.performanceIndex >= params.minPerformanceIndex!)
    }
    if (params.maxPerformanceIndex !== undefined) {
      runners = runners.filter((r) => r.performanceIndex <= params.maxPerformanceIndex!)
    }

    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const start = (page - 1) * pageSize
    const paged = runners.slice(start, start + pageSize)

    return {
      items: paged,
      total: runners.length,
      page,
      pageSize,
      hasMore: start + pageSize < runners.length,
    }
  }

  async getRunnersByRace(raceId: string, _editionId: string): Promise<Runner[]> {
    await delay()
    const results = getGeneratedResults(raceId)
    const allRunners = getGeneratedRunners()
    const runnerIds = new Set(results.map((r) => r.runnerId))
    return allRunners.filter((r) => runnerIds.has(r.id))
  }
}
