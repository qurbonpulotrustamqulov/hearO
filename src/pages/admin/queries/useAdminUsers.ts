import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  activateAdminUser,
  deactivateAdminUser,
} from '../api/admin.api'
import type {
  AdminUserUpdateRequest,
  PaginatedResponse,
  AdminUser,
} from '../types'

export const useAdminUsers = (params?: {
  page?: number
  search?: string
  is_active?: boolean
}) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => getAdminUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminUserById = (id: number) => {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => getAdminUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserUpdateRequest }) =>
      updateAdminUser(id, data),
    onSuccess: (updatedUser) => {
      // Update the user in the list
      queryClient.setQueryData<PaginatedResponse<AdminUser>>(
        ['admin-users'],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            results: oldData.results.map((user) =>
              user.id === updatedUser.id ? updatedUser : user
            ),
          }
        }
      )

      // Update individual user cache
      queryClient.setQueryData(['admin-user', updatedUser.id], updatedUser)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: (_, deletedUserId) => {
      // Remove user from the list
      queryClient.setQueryData<PaginatedResponse<AdminUser>>(
        ['admin-users'],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            results: oldData.results.filter(
              (user) => user.id !== deletedUserId
            ),
            count: oldData.count - 1,
          }
        }
      )

      // Remove individual user cache
      queryClient.removeQueries({ queryKey: ['admin-user', deletedUserId] })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export const useActivateAdminUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => activateAdminUser(id),
    onSuccess: (updatedUser) => {
      // Update the user in the list
      queryClient.setQueryData<PaginatedResponse<AdminUser>>(
        ['admin-users'],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            results: oldData.results.map((user) =>
              user.id === updatedUser.id ? updatedUser : user
            ),
          }
        }
      )

      // Update individual user cache
      queryClient.setQueryData(['admin-user', updatedUser.id], updatedUser)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}

export const useDeactivateAdminUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deactivateAdminUser(id),
    onSuccess: (updatedUser) => {
      // Update the user in the list
      queryClient.setQueryData<PaginatedResponse<AdminUser>>(
        ['admin-users'],
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            results: oldData.results.map((user) =>
              user.id === updatedUser.id ? updatedUser : user
            ),
          }
        }
      )

      // Update individual user cache
      queryClient.setQueryData(['admin-user', updatedUser.id], updatedUser)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })
}
