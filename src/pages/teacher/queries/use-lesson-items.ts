import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import {
  getLessonItems,
  createLessonItem,
  updateLessonItem,
  deleteLessonItem,
  type LessonItemsFilter,
  type UpdateLessonItemRequest,
} from '@/pages/teacher/api/lesson-items'

export const useLessonItems = (filter: Ref<LessonItemsFilter>) => {
  return useQuery({
    queryKey: ['lesson-items', filter],
    queryFn: () => getLessonItems(filter.value),
    enabled: computed(() => !!filter.value.lesson),
  })
}

export const useCreateLessonItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createLessonItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-items'] })
    },
  })
}

export const useUpdateLessonItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLessonItemRequest }) =>
      updateLessonItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-items'] })
    },
  })
}

export const useDeleteLessonItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteLessonItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-items'] })
    },
  })
}
