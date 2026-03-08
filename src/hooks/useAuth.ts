import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const store = useAuthStore()

  const isLoggedIn = store.isAuthenticated && store.user !== null

  const userName = store.user
    ? store.user.displayName || `${store.user.firstName} ${store.user.lastName}`.trim() || null
    : null

  const userInitials = store.user
    ? (() => {
        const first = store.user.firstName?.[0] ?? ''
        const last = store.user.lastName?.[0] ?? ''
        const initials = (first + last).toUpperCase()
        if (initials) return initials
        const display = store.user.displayName?.trim()
        if (display) {
          const parts = display.split(' ')
          return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase()
        }
        return null
      })()
    : null

  return {
    // Raw store state
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    login: store.login,
    logout: store.logout,
    register: store.register,
    updateProfile: store.updateProfile,
    clearError: store.clearError,

    // Convenience computed values
    isLoggedIn,
    userName,
    userInitials,
  }
}
