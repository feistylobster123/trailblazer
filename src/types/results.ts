export type SplitData = {
  stationId: string
  stationName: string
  distanceKm: number
  elevationGainM: number
  elevationLossM: number
  splitTime: string
  cumulativeTime: string
  paceMinPerKm: number
  gapPaceMinPerKm: number
  splitPlace: number
  splitGenderPlace: number
  arrivalTime: string
  timeInStation: number
}

export type RaceResult = {
  runnerId: string
  runnerName: string
  bibNumber: string
  gender: string
  age: number
  city: string
  state: string
  country: string
  overallPlace: number | null
  genderPlace: number | null
  ageGroupPlace: number | null
  ageGroup: string
  finishTime: string | null
  status: 'finished' | 'dnf' | 'dns' | 'dq'
  dnfStation?: string
  performanceIndex: number
  behindWinner: string | null
  percentile: number
  splits: SplitData[]
}

export type SegmentComparison = {
  stationId: string
  stationName: string
  distanceKm: number
  runnerSplitSeconds: number
  winnerSplitSeconds: number
  medianSplitSeconds: number
  fieldPercentile: number
  runnerGapSeconds: number
  winnerGapSeconds: number
  medianGapSeconds: number
  relativeStrength: 'strong' | 'average' | 'weak'
}

export type SegmentAnalysis = {
  runnerId: string
  segments: SegmentComparison[]
}

export type PaceSegment = {
  distanceKm: number
  paceMinPerKm: number
  gapMinPerKm: number
  elevationM: number
  grade: number
}

export type PaceAnalysis = {
  runnerId: string
  segments: PaceSegment[]
  paceDecline: number
  negativeSplit: boolean
  evenPacingScore: number
}

export type ResultsFilter = {
  gender?: string
  ageGroup?: string
  status?: 'finished' | 'dnf' | 'dns' | 'dq'
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type ResultsSummary = {
  raceId: string
  year: number
  starters: number
  finishers: number
  dnfs: number
  dnfRate: number
  maleFinishers: number
  femaleFinishers: number
  winnerTime: string
  winnerName: string
  femaleWinnerTime: string
  femaleWinnerName: string
  medianTime: string
  averageTime: string
  lastFinisherTime: string
  courseDifficulty: number
}
