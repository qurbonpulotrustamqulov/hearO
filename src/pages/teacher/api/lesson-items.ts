import type { BaseFilter, PaginatedResponse } from '@/types.ts'
import http from '@/service/http'
export interface LessonItemsFilter extends BaseFilter {
  lesson: number
  search?: string
}

export interface LessonItemRes {
  id: number
  word: string
  audio: string | null
  image: string | null
}

export interface LessonItemRequest {
  type: 'tts'
  word: string
  lesson: number
  audio: File | null
  image: File | null
}

export interface UpdateLessonItemRequest {
  word?: string
  audio?: File | null
  image?: File | null
}

export const getLessonItems = async (filter: LessonItemsFilter) => {
  const res = await http.get<PaginatedResponse<LessonItemRes>>(
    '/backoffice/lesson-items/',
    {
      params: {
        ...filter,
      },
    }
  )

  return res.data
}

export const createLessonItem = async (data: LessonItemRequest) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.set(key, value)
  })
  const res = await http.post('/backoffice/lesson-items/', formData)
  return res.data
}

export const updateLessonItem = async (
  id: number,
  data: UpdateLessonItemRequest
) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value != undefined) {
      formData.set(key, value)
    }
  })
  const res = await http.patch(`/backoffice/lesson-items/${id}/`, formData)
  return res.data
}

export const deleteLessonItem = async (id: number) => {
  const res = await http.delete(`/backoffice/lesson-items/${id}/`)
  return res.data
}
