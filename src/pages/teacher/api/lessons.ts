import type { BaseFilter } from '@/types.ts'
import http from '@/service/http'
import type { ILesson } from '@/pages/lessons/types.ts'

export interface LessonsFilter extends BaseFilter {
  group?: number
  search?: string
}

export interface LessonsRes {
  count: number
  results: ILesson[]
}

export interface CreateLessonRequest {
  title: string
  group: number
  lesson_type: 'simple' | 'tutorial'
}

export interface UpdateLessonRequest {
  name: string
  description?: string
}

export const getLessons = async (filter: LessonsFilter) => {
  const res = await http.get<LessonsRes>('/backoffice/lessons/', {
    params: {
      ...filter,
    },
  })
  return res.data
}

export const createLesson = async (data: CreateLessonRequest) => {
  const res = await http.post<ILesson>('/backoffice/lessons/', data)
  return res.data
}

export const updateLesson = async (id: number, data: UpdateLessonRequest) => {
  const res = await http.patch<ILesson>(`/backoffice/lessons/${id}/`, data)
  return res.data
}

export const deleteLesson = async (id: number) => {
  const res = await http.delete(`/backoffice/lessons/${id}/`)
  return res.data
}
