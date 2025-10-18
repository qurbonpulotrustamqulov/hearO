import http from '@/service/http'
import type { BaseFilter, PaginatedResponse } from '@/types.ts'

export interface StudentsFilter extends BaseFilter {
  search?: string
}

export interface StudentRes {
  id: number
  email?: string
  username: string
  first_name: string
  last_name: string
  gender?: string
  image?: string | null
  password?: string
}

export interface CreateStudentReq {
  username: string
  first_name: string
  last_name: string
  gender?: string
  password?: string
  email?: string
}

export const getStudents = async (filter: StudentsFilter) => {
  const res = await http.get<PaginatedResponse<StudentRes>>(
    '/backoffice/users/students/',
    {
      params: filter,
    }
  )
  return res.data
}

export const createStudent = async (req: CreateStudentReq) => {
  const res = await http.post<StudentRes>('/backoffice/users/students/', req)
  return res.data
}

export const deleteStudent = async (id: number) => {
  const res = await http.delete(`/backoffice/users/students/${id}/`)
  return res.data
}

export const updateStudent = async (
  id: number,
  req: Partial<CreateStudentReq>
) => {
  const res = await http.patch<StudentRes>(
    `/backoffice/users/students/${id}/`,
    req
  )
  return res.data
}

export const getStudentById = async (id: number) => {
  const res = await http.get<StudentRes>(`/backoffice/users/students/${id}/`)
  return res.data
}
