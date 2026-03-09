import { create } from 'zustand'
import { getService } from '@/services/index'
import type { RaceSummary, Race, CourseData } from '@/services/interfaces/race.service'
import type { RaceListFilter } from '@/types/race'

interface RaceState {
  races: RaceSummary[]
  featuredRaces: RaceSummary[]
  selectedRace: Race | null
  courseData: CourseData | null
  filters: RaceListFilter
  isLoading: boolean
  error: string | null
  fetchRaces: () => Promise<void>
  fetchFeaturedRaces: () => Promise<void>
  fetchRace: (raceId: string) => Promise<void>
  fetchCourseData: (raceId: string) => Promise<void>
  setFilters: (filters: Partial<RaceListFilter>) => void
  clearSelectedRace: () => void
}

const DEFAULT_FILTERS: RaceListFilter = {}

export const useRaceStore = create<RaceState>((set, get) => ({
  races: [],
  featuredRaces: [],
  selectedRace: null,
  courseData: null,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  error: null,

  fetchRaces: async () => {
    set({ isLoading: true, error: null })
    try {
      const race = getService('race')
      const { filters } = get()
      const params: Parameters<typeof race.listRaces>[0] = {}
      if (filters.search) params.query = filters.search
      if (filters.category) params.distance = [filters.category as import('@/services/interfaces/race.service').RaceDistance]
      if (filters.status) params.status = [filters.status as import('@/services/interfaces/race.service').RaceStatus]
      const result = await race.listRaces(params)
      set({ races: result.items, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch races'
      set({ error: message, isLoading: false })
    }
  },

  fetchFeaturedRaces: async () => {
    set({ isLoading: true, error: null })
    try {
      const race = getService('race')
      const featured = await race.getFeaturedRaces()
      set({ featuredRaces: featured, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch featured races'
      set({ error: message, isLoading: false })
    }
  },

  fetchRace: async (raceId) => {
    // Skip if already loaded for this race (prevents double-fetch from
    // route loader + useEffect, which would flash isLoading: true)
    const { selectedRace } = get()
    if (selectedRace?.slug === raceId && !get().error) return

    // Keep old selectedRace visible during transition to avoid skeleton flash.
    // Only clear courseData since it's edition-specific.
    set({ isLoading: true, error: null, courseData: null })
    try {
      const race = getService('race')
      const result = await race.getRace(raceId)
      set({ selectedRace: result, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch race'
      set({ error: message, isLoading: false, selectedRace: null })
    }
  },

  fetchCourseData: async (raceId) => {
    set({ isLoading: true, error: null })
    try {
      const race = getService('race')
      const { selectedRace } = get()
      const editionId = selectedRace?.currentEdition?.id ?? selectedRace?.editions?.[0]?.id ?? ''
      const course = await race.getCourseData(raceId, editionId)
      set({ courseData: course, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch course data'
      set({ error: message, isLoading: false })
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  clearSelectedRace: () => set({ selectedRace: null, courseData: null }),
}))
