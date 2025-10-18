import { useQuery } from '@tanstack/vue-query'
import {
  getAdminStats,
  getUserActivity,
  getLessonStats,
} from '../api/admin.api'

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getAdminStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useUserActivity = (params?: { page?: number; days?: number }) => {
  return useQuery({
    queryKey: ['admin-user-activity', params],
    queryFn: () => getUserActivity(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useLessonStats = (params?: {
  page?: number
  group_id?: number
}) => {
  return useQuery({
    queryKey: ['admin-lesson-stats', params],
    queryFn: () => getLessonStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
