import { useQuery } from '@tanstack/vue-query'
import { getNextPracticeItem } from '../api/practice.api'
import type { PracticeNextItemResponse } from '../types'
import { computed, type Ref, unref } from 'vue'

export const useNextPracticeItem = (
  easyMode: boolean | Ref<boolean> = false,
  currentItemId?: number | Ref<number | undefined>,
  enabled: boolean = true
) => {
  const easyModeValue = computed(() => unref(easyMode))
  const currentItemIdValue = computed(() => unref(currentItemId))

  return useQuery<PracticeNextItemResponse | null>({
    queryKey: ['practice', 'next-item', easyModeValue, currentItemIdValue],
    queryFn: () =>
      getNextPracticeItem(currentItemIdValue.value, easyModeValue.value),
    enabled,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
