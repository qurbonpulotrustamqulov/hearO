import { ref, computed } from 'vue'
import type { User } from '@/pages/auth/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
}

const state = ref<AuthState>({
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  user: null,
})

export const useAuthStore = () => {
  const setTokens = (access: string, refresh: string) => {
    state.value.accessToken = access
    state.value.refreshToken = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  const clearTokens = () => {
    state.value.accessToken = null
    state.value.refreshToken = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('remember_me')
  }

  const setUser = (user: User) => {
    state.value.user = user
  }

  const clearUser = () => {
    state.value.user = null
  }

  const getToken = () => {
    return state.value.accessToken || localStorage.getItem('access_token')
  }

  const isAuthenticated = () => {
    return !!state.value.accessToken
  }

  const isAdmin = () => {
    // Check if user has admin privileges
    // You should implement this based on your user model
    // For now, we'll check if the user has admin role in their profile
    return state.value.user?.is_superuser || false
  }

  const isTeacher = () => {
    return state.value.user?.is_staff || false
  }

  const logout = () => {
    clearTokens()
    clearUser()
  }

  return {
    // State - return reactive references
    accessToken: computed(() => state.value.accessToken),
    refreshToken: computed(() => state.value.refreshToken),
    user: computed(() => state.value.user),

    // Methods
    setTokens,
    clearTokens,
    setUser,
    clearUser,
    isAuthenticated,
    isAdmin,
    isTeacher,
    logout,
    getToken,
  }
}
