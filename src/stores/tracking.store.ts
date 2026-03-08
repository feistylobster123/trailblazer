import { create } from 'zustand'
import { getService } from '@/services/index'
import type { RunnerPosition, TrackingEvent } from '@/services/interfaces/tracking.service'

// The tracking store holds a single active race + edition pair.
// editionId is derived from context (e.g. the race's current edition) and
// stored here so all service calls stay consistent.

interface TrackingState {
  raceId: string | null
  editionId: string | null
  isPlaying: boolean
  playbackSpeed: number
  elapsedSeconds: number
  runnerPositions: RunnerPosition[]
  selectedRunnerId: string | null
  recentEvents: TrackingEvent[]
  isLoading: boolean

  startTracking: (raceId: string, editionId: string) => Promise<void>
  pauseTracking: () => Promise<void>
  resumeTracking: () => Promise<void>
  setPlaybackSpeed: (speed: number) => Promise<void>
  seekTo: (seconds: number) => Promise<void>
  selectRunner: (runnerId: string | null) => void
  updatePositions: (positions: RunnerPosition[]) => void
  addEvent: (event: TrackingEvent) => void
}

// Holds the unsubscribe function returned by the tracking service so we can
// clean up when tracking is stopped or the raceId changes.
let _unsubscribe: (() => void) | null = null

export const useTrackingStore = create<TrackingState>((set, get) => ({
  raceId: null,
  editionId: null,
  isPlaying: false,
  playbackSpeed: 1,
  elapsedSeconds: 0,
  runnerPositions: [],
  selectedRunnerId: null,
  recentEvents: [],
  isLoading: false,

  startTracking: async (raceId, editionId) => {
    // Clean up any prior subscription
    if (_unsubscribe) {
      _unsubscribe()
      _unsubscribe = null
    }

    set({ isLoading: true, raceId, editionId, runnerPositions: [], recentEvents: [] })
    try {
      const tracking = getService('tracking')

      const state = await tracking.startSimulation(raceId, editionId)
      const positions = await tracking.getRunnerPositions(raceId, editionId)

      set({
        isPlaying: state.status === 'running',
        playbackSpeed: state.playbackSpeed,
        elapsedSeconds: state.simulatedElapsedSeconds,
        runnerPositions: positions,
        isLoading: false,
      })

      // Subscribe to live events from the service
      _unsubscribe = tracking.subscribe(raceId, editionId, (event) => {
        if (event.type === 'position_update') {
          const pos = event.payload as RunnerPosition
          set((s) => {
            const idx = s.runnerPositions.findIndex((r) => r.runnerId === pos.runnerId)
            const updated =
              idx >= 0
                ? s.runnerPositions.map((r, i) => (i === idx ? pos : r))
                : [...s.runnerPositions, pos]
            return { runnerPositions: updated }
          })
        } else if (event.type === 'simulation_state_change') {
          const simState = event.payload as import('@/services/interfaces/tracking.service').TrackingState
          set({
            isPlaying: simState.status === 'running',
            playbackSpeed: simState.playbackSpeed,
            elapsedSeconds: simState.simulatedElapsedSeconds,
          })
        } else {
          // aid_station_passthrough and status_change are surfaced as events
          set((s) => ({
            recentEvents: [event, ...s.recentEvents].slice(0, 50),
          }))
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start tracking'
      set({ isLoading: false, raceId: null, editionId: null })
      console.error(message)
    }
  },

  pauseTracking: async () => {
    const { raceId, editionId } = get()
    if (!raceId || !editionId) return
    try {
      const tracking = getService('tracking')
      const state = await tracking.pauseSimulation(raceId, editionId)
      set({ isPlaying: false, elapsedSeconds: state.simulatedElapsedSeconds })
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to pause tracking')
    }
  },

  resumeTracking: async () => {
    const { raceId, editionId } = get()
    if (!raceId || !editionId) return
    try {
      const tracking = getService('tracking')
      const state = await tracking.resumeSimulation(raceId, editionId)
      set({ isPlaying: true, elapsedSeconds: state.simulatedElapsedSeconds })
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to resume tracking')
    }
  },

  setPlaybackSpeed: async (speed) => {
    const { raceId, editionId } = get()
    if (!raceId || !editionId) return
    try {
      const tracking = getService('tracking')
      const state = await tracking.setPlaybackSpeed(raceId, editionId, speed)
      set({ playbackSpeed: state.playbackSpeed })
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to set playback speed')
    }
  },

  seekTo: async (seconds) => {
    const { raceId, editionId } = get()
    if (!raceId || !editionId) return
    set({ isLoading: true })
    try {
      const tracking = getService('tracking')
      const state = await tracking.seekTo(raceId, editionId, seconds)
      const positions = await tracking.getRunnerPositions(raceId, editionId)
      set({
        elapsedSeconds: state.simulatedElapsedSeconds,
        runnerPositions: positions,
        isLoading: false,
      })
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to seek')
      set({ isLoading: false })
    }
  },

  selectRunner: (runnerId) => set({ selectedRunnerId: runnerId }),

  updatePositions: (positions) => set({ runnerPositions: positions }),

  addEvent: (event) =>
    set((s) => ({ recentEvents: [event, ...s.recentEvents].slice(0, 50) })),
}))
