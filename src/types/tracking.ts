export type RunnerTrackingStatus = 'not_started' | 'on_course' | 'at_aid_station' | 'finished' | 'dnf' | 'dns'

export type RunnerPosition = {
  runnerId: string
  runnerName: string
  bibNumber: string
  location: { lat: number; lng: number }
  elevationM: number
  distanceCoveredKm: number
  paceMinPerKm: number
  currentGrade: number
  status: RunnerTrackingStatus
  lastAidStation: string | null
  nextAidStation: string | null
  nextAidStationEtaSeconds: number | null
  overallPlace: number | null
  genderPlace: number | null
  elapsedSeconds: number
  splitFromLastStation: number
  trendVsPlan: 'ahead' | 'on_pace' | 'behind'
}

export type TrackingEvent = {
  id: string
  timestamp: string
  type: 'aid_station_arrival' | 'aid_station_departure' | 'dnf' | 'finish' | 'leader_change'
  runnerId: string
  runnerName: string
  bibNumber: string
  stationId?: string
  stationName?: string
  message: string
}

export type TrackingState = {
  raceId: string
  raceStatus: 'pre_race' | 'in_progress' | 'finished'
  elapsedSeconds: number
  playbackSpeed: number
  isPlaying: boolean
  runners: RunnerPosition[]
  recentEvents: TrackingEvent[]
}

export type AidStationPassthrough = {
  runnerId: string
  runnerName: string
  bibNumber: string
  stationId: string
  stationName: string
  arrivalTime: string
  departureTime: string
  timeInStation: number
  overallPlace: number
  splitTime: string
}

export type TrackingConfig = {
  startSpeed: number
  runnerCount: number
}
