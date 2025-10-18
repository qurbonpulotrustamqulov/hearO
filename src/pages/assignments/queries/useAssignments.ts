import { useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { getAssignments, getAssignmentById } from '../api/assignments.api'

export const useAssignments = (
  params?:
    | Ref<{ limit?: number; offset?: number }>
    | { limit?: number; offset?: number }
) => {
  const computedParams = computed(() => {
    const p = params && 'value' in params ? params.value : params
    return p || { limit: undefined, offset: undefined }
  })

  return useQuery({
    queryKey: ['assignments', computedParams],
    queryFn: () =>
      getAssignments(computedParams.value as { limit: number; offset: number }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAssignmentById = (id: Ref<number> | number) => {
  const computedId = computed(() => {
    return typeof id === 'number' ? id : id.value
  })

  return useQuery({
    queryKey: ['assignment', computedId],
    queryFn: () => getAssignmentById(computedId.value),
    enabled: computed(() => !!computedId.value),
    staleTime: 5 * 60 * 1000,
  })
}
