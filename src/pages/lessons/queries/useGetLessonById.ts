import { useQuery } from '@tanstack/vue-query'
import { getLessonById } from '@/pages/lessons/api/lessons.api.ts'

export const useGetLessonById = (id: number) => {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => getLessonById(id),
    enabled: !!id, // faqat id mavjud bo‘lsa so‘rov yuboradi
  })
}
