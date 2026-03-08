// Tracking service interface

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface RunnerPosition {
  runnerId: string;
  runnerName: string;
  bibNumber: string;
  coordinates: { lat: number; lng: number };
  distanceMi: number;
  elevationFt: number;
  speed: number; // mph
  heading: number; // degrees 0-360
  lastUpdatedAt: string; // simulated race time
  currentSegmentId?: string;
  nextAidStationId?: string;
  nextAidStationDistanceMi?: number;
  status: 'racing' | 'at_aid_station' | 'dnf' | 'finished';
}

export interface AidStationPassthrough {
  id: string;
  runnerId: string;
  runnerName: string;
  bibNumber: string;
  aidStationId: string;
  aidStationName: string;
  distanceMi: number;
  arrivedAt: string; // simulated race time
  departedAt?: string;
  dwellTimeSeconds?: number;
  overallPlaceAtPassthrough?: number;
}

export interface TrackingState {
  raceId: string;
  editionId: string;
  status: SimulationStatus;
  raceStartTime: string; // real-world ISO timestamp the simulation started
  simulatedElapsedSeconds: number; // how far into the race the sim is
  playbackSpeed: number; // 1x, 2x, 5x, 10x, etc.
  totalRaceDurationSeconds: number; // estimated full race duration at sim
  runnerCount: number;
}

export type TrackingEventType = 'position_update' | 'aid_station_passthrough' | 'status_change' | 'simulation_state_change';

export interface TrackingEvent {
  type: TrackingEventType;
  raceId: string;
  editionId: string;
  timestamp: string;
  payload: RunnerPosition | AidStationPassthrough | TrackingState | Record<string, unknown>;
}

export type TrackingEventHandler = (event: TrackingEvent) => void;

export interface ITrackingService {
  startSimulation(raceId: string, editionId: string): Promise<TrackingState>;
  pauseSimulation(raceId: string, editionId: string): Promise<TrackingState>;
  resumeSimulation(raceId: string, editionId: string): Promise<TrackingState>;
  setPlaybackSpeed(raceId: string, editionId: string, speed: number): Promise<TrackingState>;
  seekTo(raceId: string, editionId: string, elapsedSeconds: number): Promise<TrackingState>;
  getTrackingState(raceId: string, editionId: string): Promise<TrackingState>;
  getRunnerPositions(raceId: string, editionId: string): Promise<RunnerPosition[]>;
  getRunnerPosition(raceId: string, editionId: string, runnerId: string): Promise<RunnerPosition>;
  getAidStationPassthroughs(raceId: string, editionId: string, aidStationId?: string): Promise<AidStationPassthrough[]>;
  subscribe(raceId: string, editionId: string, handler: TrackingEventHandler): () => void;
}
