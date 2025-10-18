import http from '@/service/http'

export interface LessonGroup {
  id: number
  name: string
  slug: string
  order: number
  total_items_count: number
  completed_items_count: number
}

export const getLessonGroups = async (): Promise<LessonGroup[]> => {
  return http.get<LessonGroup[]>('/lesson-groups/').then((res) => res.data)
}
