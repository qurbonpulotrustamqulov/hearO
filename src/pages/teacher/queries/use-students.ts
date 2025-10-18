import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  type CreateStudentReq,
  type StudentsFilter,
} from '@/pages/teacher/api/students.ts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStudents = (filter: StudentsFilter) => {
  return useQuery({
    queryKey: ['students', filter],
    queryFn: () => getStudents(filter),
    staleTime: 5 * 60 * 1000,
  })
}

export const useStudentById = (id: number) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => getStudentById(id),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStudentReq) => createStudent(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<CreateStudentReq>
    }) => updateStudent(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
