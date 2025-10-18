import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'
import router from '@/router'

// Create axios instance
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
})

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token directly from localStorage as fallback
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response
  },
  (error: AxiosError) => {
    const status = error?.response?.status

    switch (status) {
      case 401:
        try {
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/auth/login')
        } catch {
          window.location.href = '/auth/login'
        }
        break
      case 403:
        console.error('Forbidden: Insufficient permissions')
        break
      case 404:
        console.error('Not found:', error.config?.url)
        break
      case 500:
        console.error('Server error')
        break
      default:
        console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default http
