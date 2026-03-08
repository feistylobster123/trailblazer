import { useEffect } from 'react'
import { useTrackingStore } from '@/stores/tracking.store'

export function useTracking(raceId?: string) {
  const store = useTrackingStore()

  useEffect(() => {
    if (!raceId) return

    const unsubscribe = store.subscribe(raceId)

    return () => {
      unsubscribe()
    }
  }, [raceId])

  return {
    // State
    trackingState: store.trackingState,
    runnerPositions: store.runnerPositions,
    recentEvents: store.recentEvents,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    startSimulation: store.startSimulation,
    pauseSimulation: store.pauseSimulation,
    resumeSimulation: store.resumeSimulation,
    setPlaybackSpeed: store.setPlaybackSpeed,
    seekTo: store.seekTo,
    getRunnerPosition: store.getRunnerPosition,
  }
}
