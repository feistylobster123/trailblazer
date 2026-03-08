import { useState, useEffect, useCallback } from 'react'
import { getService } from '@/services/index'
import type {
  RaceResult,
  ResultsSummary,
  Split,
  SegmentAnalysis,
  PaceAnalysis,
  RunnerComparison,
} from '@/services/interfaces/results.service'

type ResultsState = {
  results: RaceResult[]
  summary: ResultsSummary | null
  isLoading: boolean
  error: Error | null
}

export function useResults(raceId?: string, year?: number) {
  const [state, setState] = useState<ResultsState>({
    results: [],
    summary: null,
    isLoading: false,
    error: null,
  })

  // Derive editionId from year when provided; fall back to current edition sentinel
  const editionId = year ? String(year) : 'current'

  useEffect(() => {
    if (!raceId) return

    let cancelled = false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const service = getService('results')

    Promise.all([
      service.getResults(raceId, editionId),
      service.getResultsSummary(raceId, editionId),
    ])
      .then(([paginated, summary]) => {
        if (cancelled) return
        setState({
          results: paginated.items,
          summary,
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
  }, [raceId, editionId])

  const fetchRunnerResult = useCallback(
    (runnerId: string): Promise<RaceResult> => {
      if (!raceId) return Promise.reject(new Error('raceId is required'))
      return getService('results').getRunnerResult(raceId, editionId, runnerId)
    },
    [raceId, editionId],
  )

  const compareRunners = useCallback(
    (runnerIds: string[]): Promise<RunnerComparison> => {
      if (!raceId) return Promise.reject(new Error('raceId is required'))
      return getService('results').compareRunners(raceId, editionId, runnerIds)
    },
    [raceId, editionId],
  )

  return {
    results: state.results,
    summary: state.summary,
    isLoading: state.isLoading,
    error: state.error,
    fetchRunnerResult,
    compareRunners,
  }
}

type RunnerResultState = {
  result: RaceResult | null
  splits: Split[]
  segmentAnalysis: SegmentAnalysis[]
  paceAnalysis: PaceAnalysis | null
  isLoading: boolean
  error: Error | null
}

export function useRunnerResult(raceId?: string, runnerId?: string) {
  const [state, setState] = useState<RunnerResultState>({
    result: null,
    splits: [],
    segmentAnalysis: [],
    paceAnalysis: null,
    isLoading: false,
    error: null,
  })

  const editionId = 'current'

  useEffect(() => {
    if (!raceId || !runnerId) return

    let cancelled = false

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const service = getService('results')

    Promise.all([
      service.getRunnerResult(raceId, editionId, runnerId),
      service.getSplits(raceId, editionId, runnerId),
      service.getSegmentAnalysis(raceId, editionId, runnerId),
      service.getPaceAnalysis(raceId, editionId, runnerId),
    ])
      .then(([result, splits, segmentAnalysis, paceAnalysis]) => {
        if (cancelled) return
        setState({
          result,
          splits,
          segmentAnalysis,
          paceAnalysis,
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
  }, [raceId, runnerId])

  return state
}
