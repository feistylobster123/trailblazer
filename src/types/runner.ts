import type { DistanceCategory } from './race'

export type PerformanceCategory = 'elite' | 'sub_elite' | 'competitive' | 'mid_pack' | 'back_pack' | 'newcomer'

export type RunnerProfile = {
  id: string
  firstName: string
  lastName: string
  displayName: string
  avatar: string
  city: string
  state: string
  country: string
  age: number
  gender: 'M' | 'F' | 'NB'
  bio: string
  performanceIndex: number
  performanceCategory: PerformanceCategory
  totalRaces: number
  totalFinishes: number
  totalDNFs: number
  totalDistanceKm: number
  totalElevationGainM: number
  memberSince: string
  sponsors: string[]
}

export type YearlyStats = {
  year: number
  races: number
  finishes: number
  dnfs: number
  totalDistanceKm: number
  totalElevationGainM: number
  performanceIndex: number
}

export type RunnerStats = {
  runnerId: string
  currentPI: number
  peakPI: number
  peakPIDate: string
  winRate: number
  top10Rate: number
  dnfRate: number
  averageFinishPercentile: number
  longestRaceKm: number
  longestRaceName: string
  biggestElevationGainM: number
  fastestMarathonTime: string | null
  fastest50kTime: string | null
  fastest100kTime: string | null
  fastest100miTime: string | null
  streakCurrentFinishes: number
  totalDistanceKm: number
  totalElevationGainM: number
  totalRacingHours: number
  yearlyBreakdown: YearlyStats[]
}

export type RaceHistoryEntry = {
  raceId: string
  raceName: string
  year: number
  date: string
  distanceKm: number
  elevationGainM: number
  category: DistanceCategory
  finishTime: string | null
  overallPlace: number | null
  genderPlace: number | null
  ageGroupPlace: number | null
  totalFinishers: number
  performanceIndex: number
  status: 'finished' | 'dnf' | 'dns' | 'dq'
  dnfStation?: string
}

export type PersonalRecord = {
  category: DistanceCategory
  raceName: string
  year: number
  time: string
  performanceIndex: number
}

export type PerformanceIndexHistory = {
  date: string
  performanceIndex: number
  raceName: string
  raceId: string
}
