import http from '@/service/http'
import type { LessonGroupType, ILesson } from '@/pages/lessons/types.ts'

export const getAllLessons = async (): Promise<ILesson[]> => {
  return http.get<ILesson[]>('/lessons/').then((res) => res.data)
}

export const getLessonById = async (id: number): Promise<ILesson | null> => {
  return http.get<ILesson>(`/lessons/${id}/`).then((res) => res.data)
}

export const getLessonGroups = async () => {
  return http.get<LessonGroupType[]>('/lesson-groups/').then((res) => res.data)
}
