// Runner service interface

export type Gender = 'M' | 'F' | 'NB' | 'prefer_not_to_say';
export type AgeGroup = '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+';

export interface Runner {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  country?: string;
  gender?: Gender;
  ageGroup?: AgeGroup;
  birthYear?: number;
  performanceIndex: number;
  totalRacesFinished: number;
  totalDistanceMi: number;
  createdAt: string;
}

export interface RunnerStats {
  runnerId: string;
  totalRaces: number;
  finishes: number;
  dnfs: number;
  dqs: number;
  totalDistanceMi: number;
  totalElevationGainFt: number;
  totalMovingTimeSeconds: number;
  averagePaceMinPerMi: number;
  performanceIndex: number;
  performanceIndexRank?: number;
  finishRate: number;
  fastestHundredMileFinishSeconds?: number;
  fastestFiftyMileFinishSeconds?: number;
  fastestHundredKFinishSeconds?: number;
  fastestFiftyKFinishSeconds?: number;
}

export interface RaceHistoryEntry {
  raceId: string;
  raceName: string;
  raceSlug: string;
  editionId: string;
  editionYear: number;
  distanceMi: number;
  startDate: string;
  status: 'finished' | 'dnf' | 'dq' | 'dns';
  finishTimeSeconds?: number;
  overallPlace?: number;
  genderPlace?: number;
  ageGroupPlace?: number;
  performanceIndexEarned?: number;
}

export interface PersonalRecord {
  distance: string;
  raceId: string;
  raceName: string;
  editionYear: number;
  finishTimeSeconds: number;
  date: string;
}

export interface PerformanceIndexPoint {
  date: string;
  value: number;
  raceId?: string;
  raceName?: string;
}

export interface RunnerSearchParams {
  query?: string;
  gender?: Gender;
  ageGroup?: AgeGroup;
  country?: string;
  minPerformanceIndex?: number;
  maxPerformanceIndex?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedRunners {
  items: Runner[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IRunnerService {
  getRunner(runnerId: string): Promise<Runner>;
  getRunnerStats(runnerId: string): Promise<RunnerStats>;
  getRaceHistory(runnerId: string, page?: number, pageSize?: number): Promise<{ items: RaceHistoryEntry[]; total: number; hasMore: boolean }>;
  getPersonalRecords(runnerId: string): Promise<PersonalRecord[]>;
  getPerformanceIndexHistory(runnerId: string, limitDays?: number): Promise<PerformanceIndexPoint[]>;
  searchRunners(params: RunnerSearchParams): Promise<PaginatedRunners>;
  getRunnersByRace(raceId: string, editionId: string): Promise<Runner[]>;
}
