import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  mobileNavOpen: boolean
  theme: 'light' | 'dark'
  unit: 'metric' | 'imperial'

  toggleSidebar: () => void
  toggleMobileNav: () => void
  closeMobileNav: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setUnit: (unit: 'metric' | 'imperial') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      mobileNavOpen: false,
      theme: 'light',
      unit: 'imperial',

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      closeMobileNav: () => set({ mobileNavOpen: false }),
      setTheme: (theme) => set({ theme }),
      setUnit: (unit) => set({ unit }),
    }),
    {
      name: 'trailblazer-ui',
      partialize: (state) => ({
        theme: state.theme,
        unit: state.unit,
      }),
    }
  )
)
