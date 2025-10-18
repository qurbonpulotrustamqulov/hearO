import { useMutation } from '@tanstack/vue-query'
import { updatePracticeItemState } from '../api/practice.api'
import type { UpdatePracticeItemStateResponse } from '../types'

export const useUpdatePracticeState = () => {
  return useMutation<
    UpdatePracticeItemStateResponse,
    Error,
    { practiceItemId: number; audioBlob: Blob }
  >({
    mutationFn: ({ practiceItemId, audioBlob }) =>
      updatePracticeItemState(practiceItemId, audioBlob),
    // Removed onSuccess invalidation since we handle state updates locally
    // This prevents unnecessary refetching of the entire practice session
  })
}
