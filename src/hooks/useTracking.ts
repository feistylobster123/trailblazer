import { useEffect, useRef } from 'react'
import { useTrackingStore } from '@/stores/tracking.store'

export function useTracking(raceId?: string, editionId = 'current') {
  const store = useTrackingStore()
  const startedRef = useRef(false)

  useEffect(() => {
    if (!raceId || startedRef.current) return
    startedRef.current = true
    store.startTracking(raceId, editionId)
  }, [raceId, editionId])

  return {
    // State
    isPlaying: store.isPlaying,
    playbackSpeed: store.playbackSpeed,
    elapsedSeconds: store.elapsedSeconds,
    runnerPositions: store.runnerPositions,
    selectedRunnerId: store.selectedRunnerId,
    recentEvents: store.recentEvents,
    isLoading: store.isLoading,

    // Actions
    startTracking: store.startTracking,
    pauseTracking: store.pauseTracking,
    resumeTracking: store.resumeTracking,
    setPlaybackSpeed: store.setPlaybackSpeed,
    seekTo: store.seekTo,
    selectRunner: store.selectRunner,
  }
}
