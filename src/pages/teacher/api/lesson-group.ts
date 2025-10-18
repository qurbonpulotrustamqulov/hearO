import http from '@/service/http'
import type { LessonGroupRes } from '@/pages/lessons/types.ts'
import type { BaseFilter } from '@/types.ts'

export interface LessonGroupFilter extends BaseFilter {
  search?: string
}

export interface LessonGroupsRes {
  count: number
  results: LessonGroupRes[]
}

export interface CreateLessonGroupRequest {
  name: string
}

export const getLessonGroups = async (filter: LessonGroupFilter) => {
  const res = await http.get<LessonGroupsRes>('/backoffice/lesson-groups/', {
    params: filter,
  })
  return res.data
}

export const createLessonGroup = async (data: CreateLessonGroupRequest) => {
  const res = await http.post<LessonGroupRes>(
    '/backoffice/lesson-groups/',
    data
  )
  return res.data
}

export const updateLessonGroup = async (
  id: number,
  data: CreateLessonGroupRequest
) => {
  const res = await http.put<LessonGroupRes>(
    `/backoffice/lesson-groups/${id}/`,
    data
  )
  return res.data
}

export const deleteLessonGroup = async (id: number) => {
  const res = await http.delete(`/backoffice/lesson-groups/${id}/`)
  return res.data
}
