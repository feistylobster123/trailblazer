import { useState, useEffect, useRef, useCallback } from 'react'
import { getService } from '@/services/index'
import type { CrewDashboard, RunnerETA, CrewAssignment } from '@/services/interfaces/crew.service'

export function useCrew(raceId?: string) {
  const [dashboard, setDashboard] = useState<CrewDashboard | null>(null)
  const [runnerETAs, setRunnerETAs] = useState<RunnerETA[]>([])
  const [assignments, setAssignments] = useState<CrewAssignment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    if (!raceId) return
    try {
      const crew = getService('crew')
      const [dash, etas, assigns] = await Promise.all([
        crew.getCrewDashboard(raceId),
        crew.getRunnerETAs(raceId),
        crew.getCrewAssignments(raceId),
      ])
      setDashboard(dash)
      setRunnerETAs(etas)
      setAssignments(assigns)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load crew data'
      setError(message)
    }
  }, [raceId])

  useEffect(() => {
    if (!raceId) return
    setIsLoading(true)
    setError(null)
    fetchData().finally(() => setIsLoading(false))

    // Auto-refresh ETAs every 30 seconds
    intervalRef.current = setInterval(fetchData, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [raceId, fetchData])

  const updateChecklist = useCallback(async (itemId: string, checked: boolean) => {
    if (!raceId) return
    try {
      const crew = getService('crew')
      await crew.updateChecklist(raceId, itemId, checked)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update checklist'
      setError(message)
    }
  }, [raceId])

  return { dashboard, runnerETAs, assignments, isLoading, error, updateChecklist, refresh: fetchData }
}
