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
    race: store.selectedRace,
    courseData: store.courseData,
    isLoading: store.isDetailLoading,
    error: store.error,
  }
}

export function useRaceList() {
  // Use individual selectors so this hook only re-renders when list-related
  // state changes. Without selectors, any store mutation (e.g. fetchRace
  // setting isDetailLoading) would trigger a re-render of the LandingPage,
  // flipping cards to skeletons and detaching the hero DOM node before the
  // view transition captures the old snapshot.
  const races = useRaceStore(s => s.races)
  const featuredRaces = useRaceStore(s => s.featuredRaces)
  const isLoading = useRaceStore(s => s.isLoading)
  const fetchRaces = useRaceStore(s => s.fetchRaces)
  const fetchFeaturedRaces = useRaceStore(s => s.fetchFeaturedRaces)
  const setStoreFilters = useRaceStore(s => s.setFilters)

  const [filters, setFilters] = useState<RaceSearchParams>({})

  useEffect(() => {
    if (filters.query) setStoreFilters({ search: filters.query })
    fetchRaces()
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchFeaturedRaces()
  }, [])

  return {
    races,
    featuredRaces,
    filters,
    setFilters,
    isLoading,
  }
}
