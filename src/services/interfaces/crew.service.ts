// Crew service interface

export type CrewAccessLevel = 'crew_only' | 'crew_and_spectators' | 'no_access';

export interface CrewAidStationInfo {
  aidStationId: string;
  aidStationName: string;
  distanceMi: number;
  crewAccessLevel: CrewAccessLevel;
  parkingNotes?: string;
  directionsUrl?: string;
  estimatedDriveMinutesFromPrevious?: number;
}

export interface RunnerETA {
  runnerId: string;
  runnerName: string;
  bibNumber: string;
  aidStationId: string;
  aidStationName: string;
  distanceMi: number;
  estimatedArrivalTime: string; // ISO timestamp
  earliestArrivalTime: string;
  latestArrivalTime: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  lastKnownDistanceMi?: number;
  lastKnownTime?: string;
}

export interface RunnerNeed {
  id: string;
  runnerId: string;
  aidStationId: string;
  category: 'nutrition' | 'hydration' | 'gear' | 'medical' | 'clothing' | 'other';
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
  aidStationId?: string;
  category?: string;
}

export interface CrewAssignment {
  id: string;
  runnerId: string;
  crewMemberId: string;
  crewMemberName: string;
  role: 'pacer' | 'crew_chief' | 'support' | 'driver';
  aidStations: string[]; // aid station IDs this crew member is assigned to
  startFrom?: string; // aid station ID where pacer joins
  notes?: string;
}

export interface CrewDashboard {
  raceId: string;
  editionId: string;
  runners: Array<{
    runnerId: string;
    runnerName: string;
    bibNumber: string;
    currentStatus: 'pre_race' | 'racing' | 'at_aid_station' | 'dnf' | 'finished';
    currentDistanceMi?: number;
    lastKnownAidStation?: string;
    nextAidStation?: string;
    nextETA?: string;
    overallPlace?: number;
  }>;
  upcomingCrewPoints: CrewAidStationInfo[];
  checklist: ChecklistItem[];
  lastUpdatedAt: string;
}

export interface ICrewService {
  getCrewDashboard(raceId: string, editionId: string, runnerIds: string[]): Promise<CrewDashboard>;
  getRunnerETAs(raceId: string, editionId: string, runnerId: string): Promise<RunnerETA[]>;
  getRunnerNeeds(runnerId: string, raceId: string, editionId: string): Promise<RunnerNeed[]>;
  getAidStationDirections(raceId: string, editionId: string, aidStationId: string): Promise<CrewAidStationInfo>;
  getCrewAssignments(runnerId: string, raceId: string, editionId: string): Promise<CrewAssignment[]>;
  updateChecklist(raceId: string, editionId: string, itemId: string, completed: boolean): Promise<ChecklistItem>;
}
