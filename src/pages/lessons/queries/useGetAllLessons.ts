import { useQuery } from '@tanstack/vue-query'
import { getAllLessons } from '@/pages/lessons/api/lessons.api.ts'

export const useGetAllLessons = () => {
  return useQuery({
    queryKey: ['all-lessons'],
    queryFn: getAllLessons,
  })
}
