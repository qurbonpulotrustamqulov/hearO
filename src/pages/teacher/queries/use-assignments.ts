import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type Ref } from 'vue'
import {
  getAssignments,
  createAssignment,
  type AssignmentsFilter,
} from '../api/assignments'

export const useAssignments = (
  filter: Ref<AssignmentsFilter> | AssignmentsFilter
) => {
  return useQuery({
    queryKey: ['assignments', filter],
    queryFn: () =>
      getAssignments(
        typeof filter === 'object' && 'value' in filter ? filter.value : filter
      ),
    select: (data) => data.data,
  })
}

export const useCreateAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}
