import { useState, useEffect, useRef, useCallback } from 'react'
import { getService } from '@/services/index'
import type { CrewDashboard, RunnerETA, CrewAssignment } from '@/services/interfaces/crew.service'

export function useCrew(raceId?: string, editionId = 'current', runnerIds: string[] = []) {
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
      const dash = await crew.getCrewDashboard(raceId, editionId, runnerIds)
      setDashboard(dash)

      // Fetch ETAs for each runner
      const allETAs: RunnerETA[] = []
      const rids = runnerIds.length > 0 ? runnerIds : dash.runners.map(r => r.runnerId)
      for (const rid of rids) {
        try {
          const etas = await crew.getRunnerETAs(raceId, editionId, rid)
          allETAs.push(...etas)
        } catch {
          // Some runners may not have ETAs
        }
      }
      setRunnerETAs(allETAs)

      // Fetch assignments
      const allAssignments: CrewAssignment[] = []
      const assignRids = runnerIds.length > 0 ? runnerIds : dash.runners.map(r => r.runnerId).slice(0, 1)
      for (const rid of assignRids) {
        try {
          const assigns = await crew.getCrewAssignments(rid, raceId, editionId)
          allAssignments.push(...assigns)
        } catch {
          // Some runners may not have assignments
        }
      }
      setAssignments(allAssignments)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load crew data'
      setError(message)
    }
  }, [raceId, editionId, JSON.stringify(runnerIds)])

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
      await crew.updateChecklist(raceId, editionId, itemId, checked)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update checklist'
      setError(message)
    }
  }, [raceId, editionId])

  return { dashboard, runnerETAs, assignments, isLoading, error, updateChecklist, refresh: fetchData }
}
