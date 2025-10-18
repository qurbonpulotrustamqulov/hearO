import type { ComputedRef } from 'vue'
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  type LessonsFilter,
  type CreateLessonRequest,
  type UpdateLessonRequest,
} from '@/pages/teacher/api/lessons.ts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export const useLessons = (filter: ComputedRef<LessonsFilter>) => {
  return useQuery({
    queryKey: ['lessons', filter.value],
    queryFn: () => getLessons(filter.value),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateLesson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLessonRequest) => createLesson(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export const useUpdateLesson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLessonRequest }) =>
      updateLesson(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export const useDeleteLesson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteLesson(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}
