import type { RunnerTrackingStatus } from './tracking'

export type AidStationETA = {
  stationId: string
  stationName: string
  stationLocation: { lat: number; lng: number }
  distanceKm: number
  estimatedArrival: string
  timeUntilArrival: number
  confidence: 'high' | 'medium' | 'low'
}

export type CrewRunnerSummary = {
  runnerId: string
  runnerName: string
  bibNumber: string
  status: RunnerTrackingStatus
  currentPosition: { lat: number; lng: number } | null
  distanceCoveredKm: number
  lastAidStation: string | null
  nextAidStation: string | null
  nextAidStationETA: AidStationETA | null
  overallPlace: number | null
  trend: 'ahead' | 'on_pace' | 'behind'
}

export type CrewDashboardData = {
  crewId: string
  runners: CrewRunnerSummary[]
  nextAidStation: AidStationETA | null
}

export type RunnerNeeds = {
  runnerId: string
  stationId: string
  dropBagContents: string[]
  nutrition: string[]
  gear: string[]
  notes: string
}

export type AidStationDirections = {
  stationId: string
  stationName: string
  location: { lat: number; lng: number }
  address: string
  parkingNotes: string
  accessNotes: string
  facilities: string[]
}

export type CrewAssignment = {
  crewId: string
  crewName: string
  crewPhone: string
  runnerId: string
  stations: string[]
}
