export type RaceStatus = 'upcoming' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed'

export type RaceSurface = 'trail' | 'road' | 'mixed' | 'mountain'

export type DistanceCategory = 'marathon' | '50k' | '50mi' | '100k' | '100mi' | 'multi_day'

export type GeoPoint = {
  lat: number
  lng: number
  elevation?: number
}

export type Cutoff = {
  stationId: string
  stationName: string
  distanceKm: number
  timeFromStart: number
}

export type RaceEditionSummary = {
  year: number
  finishers: number
  starters: number
}

export type AidStation = {
  id: string
  name: string
  distanceKm: number
  distanceMi: number
  elevationM: number
  elevationFt: number
  location: GeoPoint
  cutoffTime?: string
  crewAccess: boolean
  pacerAccess: boolean
  dropBags: boolean
  supplies: string[]
  description: string
}

export type ElevationPoint = {
  distanceKm: number
  elevationM: number
  grade: number
}

export type RaceSummary = {
  id: string
  name: string
  location: string
  country: string
  date: string
  distanceKm: number
  distanceMi: number
  elevationGainM: number
  elevationGainFt: number
  category: DistanceCategory
  surface: RaceSurface
  status: RaceStatus
  imageUrl: string
  itraPoints: number
  maxParticipants: number
  registeredCount: number
  tagline: string
}

export type Race = RaceSummary & {
  description: string
  website: string
  startTime: string
  timeLimit: number
  cutoffs: Cutoff[]
  editions: RaceEditionSummary[]
  registrationOpens: string
  registrationCloses: string
  entryFee: number
  currency: string
  requirements: string[]
  crewAllowed: boolean
  pacersAllowed: boolean
  pacerStartStation: string
  dropBagsAllowed: boolean
  dropBagStations: string[]
}

export type GeoJSONGeometry =
  | { type: 'Point'; coordinates: [number, number] | [number, number, number] }
  | { type: 'LineString'; coordinates: Array<[number, number] | [number, number, number]> }
  | { type: 'MultiLineString'; coordinates: Array<Array<[number, number] | [number, number, number]>> }
  | { type: 'Polygon'; coordinates: Array<Array<[number, number] | [number, number, number]>> }
  | { type: 'MultiPolygon'; coordinates: Array<Array<Array<[number, number] | [number, number, number]>>> }

export type GeoJSONFeature = {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: Record<string, unknown> | null
}

export type GeoJSONFeatureCollection = {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export type CourseData = {
  raceId: string
  routeGeoJSON: GeoJSONFeatureCollection
  elevationProfile: ElevationPoint[]
  aidStations: AidStation[]
  totalDistanceKm: number
  totalElevationGainM: number
  totalElevationLossM: number
  highestPointM: number
  lowestPointM: number
}

export type RaceListFilter = {
  category?: DistanceCategory
  surface?: RaceSurface
  status?: RaceStatus
  country?: string
  month?: number
  search?: string
}
