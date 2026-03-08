// Race service interface

export type RaceDistance = '50k' | '50mi' | '100k' | '100mi' | 'other';
export type RaceDifficulty = 'moderate' | 'hard' | 'extreme';
export type RaceStatus = 'upcoming' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';

export interface Coordinates {
  lat: number;
  lng: number;
  elevationFt?: number;
}

export interface AidStation {
  id: string;
  name: string;
  distanceMi: number;
  cumulativeElevationGain: number;
  coordinates: Coordinates;
  crewAccessible: boolean;
  dropBagsAllowed: boolean;
  cutoffTime?: string; // ISO 8601 duration from race start
  services: string[];
}

export interface CourseSegment {
  id: string;
  fromAidStation: string;
  toAidStation: string;
  distanceMi: number;
  elevationGainFt: number;
  elevationLossFt: number;
  terrainType: string;
}

export interface CourseData {
  raceId: string;
  editionId: string;
  totalDistanceMi: number;
  totalElevationGainFt: number;
  totalElevationLossFt: number;
  highPointFt: number;
  lowPointFt: number;
  gpxUrl?: string;
  segments: CourseSegment[];
  aidStations: AidStation[];
  elevationProfile: Array<{ distanceMi: number; elevationFt: number }>;
}

export interface RaceEdition {
  id: string;
  raceId: string;
  year: number;
  startDate: string;
  endDate: string;
  status: RaceStatus;
  registrationOpenDate?: string;
  registrationCloseDate?: string;
  maxParticipants: number;
  registeredCount: number;
  entryFee: number;
  waitlistCount: number;
}

export interface Race {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  distance: RaceDistance;
  distanceMi: number;
  difficulty: RaceDifficulty;
  location: string;
  region: string;
  country: string;
  coordinates: Coordinates;
  elevationGainFt: number;
  imageUrl?: string;
  websiteUrl?: string;
  currentEdition?: RaceEdition;
  editions: RaceEdition[];
  tags: string[];
  featured: boolean;
}

export interface RaceSummary {
  id: string;
  slug: string;
  name: string;
  distance: RaceDistance;
  distanceMi: number;
  difficulty: RaceDifficulty;
  location: string;
  imageUrl?: string;
  nextEditionDate?: string;
  status: RaceStatus;
  featured: boolean;
}

export interface RaceSearchParams {
  query?: string;
  distance?: RaceDistance[];
  difficulty?: RaceDifficulty[];
  region?: string;
  status?: RaceStatus[];
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IRaceService {
  listRaces(params?: RaceSearchParams): Promise<PaginatedResult<RaceSummary>>;
  getRace(slugOrId: string): Promise<Race>;
  getRaceEdition(raceId: string, editionId: string): Promise<RaceEdition>;
  getCourseData(raceId: string, editionId: string): Promise<CourseData>;
  getAidStations(raceId: string, editionId: string): Promise<AidStation[]>;
  getFeaturedRaces(): Promise<RaceSummary[]>;
  searchRaces(params: RaceSearchParams): Promise<PaginatedResult<RaceSummary>>;
}
