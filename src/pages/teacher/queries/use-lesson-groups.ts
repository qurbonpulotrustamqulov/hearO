import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { ComputedRef } from 'vue'
import {
  createLessonGroup,
  type CreateLessonGroupRequest,
  getLessonGroups,
  type LessonGroupFilter,
  updateLessonGroup,
  deleteLessonGroup,
} from '@/pages/teacher/api/lesson-group.ts'

export const useLessonGroups = (filter: ComputedRef<LessonGroupFilter>) => {
  return useQuery({
    queryKey: ['lesson-groups', filter.value],
    queryFn: () => getLessonGroups(filter.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateLessonGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLessonGroupRequest) => createLessonGroup(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lesson-groups'] })
    },
  })
}

export const useUpdateLessonGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CreateLessonGroupRequest
    }) => updateLessonGroup(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lesson-groups'] })
    },
  })
}

export const useDeleteLessonGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteLessonGroup(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lesson-groups'] })
    },
  })
}
