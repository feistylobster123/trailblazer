import { useState, useEffect } from 'react'
import { getService } from '@/services/index'
import type { Runner, RunnerStats, RaceHistoryEntry, PersonalRecord, PerformanceIndexPoint } from '@/services/interfaces/runner.service'

type RunnerState = {
  runner: Runner | null
  stats: RunnerStats | null
  raceHistory: RaceHistoryEntry[]
  personalRecords: PersonalRecord[]
  piHistory: PerformanceIndexPoint[]
  isLoading: boolean
  error: Error | null
}

export function useRunner(runnerId?: string) {
  const [state, setState] = useState<RunnerState>({
    runner: null,
    stats: null,
    raceHistory: [],
    personalRecords: [],
    piHistory: [],
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    if (!runnerId) return

    let cancelled = false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const service = getService('runner')

    Promise.all([
      service.getRunner(runnerId),
      service.getRunnerStats(runnerId),
      service.getRaceHistory(runnerId),
      service.getPersonalRecords(runnerId),
      service.getPerformanceIndexHistory(runnerId),
    ])
      .then(([runner, stats, historyResult, personalRecords, piHistory]) => {
        if (cancelled) return
        setState({
          runner,
          stats,
          raceHistory: historyResult.items,
          personalRecords,
          piHistory,
          isLoading: false,
          error: null,
        })
      })
      .catch(err => {
        if (cancelled) return
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }))
      })

    return () => {
      cancelled = true
    }
  }, [runnerId])

  return state
}
