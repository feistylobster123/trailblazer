import type {
  IRaceService,
  Race,
  RaceSummary,
  RaceEdition,
  CourseData,
  AidStation,
  RaceSearchParams,
  PaginatedResult,
} from '../interfaces/race.service'
import { races, raceSummaries, getRaceById } from '@/data/races'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, Math.random() * 100 + 50))
}

function matchesDistance(race: Race, distances: RaceSearchParams['distance']): boolean {
  if (!distances || distances.length === 0) return true
  return distances.includes(race.distance)
}

function matchesDifficulty(race: Race, difficulties: RaceSearchParams['difficulty']): boolean {
  if (!difficulties || difficulties.length === 0) return true
  return difficulties.includes(race.difficulty)
}

function matchesRegion(race: Race, region: string | undefined): boolean {
  if (!region) return true
  return race.region.toLowerCase().includes(region.toLowerCase()) ||
    race.country.toLowerCase().includes(region.toLowerCase())
}

function matchesStatus(race: Race, statuses: RaceSearchParams['status']): boolean {
  if (!statuses || statuses.length === 0) return true
  const editionStatus = race.currentEdition?.status
  if (!editionStatus) return false
  return statuses.includes(editionStatus)
}

function matchesFeatured(race: Race, featured: boolean | undefined): boolean {
  if (featured === undefined) return true
  return race.featured === featured
}

function fuzzyMatch(race: Race, query: string): boolean {
  const q = query.toLowerCase()
  return (
    race.name.toLowerCase().includes(q) ||
    race.location.toLowerCase().includes(q) ||
    race.region.toLowerCase().includes(q) ||
    race.country.toLowerCase().includes(q) ||
    race.tagline.toLowerCase().includes(q) ||
    race.tags.some((t) => t.includes(q))
  )
}

function applyParams(
  allRaces: Race[],
  params: RaceSearchParams,
): Race[] {
  let filtered = allRaces

  if (params.query) {
    filtered = filtered.filter((r) => fuzzyMatch(r, params.query!))
  }
  if (params.distance && params.distance.length > 0) {
    filtered = filtered.filter((r) => matchesDistance(r, params.distance))
  }
  if (params.difficulty && params.difficulty.length > 0) {
    filtered = filtered.filter((r) => matchesDifficulty(r, params.difficulty))
  }
  if (params.region) {
    filtered = filtered.filter((r) => matchesRegion(r, params.region))
  }
  if (params.status && params.status.length > 0) {
    filtered = filtered.filter((r) => matchesStatus(r, params.status))
  }
  if (params.featured !== undefined) {
    filtered = filtered.filter((r) => matchesFeatured(r, params.featured))
  }

  return filtered
}

function paginate<T>(items: T[], params: RaceSearchParams): PaginatedResult<T> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const start = (page - 1) * pageSize
  const paged = items.slice(start, start + pageSize)
  return {
    items: paged,
    total: items.length,
    page,
    pageSize,
    hasMore: start + pageSize < items.length,
  }
}

function toSummary(race: Race): RaceSummary {
  return {
    id: race.id,
    slug: race.slug,
    name: race.name,
    distance: race.distance,
    distanceMi: race.distanceMi,
    difficulty: race.difficulty,
    location: race.location,
    imageUrl: race.imageUrl,
    nextEditionDate: race.currentEdition?.startDate,
    status: race.currentEdition?.status ?? 'upcoming',
    featured: race.featured,
  }
}

// ---------------------------------------------------------------------------
// MockRaceService
// ---------------------------------------------------------------------------

export class MockRaceService implements IRaceService {
  async listRaces(params: RaceSearchParams = {}): Promise<PaginatedResult<RaceSummary>> {
    await delay()
    const filtered = applyParams(races, params)
    const summaries = filtered.map(toSummary)
    return paginate(summaries, params)
  }

  async getRace(slugOrId: string): Promise<Race> {
    await delay()
    const race = getRaceById(slugOrId)
    if (!race) {
      throw new Error(`Race not found: ${slugOrId}`)
    }
    return race
  }

  async getRaceEdition(raceId: string, editionId: string): Promise<RaceEdition> {
    await delay()
    const race = getRaceById(raceId)
    if (!race) {
      throw new Error(`Race not found: ${raceId}`)
    }
    const edition = race.editions.find((e) => e.id === editionId)
    if (!edition) {
      throw new Error(`Edition not found: ${editionId} for race ${raceId}`)
    }
    return edition
  }

  async getCourseData(raceId: string, editionId: string): Promise<CourseData> {
    await delay()
    // Course data files live in src/data/courses/ -- return null-safe stub when not found
    const race = getRaceById(raceId)
    if (!race) {
      throw new Error(`Race not found: ${raceId}`)
    }
    const edition = race.editions.find((e) => e.id === editionId)
    if (!edition) {
      throw new Error(`Edition not found: ${editionId}`)
    }
    // Return a minimal stub so callers always get a valid CourseData shape
    // Real GPX-backed data will be loaded once course files are seeded
    return {
      raceId,
      editionId,
      totalDistanceMi: race.distanceMi,
      totalElevationGainFt: race.elevationGainFt,
      totalElevationLossFt: Math.round(race.elevationGainFt * 0.95),
      highPointFt: race.coordinates.elevationFt
        ? race.coordinates.elevationFt + Math.round(race.elevationGainFt * 0.4)
        : 10000,
      lowPointFt: race.coordinates.elevationFt ?? 1000,
      segments: [],
      aidStations: [],
      elevationProfile: [],
    }
  }

  async getAidStations(raceId: string, editionId: string): Promise<AidStation[]> {
    await delay()
    const courseData = await this.getCourseData(raceId, editionId)
    return courseData.aidStations
  }

  async getFeaturedRaces(): Promise<RaceSummary[]> {
    await delay()
    return raceSummaries
      .filter((r) => r.featured)
      .slice(0, 4)
  }

  async searchRaces(params: RaceSearchParams): Promise<PaginatedResult<RaceSummary>> {
    await delay()
    // searchRaces is a superset of listRaces with fuzzy query support
    return this.listRaces(params)
  }
}
