// Results service interface

export type ResultStatus = 'finished' | 'dnf' | 'dq' | 'dns';
export type AgeGroup = '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+';

export interface RaceResult {
  id: string;
  raceId: string;
  editionId: string;
  runnerId: string;
  runnerName: string;
  bibNumber: string;
  gender: string;
  ageGroup: AgeGroup;
  nationality?: string;
  status: ResultStatus;
  finishTimeSeconds?: number;
  overallPlace?: number;
  genderPlace?: number;
  ageGroupPlace?: number;
  performanceIndex?: number;
  dnfLocation?: string;
  dnfReason?: string;
}

export interface ResultsSummary {
  raceId: string;
  editionId: string;
  raceName: string;
  editionYear: number;
  totalStarters: number;
  totalFinishers: number;
  dnfCount: number;
  dqCount: number;
  dnsCount: number;
  finishRate: number;
  courseRecord?: {
    overall?: { runnerId: string; runnerName: string; timeSeconds: number; year: number };
    male?: { runnerId: string; runnerName: string; timeSeconds: number; year: number };
    female?: { runnerId: string; runnerName: string; timeSeconds: number; year: number };
  };
  winnerMale?: RaceResult;
  winnerFemale?: RaceResult;
  medianFinishTimeSeconds?: number;
  cutoffTime?: string;
}

export interface Split {
  aidStationId: string;
  aidStationName: string;
  distanceMi: number;
  elapsedTimeSeconds: number;
  legTimeSeconds: number;
  legPaceMinPerMi: number;
  overallPlaceAtSplit?: number;
  genderPlaceAtSplit?: number;
}

export interface SegmentAnalysis {
  segmentId: string;
  fromAidStation: string;
  toAidStation: string;
  distanceMi: number;
  runnerTimeSeconds: number;
  runnerPaceMinPerMi: number;
  fieldAverageTimeSeconds: number;
  fieldAveragePaceMinPerMi: number;
  percentileRank: number; // 0-100, higher is faster relative to field
  elevationGainFt: number;
  elevationLossFt: number;
}

export interface PaceAnalysis {
  runnerId: string;
  raceId: string;
  editionId: string;
  overallPaceMinPerMi: number;
  firstHalfPaceMinPerMi?: number;
  secondHalfPaceMinPerMi?: number;
  paceDeltaPercent?: number; // positive = slowed down, negative = negative split
  fastestSegmentId?: string;
  slowestSegmentId?: string;
  paceBySegment: Array<{ segmentId: string; paceMinPerMi: number }>;
}

export interface RunnerComparison {
  runners: Array<{
    runnerId: string;
    runnerName: string;
    result: RaceResult;
    splits: Split[];
    paceAnalysis: PaceAnalysis;
  }>;
  raceId: string;
  editionId: string;
}

export interface ResultsFilterParams {
  gender?: string;
  ageGroup?: AgeGroup;
  status?: ResultStatus[];
  nationality?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'overall_place' | 'finish_time' | 'performance_index';
}

export interface PaginatedResults {
  items: RaceResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IResultsService {
  getResults(raceId: string, editionId: string, params?: ResultsFilterParams): Promise<PaginatedResults>;
  getResultsSummary(raceId: string, editionId: string): Promise<ResultsSummary>;
  getRunnerResult(raceId: string, editionId: string, runnerId: string): Promise<RaceResult>;
  getSplits(raceId: string, editionId: string, runnerId: string): Promise<Split[]>;
  getSegmentAnalysis(raceId: string, editionId: string, runnerId: string): Promise<SegmentAnalysis[]>;
  getPaceAnalysis(raceId: string, editionId: string, runnerId: string): Promise<PaceAnalysis>;
  compareRunners(raceId: string, editionId: string, runnerIds: string[]): Promise<RunnerComparison>;
}
