import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, unref, type Ref, type ComputedRef } from 'vue'
import {
  getAdminStudents,
  getAdminStudentById,
  createAdminStudent,
  updateAdminStudent,
  patchAdminStudent,
  deleteAdminStudent,
} from '../api/admin.api'
import type {
  AdminStudent,
  AdminStudentCreate,
  AdminStudentUpdate,
  PaginatedResponse,
} from '../types'

export const useAdminStudents = (
  params?:
    | { limit?: number; offset?: number; search?: string }
    | Ref<{ limit?: number; offset?: number; search?: string }>
    | ComputedRef<{ limit?: number; offset?: number; search?: string }>
) => {
  const key = computed(() => ['admin-students', unref(params) || {}])
  return useQuery<PaginatedResponse<AdminStudent>>({
    queryKey: key,
    queryFn: () => getAdminStudents(unref(params)),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export const useAdminStudentById = (id: number) => {
  return useQuery({
    queryKey: ['admin-student', id],
    queryFn: () => getAdminStudentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateAdminStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminStudentCreate) => createAdminStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
    },
  })
}

export const useUpdateAdminStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminStudentUpdate }) =>
      updateAdminStudent(id, data),
    onSuccess: (student: AdminStudent) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      queryClient.setQueryData(['admin-student', student.id], student)
    },
  })
}

export const usePatchAdminStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<AdminStudentUpdate>
    }) => patchAdminStudent(id, data),
    onSuccess: (student: AdminStudent) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      queryClient.setQueryData(['admin-student', student.id], student)
    },
  })
}

export const useDeleteAdminStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAdminStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
    },
  })
}
