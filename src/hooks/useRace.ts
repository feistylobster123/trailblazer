import { useEffect, useState } from 'react'
import { useRaceStore } from '@/stores/race.store'
import type { RaceSearchParams } from '@/services/interfaces/race.service'

export function useRace(raceId?: string) {
  const store = useRaceStore()

  useEffect(() => {
    if (!raceId) return
    store.fetchRace(raceId)
    store.fetchCourseData(raceId)
  }, [raceId])

  return {
    race: store.currentRace,
    courseData: store.currentCourseData,
    isLoading: store.isLoading,
    error: store.error,
  }
}

export function useRaceList() {
  const store = useRaceStore()
  const [filters, setFilters] = useState<RaceSearchParams>({})

  useEffect(() => {
    store.fetchRaces(filters)
  }, [JSON.stringify(filters)])

  useEffect(() => {
    store.fetchFeaturedRaces()
  }, [])

  return {
    races: store.races,
    featuredRaces: store.featuredRaces,
    filters,
    setFilters,
    isLoading: store.isLoading,
  }
}
