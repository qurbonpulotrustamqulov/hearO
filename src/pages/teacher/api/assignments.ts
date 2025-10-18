import type { BaseFilter } from '@/types.ts'
import http from '@/service/http'

export interface AssignmentsFilter extends BaseFilter {
  student?: number
  status?: string
}

export interface LessonFull {
  id: number
  group: number
  group_name: string
  lesson_type: string
  title: string
  order: number
  items_count: number
  items: unknown[]
  teacher_id: number
}

export interface StudentFull {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  teacher_id: number
  gender: string
  image: string | null
}

export interface AssignmentRes {
  id: number
  student: number
  teacher_id: number
  lesson: number
  begin_time: string
  end_time: string
  passing_score: number
  lesson_full: LessonFull
  student_full: StudentFull
  status: string
}

export interface AssignmentReq {
  student: number
  lesson: number
  begin_time: string
  end_time: string
  passing_score: number
}

export interface AssignmentsRes {
  count: number
  next: string | null
  previous: string | null
  results: AssignmentRes[]
}

export const getAssignments = async (filter: AssignmentsFilter) => {
  return await http.get<AssignmentsRes>('/backoffice/assignments/', {
    params: {
      ...filter,
    },
  })
}

export const createAssignment = async (data: AssignmentReq) => {
  const res = await http.post<AssignmentRes>('/backoffice/assignments/', data)
  return res.data
}

export const updateAssignment = async (
  id: number,
  data: Partial<AssignmentReq>
) => {
  const res = await http.patch<AssignmentRes>(
    `/backoffice/assignments/${id}/`,
    data
  )
  return res.data
}

export const deleteAssignment = async (id: number) => {
  const res = await http.delete(`/backoffice/assignments/${id}/`)
  return res.data
}
