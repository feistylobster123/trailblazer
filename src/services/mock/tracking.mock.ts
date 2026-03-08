import type {
  ITrackingService,
  TrackingState,
  RunnerPosition,
  AidStationPassthrough,
  SimulationStatus,
  TrackingEventHandler,
  TrackingEvent,
} from '../interfaces/tracking.service'

function delay(): Promise<void> {
  return new Promise(r => setTimeout(r, 50 + Math.random() * 50))
}

// ---------------------------------------------------------------------------
// Mock runner data
// ---------------------------------------------------------------------------

interface MockRunnerMeta {
  runnerId: string
  runnerName: string
  bibNumber: string
  distanceMi: number
  status: 'racing' | 'at_aid_station' | 'dnf' | 'finished'
}

// 25 runners spread along the Leadville course (100 miles)
const MOCK_RUNNERS: MockRunnerMeta[] = [
  { runnerId: 'runner-001', runnerName: 'David Zhang', bibNumber: '1', distanceMi: 87.2, status: 'racing' },
  { runnerId: 'runner-002', runnerName: 'Erik Kowalski', bibNumber: '2', distanceMi: 84.6, status: 'racing' },
  { runnerId: 'runner-003', runnerName: 'Dani Moreno', bibNumber: '3', distanceMi: 91.5, status: 'racing' },
  { runnerId: 'runner-004', runnerName: 'Chen Wei', bibNumber: '7', distanceMi: 83.1, status: 'racing' },
  { runnerId: 'runner-005', runnerName: 'Amara Osei', bibNumber: '12', distanceMi: 79.8, status: 'racing' },
  { runnerId: 'runner-006', runnerName: 'Priya Nair', bibNumber: '18', distanceMi: 76.3, status: 'racing' },
  { runnerId: 'runner-007', runnerName: 'Lucas Ferreira', bibNumber: '23', distanceMi: 72.0, status: 'at_aid_station' },
  { runnerId: 'runner-008', runnerName: 'Sarah O\'Brien', bibNumber: '31', distanceMi: 68.4, status: 'racing' },
  { runnerId: 'runner-009', runnerName: 'Tom Nakamura', bibNumber: '45', distanceMi: 65.2, status: 'racing' },
  { runnerId: 'runner-010', runnerName: 'Ingrid Hansen', bibNumber: '52', distanceMi: 62.7, status: 'racing' },
  { runnerId: 'runner-011', runnerName: 'Alex Thompson', bibNumber: '142', distanceMi: 58.4, status: 'racing' },
  { runnerId: 'runner-012', runnerName: 'Marcus Bell', bibNumber: '77', distanceMi: 55.9, status: 'racing' },
  { runnerId: 'runner-013', runnerName: 'Yuki Tanaka', bibNumber: '88', distanceMi: 53.1, status: 'racing' },
  { runnerId: 'runner-014', runnerName: 'Fatima Al-Hassan', bibNumber: '99', distanceMi: 50.0, status: 'at_aid_station' },
  { runnerId: 'runner-015', runnerName: 'Ryan Callahan', bibNumber: '114', distanceMi: 47.3, status: 'racing' },
  { runnerId: 'runner-016', runnerName: 'Elena Petrov', bibNumber: '128', distanceMi: 44.1, status: 'racing' },
  { runnerId: 'runner-017', runnerName: 'Kwame Mensah', bibNumber: '156', distanceMi: 40.8, status: 'racing' },
  { runnerId: 'runner-018', runnerName: 'Olivia Stern', bibNumber: '171', distanceMi: 38.2, status: 'racing' },
  { runnerId: 'runner-019', runnerName: 'James Whitfield', bibNumber: '189', distanceMi: 35.6, status: 'racing' },
  { runnerId: 'runner-020', runnerName: 'Carmen Ruiz', bibNumber: '204', distanceMi: 31.4, status: 'racing' },
  { runnerId: 'runner-021', runnerName: 'Nikolai Volkov', bibNumber: '233', distanceMi: 27.9, status: 'racing' },
  { runnerId: 'runner-022', runnerName: 'Alicia Park', bibNumber: '251', distanceMi: 23.5, status: 'racing' },
  { runnerId: 'runner-023', runnerName: 'Derek Okonkwo', bibNumber: '312', distanceMi: 14.2, status: 'racing' },
  { runnerId: 'runner-024', runnerName: 'Maya Lindqvist', bibNumber: '447', distanceMi: 7.8, status: 'racing' },
  { runnerId: 'runner-025', runnerName: 'Franco Esposito', bibNumber: '601', distanceMi: 2.1, status: 'dnf' },
]

// Leadville course waypoints (lat/lng along the route)
// Out-and-back from Leadville to Winfield via Hope Pass
const COURSE_WAYPOINTS: Array<{ distanceMi: number; lat: number; lng: number; elevationFt: number }> = [
  { distanceMi: 0, lat: 39.2478, lng: -106.2928, elevationFt: 10152 },     // Leadville start
  { distanceMi: 12.5, lat: 39.2956, lng: -106.3482, elevationFt: 10050 },  // Mayqueen
  { distanceMi: 23.5, lat: 39.3201, lng: -106.3891, elevationFt: 10230 },  // Fish Hatchery
  { distanceMi: 30.0, lat: 39.3412, lng: -106.4102, elevationFt: 10800 },  // Halfpipe
  { distanceMi: 39.5, lat: 39.3677, lng: -106.4801, elevationFt: 9375 },   // Twin Lakes
  { distanceMi: 45.5, lat: 39.3891, lng: -106.5124, elevationFt: 12600 },  // Hope Pass summit
  { distanceMi: 50.0, lat: 39.4102, lng: -106.5631, elevationFt: 10000 },  // Winfield (turnaround)
  { distanceMi: 54.5, lat: 39.3891, lng: -106.5124, elevationFt: 12600 },  // Hope Pass (return)
  { distanceMi: 60.5, lat: 39.3677, lng: -106.4801, elevationFt: 9375 },   // Twin Lakes inbound
  { distanceMi: 67.0, lat: 39.3412, lng: -106.4102, elevationFt: 10800 },  // Halfpipe inbound
  { distanceMi: 76.5, lat: 39.3201, lng: -106.3891, elevationFt: 10230 },  // Fish Hatchery inbound
  { distanceMi: 86.5, lat: 39.2956, lng: -106.3482, elevationFt: 10050 },  // Mayqueen inbound
  { distanceMi: 100.0, lat: 39.2478, lng: -106.2928, elevationFt: 10152 }, // Leadville finish
]

function interpolatePosition(
  distanceMi: number,
): { lat: number; lng: number; elevationFt: number } {
  const waypoints = COURSE_WAYPOINTS

  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i]
    const b = waypoints[i + 1]

    if (distanceMi >= a.distanceMi && distanceMi <= b.distanceMi) {
      const t = (distanceMi - a.distanceMi) / (b.distanceMi - a.distanceMi)
      return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
        elevationFt: Math.round(a.elevationFt + (b.elevationFt - a.elevationFt) * t),
      }
    }
  }

  // Beyond last waypoint
  const last = waypoints[waypoints.length - 1]
  return { lat: last.lat, lng: last.lng, elevationFt: last.elevationFt }
}

function getNextAidStation(
  distanceMi: number,
): { id: string; name: string; distanceMi: number } | null {
  const stations = [
    { id: 'mayqueen', name: 'Mayqueen', distanceMi: 12.5 },
    { id: 'fish-hatchery', name: 'Fish Hatchery', distanceMi: 23.5 },
    { id: 'halfpipe', name: 'Halfpipe', distanceMi: 30.0 },
    { id: 'twin-lakes-outbound', name: 'Twin Lakes (Outbound)', distanceMi: 39.5 },
    { id: 'hope-pass-summit', name: 'Hope Pass Summit', distanceMi: 45.5 },
    { id: 'winfield', name: 'Winfield', distanceMi: 50.0 },
    { id: 'hope-pass-return', name: 'Hope Pass (Return)', distanceMi: 54.5 },
    { id: 'twin-lakes-inbound', name: 'Twin Lakes (Inbound)', distanceMi: 60.5 },
    { id: 'halfpipe-inbound', name: 'Halfpipe (Inbound)', distanceMi: 67.0 },
    { id: 'fish-hatchery-inbound', name: 'Fish Hatchery (Inbound)', distanceMi: 76.5 },
    { id: 'mayqueen-inbound', name: 'Mayqueen (Inbound)', distanceMi: 86.5 },
    { id: 'finish', name: 'Leadville Finish', distanceMi: 100.0 },
  ]

  return stations.find(s => s.distanceMi > distanceMi) ?? null
}

function calcHeading(distanceMi: number): number {
  // Outbound: roughly heading NW, then SW over Hope Pass, then returning SE
  if (distanceMi < 50) return 280 + Math.sin(distanceMi * 0.1) * 30
  return 100 + Math.sin(distanceMi * 0.1) * 30
}

function calcSpeed(distanceMi: number, status: string): number {
  if (status === 'at_aid_station' || status === 'dnf' || status === 'finished') return 0
  // Slower on Hope Pass, faster on flats
  if (distanceMi > 43 && distanceMi < 57) return 1.5 + Math.random() * 0.5 // climb
  return 2.5 + Math.random() * 1.5 // flats/downhill
}

function buildRunnerPosition(runner: MockRunnerMeta, simulatedElapsedSeconds: number): RunnerPosition {
  const pos = interpolatePosition(runner.distanceMi)
  const nextStation = getNextAidStation(runner.distanceMi)

  // Simulated race clock: race started at raceStart, elapsed = simulatedElapsedSeconds
  const raceStartISO = new Date(Date.now() - simulatedElapsedSeconds * 1000).toISOString()

  return {
    runnerId: runner.runnerId,
    runnerName: runner.runnerName,
    bibNumber: runner.bibNumber,
    coordinates: { lat: pos.lat, lng: pos.lng },
    distanceMi: runner.distanceMi,
    elevationFt: pos.elevationFt,
    speed: calcSpeed(runner.distanceMi, runner.status),
    heading: Math.round(calcHeading(runner.distanceMi)),
    lastUpdatedAt: raceStartISO,
    nextAidStationId: nextStation?.id,
    nextAidStationDistanceMi: nextStation ? nextStation.distanceMi - runner.distanceMi : undefined,
    status: runner.status,
  }
}

// ---------------------------------------------------------------------------
// Pre-generated aid station passthroughs
// ---------------------------------------------------------------------------

const RACE_START_HOURS_AGO = 8 // race started 8 hours ago
const RACE_START = new Date(Date.now() - RACE_START_HOURS_AGO * 60 * 60 * 1000)

function msAfterStart(hours: number): string {
  return new Date(RACE_START.getTime() + hours * 60 * 60 * 1000).toISOString()
}

const PASSTHROUGHS: AidStationPassthrough[] = [
  // Lead men
  {
    id: 'pt-001', runnerId: 'runner-001', runnerName: 'David Zhang', bibNumber: '1',
    aidStationId: 'twin-lakes-outbound', aidStationName: 'Twin Lakes (Outbound)', distanceMi: 39.5,
    arrivedAt: msAfterStart(4.1), departedAt: msAfterStart(4.25), dwellTimeSeconds: 480, overallPlaceAtPassthrough: 2,
  },
  {
    id: 'pt-002', runnerId: 'runner-001', runnerName: 'David Zhang', bibNumber: '1',
    aidStationId: 'winfield', aidStationName: 'Winfield', distanceMi: 50.0,
    arrivedAt: msAfterStart(5.9), departedAt: msAfterStart(6.05), dwellTimeSeconds: 360, overallPlaceAtPassthrough: 1,
  },
  {
    id: 'pt-003', runnerId: 'runner-002', runnerName: 'Erik Kowalski', bibNumber: '2',
    aidStationId: 'twin-lakes-outbound', aidStationName: 'Twin Lakes (Outbound)', distanceMi: 39.5,
    arrivedAt: msAfterStart(4.0), departedAt: msAfterStart(4.18), dwellTimeSeconds: 420, overallPlaceAtPassthrough: 1,
  },
  {
    id: 'pt-004', runnerId: 'runner-002', runnerName: 'Erik Kowalski', bibNumber: '2',
    aidStationId: 'winfield', aidStationName: 'Winfield', distanceMi: 50.0,
    arrivedAt: msAfterStart(5.85), departedAt: msAfterStart(6.1), dwellTimeSeconds: 540, overallPlaceAtPassthrough: 2,
  },
  // Lead women
  {
    id: 'pt-005', runnerId: 'runner-003', runnerName: 'Dani Moreno', bibNumber: '3',
    aidStationId: 'twin-lakes-outbound', aidStationName: 'Twin Lakes (Outbound)', distanceMi: 39.5,
    arrivedAt: msAfterStart(4.3), departedAt: msAfterStart(4.48), dwellTimeSeconds: 600, overallPlaceAtPassthrough: 3,
  },
  {
    id: 'pt-006', runnerId: 'runner-003', runnerName: 'Dani Moreno', bibNumber: '3',
    aidStationId: 'winfield', aidStationName: 'Winfield', distanceMi: 50.0,
    arrivedAt: msAfterStart(6.1), departedAt: msAfterStart(6.28), dwellTimeSeconds: 420, overallPlaceAtPassthrough: 3,
  },
  // Mid-pack runners at Twin Lakes
  {
    id: 'pt-007', runnerId: 'runner-011', runnerName: 'Alex Thompson', bibNumber: '142',
    aidStationId: 'twin-lakes-outbound', aidStationName: 'Twin Lakes (Outbound)', distanceMi: 39.5,
    arrivedAt: msAfterStart(5.2), departedAt: msAfterStart(5.45), dwellTimeSeconds: 780, overallPlaceAtPassthrough: 38,
  },
  {
    id: 'pt-008', runnerId: 'runner-011', runnerName: 'Alex Thompson', bibNumber: '142',
    aidStationId: 'winfield', aidStationName: 'Winfield', distanceMi: 50.0,
    arrivedAt: msAfterStart(7.0), departedAt: msAfterStart(7.22), dwellTimeSeconds: 480, overallPlaceAtPassthrough: 36,
  },
  {
    id: 'pt-009', runnerId: 'runner-011', runnerName: 'Alex Thompson', bibNumber: '142',
    aidStationId: 'twin-lakes-inbound', aidStationName: 'Twin Lakes (Inbound)', distanceMi: 60.5,
    arrivedAt: msAfterStart(8.8), departedAt: msAfterStart(9.1), dwellTimeSeconds: 1080, overallPlaceAtPassthrough: 34,
  },
  {
    id: 'pt-010', runnerId: 'runner-007', runnerName: 'Lucas Ferreira', bibNumber: '23',
    aidStationId: 'twin-lakes-inbound', aidStationName: 'Twin Lakes (Inbound)', distanceMi: 60.5,
    arrivedAt: msAfterStart(7.85), departedAt: undefined, dwellTimeSeconds: undefined, overallPlaceAtPassthrough: 7,
  },
  {
    id: 'pt-011', runnerId: 'runner-014', runnerName: 'Fatima Al-Hassan', bibNumber: '99',
    aidStationId: 'winfield', aidStationName: 'Winfield', distanceMi: 50.0,
    arrivedAt: msAfterStart(6.8), departedAt: undefined, dwellTimeSeconds: undefined, overallPlaceAtPassthrough: 14,
  },
  {
    id: 'pt-012', runnerId: 'runner-025', runnerName: 'Franco Esposito', bibNumber: '601',
    aidStationId: 'fish-hatchery', aidStationName: 'Fish Hatchery', distanceMi: 23.5,
    arrivedAt: msAfterStart(3.1), departedAt: msAfterStart(3.2), dwellTimeSeconds: 360, overallPlaceAtPassthrough: 599,
  },
]

// ---------------------------------------------------------------------------
// Simulation state (in-memory, per race)
// ---------------------------------------------------------------------------

interface SimState {
  status: SimulationStatus
  raceStartTime: string
  simulatedElapsedSeconds: number
  playbackSpeed: number
  totalRaceDurationSeconds: number
  runnerCount: number
}

const simStates: Map<string, SimState> = new Map()

function getSimKey(raceId: string, editionId: string): string {
  return `${raceId}::${editionId}`
}

function getOrInitState(raceId: string, editionId: string): SimState {
  const key = getSimKey(raceId, editionId)
  if (!simStates.has(key)) {
    simStates.set(key, {
      status: 'idle',
      raceStartTime: RACE_START.toISOString(),
      simulatedElapsedSeconds: RACE_START_HOURS_AGO * 3600,
      playbackSpeed: 1,
      totalRaceDurationSeconds: 30 * 3600, // 30 hour cutoff
      runnerCount: MOCK_RUNNERS.length,
    })
  }
  return simStates.get(key)!
}

// ---------------------------------------------------------------------------
// Subscription management
// ---------------------------------------------------------------------------

const trackingSubscriptions: Map<string, TrackingEventHandler[]> = new Map()

function notifySubscribers(
  raceId: string,
  editionId: string,
  event: TrackingEvent,
): void {
  const key = getSimKey(raceId, editionId)
  const handlers = trackingSubscriptions.get(key) ?? []
  for (const h of handlers) {
    try {
      h(event)
    } catch {
      // ignore
    }
  }
}

export class MockTrackingService implements ITrackingService {
  async startSimulation(raceId: string, editionId: string): Promise<TrackingState> {
    await delay()

    const state = getOrInitState(raceId, editionId)
    state.status = 'running'
    state.raceStartTime = RACE_START.toISOString()

    const trackingState: TrackingState = {
      raceId,
      editionId,
      status: state.status,
      raceStartTime: state.raceStartTime,
      simulatedElapsedSeconds: state.simulatedElapsedSeconds,
      playbackSpeed: state.playbackSpeed,
      totalRaceDurationSeconds: state.totalRaceDurationSeconds,
      runnerCount: state.runnerCount,
    }

    notifySubscribers(raceId, editionId, {
      type: 'simulation_state_change',
      raceId,
      editionId,
      timestamp: new Date().toISOString(),
      payload: trackingState,
    })

    return trackingState
  }

  async pauseSimulation(raceId: string, editionId: string): Promise<TrackingState> {
    await delay()

    const state = getOrInitState(raceId, editionId)
    state.status = 'paused'

    return {
      raceId,
      editionId,
      status: state.status,
      raceStartTime: state.raceStartTime,
      simulatedElapsedSeconds: state.simulatedElapsedSeconds,
      playbackSpeed: state.playbackSpeed,
      totalRaceDurationSeconds: state.totalRaceDurationSeconds,
      runnerCount: state.runnerCount,
    }
  }

  async resumeSimulation(raceId: string, editionId: string): Promise<TrackingState> {
    await delay()

    const state = getOrInitState(raceId, editionId)
    state.status = 'running'

    return {
      raceId,
      editionId,
      status: state.status,
      raceStartTime: state.raceStartTime,
      simulatedElapsedSeconds: state.simulatedElapsedSeconds,
      playbackSpeed: state.playbackSpeed,
      totalRaceDurationSeconds: state.totalRaceDurationSeconds,
      runnerCount: state.runnerCount,
    }
  }

  async setPlaybackSpeed(raceId: string, editionId: string, speed: number): Promise<TrackingState> {
    await delay()

    const state = getOrInitState(raceId, editionId)
    state.playbackSpeed = speed

    return {
      raceId,
      editionId,
      status: state.status,
      raceStartTime: state.raceStartTime,
      simulatedElapsedSeconds: state.simulatedElapsedSeconds,
      playbackSpeed: state.playbackSpeed,
      totalRaceDurationSeconds: state.totalRaceDurationSeconds,
      runnerCount: state.runnerCount,
    }
  }

  async seekTo(raceId: string, editionId: string, elapsedSeconds: number): Promise<TrackingState> {
    await delay()

    const state = getOrInitState(raceId, editionId)
    state.simulatedElapsedSeconds = Math.max(
      0,
      Math.min(elapsedSeconds, state.totalRaceDurationSeconds),
    )

    return {
      raceId,
      editionId,
      status: state.status,
      raceStartTime: state.raceStartTime,
      simulatedElapsedSeconds: state.simulatedElapsedSeconds,
      playbackSpeed: state.playbackSpeed,
      totalRaceDurationSeconds: state.totalRaceDurationSeconds,
      runnerCount: state.runnerCount,
    }
  }

  async getTrackingState(raceId: string, editionId: string): Promise<TrackingState> {
    await delay()

    const state = getOrInitState(raceId, editionId)

    return {
      raceId,
      editionId,
      status: state.status,
      raceStartTime: state.raceStartTime,
      simulatedElapsedSeconds: state.simulatedElapsedSeconds,
      playbackSpeed: state.playbackSpeed,
      totalRaceDurationSeconds: state.totalRaceDurationSeconds,
      runnerCount: state.runnerCount,
    }
  }

  async getRunnerPositions(raceId: string, editionId: string): Promise<RunnerPosition[]> {
    await delay()

    const state = getOrInitState(raceId, editionId)

    return MOCK_RUNNERS.map(runner =>
      buildRunnerPosition(runner, state.simulatedElapsedSeconds),
    )
  }

  async getRunnerPosition(
    raceId: string,
    editionId: string,
    runnerId: string,
  ): Promise<RunnerPosition> {
    await delay()

    const state = getOrInitState(raceId, editionId)
    const runner = MOCK_RUNNERS.find(r => r.runnerId === runnerId)

    if (!runner) {
      throw new Error(`Runner ${runnerId} not found`)
    }

    return buildRunnerPosition(runner, state.simulatedElapsedSeconds)
  }

  async getAidStationPassthroughs(
    _raceId: string,
    _editionId: string,
    aidStationId?: string,
  ): Promise<AidStationPassthrough[]> {
    await delay()

    if (aidStationId) {
      return PASSTHROUGHS.filter(p => p.aidStationId === aidStationId)
    }

    return [...PASSTHROUGHS]
  }

  subscribe(raceId: string, editionId: string, handler: TrackingEventHandler): () => void {
    const key = getSimKey(raceId, editionId)

    if (!trackingSubscriptions.has(key)) {
      trackingSubscriptions.set(key, [])
    }

    const handlers = trackingSubscriptions.get(key)!
    handlers.push(handler)

    return () => {
      const current = trackingSubscriptions.get(key) ?? []
      trackingSubscriptions.set(key, current.filter(h => h !== handler))
    }
  }
}
