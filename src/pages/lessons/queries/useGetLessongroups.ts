import { useQuery } from '@tanstack/vue-query'
import { getLessonGroups } from '@/pages/lessons/api/lessons.api.ts'

export const useGetLessonGroups = () => {
  return useQuery({
    queryKey: ['lesson-groups'],
    queryFn: getLessonGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
