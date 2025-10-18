import { useQuery } from '@tanstack/vue-query'
import { getLessonGroups } from '../api/lessonGroups.api'

export const useLessonGroups = () => {
  return useQuery({
    queryKey: ['lesson-groups'],
    queryFn: getLessonGroups,
    staleTime: 5 * 60 * 1000,
  })
}
