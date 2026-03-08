import { registerService } from './index'

// Stub mock services - each returns empty/default data for now
// Full implementations come in Wave 2

const stubAuth = {
  login: async () => { throw new Error('Not implemented') },
  register: async () => { throw new Error('Not implemented') },
  logout: async () => {},
  getCurrentUser: async () => null,
  updateProfile: async () => { throw new Error('Not implemented') },
  getSession: () => null,
}

const stubRace = {
  listRaces: async () => [],
  getRace: async () => { throw new Error('Not implemented') },
  getRaceEdition: async () => { throw new Error('Not implemented') },
  getCourseData: async () => { throw new Error('Not implemented') },
  getAidStations: async () => [],
  getFeaturedRaces: async () => [],
  searchRaces: async () => [],
}

const stubRunner = {
  getRunner: async () => { throw new Error('Not implemented') },
  getRunnerStats: async () => { throw new Error('Not implemented') },
  getRaceHistory: async () => [],
  getPersonalRecords: async () => [],
  getPerformanceIndexHistory: async () => [],
  searchRunners: async () => [],
  getRunnersByRace: async () => [],
}

const stubRegistration = {
  startRegistration: async () => '',
  saveStep: async () => {},
  getRegistration: async () => { throw new Error('Not implemented') },
  submitRegistration: async () => { throw new Error('Not implemented') },
  getWaivers: async () => [],
  getDropBagOptions: async () => { throw new Error('Not implemented') },
  getMyRegistrations: async () => [],
}

const stubTracking = {
  startSimulation: () => {},
  pauseSimulation: () => {},
  resumeSimulation: () => {},
  setPlaybackSpeed: () => {},
  seekTo: () => {},
  getTrackingState: () => ({ raceId: '', raceStatus: 'pre_race' as const, elapsedSeconds: 0, playbackSpeed: 1, isPlaying: false, runners: [], recentEvents: [] }),
  getRunnerPositions: () => [],
  getRunnerPosition: () => null,
  getAidStationPassthroughs: () => [],
  subscribe: () => () => {},
}

const stubResults = {
  getResults: async () => [],
  getResultsSummary: async () => { throw new Error('Not implemented') },
  getRunnerResult: async () => { throw new Error('Not implemented') },
  getSplits: async () => [],
  getSegmentAnalysis: async () => { throw new Error('Not implemented') },
  getPaceAnalysis: async () => { throw new Error('Not implemented') },
  compareRunners: async () => [],
}

const stubCrew = {
  getCrewDashboard: async () => { throw new Error('Not implemented') },
  getRunnerETAs: async () => [],
  getRunnerNeeds: async () => { throw new Error('Not implemented') },
  getAidStationDirections: async () => { throw new Error('Not implemented') },
  getCrewAssignments: async () => [],
  updateChecklist: async () => {},
}

const stubStreaming = {
  getStreamInfo: async () => { throw new Error('Not implemented') },
  getStreamStatus: async () => { throw new Error('Not implemented') },
  getChatMessages: async () => [],
  sendChatMessage: async () => { throw new Error('Not implemented') },
  subscribeToChatMessages: () => () => {},
}

export function initMockServices() {
  registerService('auth', stubAuth as any)
  registerService('race', stubRace as any)
  registerService('runner', stubRunner as any)
  registerService('registration', stubRegistration as any)
  registerService('tracking', stubTracking as any)
  registerService('results', stubResults as any)
  registerService('crew', stubCrew as any)
  registerService('streaming', stubStreaming as any)
}
