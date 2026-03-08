import { create } from 'zustand'
import { getService } from '@/services/index'
import type { UserProfile, RegisterPayload, UpdateProfilePayload } from '@/services/interfaces/auth.service'

const SESSION_STORAGE_KEY = 'trailblazer_session'

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (payload: RegisterPayload) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (data: UpdateProfilePayload) => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const auth = getService('auth')
      const result = await auth.login({ email, password })
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.session))
      set({ user: result.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ error: message, isLoading: false })
      return false
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const auth = getService('auth')
      const result = await auth.register(payload)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.session))
      set({ user: result.user, isAuthenticated: true, isLoading: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      set({ error: message, isLoading: false })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      const auth = getService('auth')
      await auth.logout()
    } catch {
      // Proceed with local logout even if the service call fails
    } finally {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateProfile: async (data) => {
    const { user } = get()
    if (!user) return
    set({ isLoading: true, error: null })
    try {
      const auth = getService('auth')
      const updated = await auth.updateProfile(user.id, data)
      set({ user: updated, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profile update failed'
      set({ error: message, isLoading: false })
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const auth = getService('auth')
      const session = await auth.getSession()
      if (!session) {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }
      const user = await auth.getCurrentUser()
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY)
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
