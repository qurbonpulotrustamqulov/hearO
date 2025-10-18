import type { BaseFilter } from '@/types'
import http from '@/service/http'

export interface Assignment {
  id: number
  student: number
  teacher_id: number
  lesson: number
  begin_time: string
  end_time: string
  passing_score: number
  lesson_full: {
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
  status: string
}

export interface AssignmentDetail extends Assignment {
  student_full: {
    id: number
    email: string
    username: string
    first_name: string
    last_name: string
    teacher_id: number
    gender: string
    image: string | null
  }
}

export interface PaginatedAssignments {
  count: number
  next: string | null
  previous: string | null
  results: Assignment[]
}

export interface AssignmentsFilter extends BaseFilter {
  status?: string
}

export const getAssignments = async (filter: AssignmentsFilter) => {
  return await http.get<PaginatedAssignments>('/assignments/', {
    params: filter,
  })
}

export const getAssignmentById = async (id: number) => {
  return await http.get<AssignmentDetail>(`/assignments/${id}/`)
}
