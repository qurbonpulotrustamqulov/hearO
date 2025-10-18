import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, unref, type Ref } from 'vue'
import {
  getAdminLessonGroups,
  getAdminLessonGroupById,
  createAdminLessonGroup,
  updateAdminLessonGroup,
  patchAdminLessonGroup,
  deleteAdminLessonGroup,
  getAdminLessons,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
  getAdminLessonStatistics,
  getAdminLessonItems,
  getAdminLessonItemById,
  createAdminLessonItem,
  updateAdminLessonItem,
  deleteAdminLessonItem,
  getAdminCartoons,
  getAdminCartoonById,
  createAdminCartoon,
  updateAdminCartoon,
  deleteAdminCartoon,
  getAdminPracticeItems,
  getAdminPracticeItemById,
  createAdminPracticeItem,
  updateAdminPracticeItem,
  deleteAdminPracticeItem,
  getAdminPracticeItemsStatistics,
  getAdminAssignments,
  getAdminAssignmentById,
  createAdminAssignment,
  updateAdminAssignment,
  patchAdminAssignment,
  deleteAdminAssignment,
  getAdminTeachers,
  createAdminTeacher,
  updateAdminTeacher,
  patchAdminTeacher,
  deleteAdminTeacher,
} from '../api/admin.api'
import type {
  AdminLessonGroupCreate,
  AdminLessonGroupUpdate,
  AdminLessonCreate,
  AdminLessonUpdate,
  AdminLessonItemCreate,
  AdminLessonItemUpdate,
  AdminCartoonCreate,
  AdminCartoonUpdate,
  AdminPracticeItemCreate,
  AdminPracticeItemUpdate,
  AdminAssignmentCreate,
  AdminAssignmentUpdate,
  AdminTeacher,
  AdminTeacherCreate,
  AdminTeacherUpdate,
} from '../types'

// Lesson Groups
export const useAdminLessonGroups = (params?: {
  page?: number
  search?: string
  ordering?: string
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: ['admin-lesson-groups', params],
    queryFn: () => getAdminLessonGroups(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminLessonGroupById = (id: number) => {
  return useQuery({
    queryKey: ['admin-lesson-group', id],
    queryFn: () => getAdminLessonGroupById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAdminLessonGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminLessonGroupCreate) => createAdminLessonGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-groups'] })
    },
  })
}

export const useUpdateAdminLessonGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminLessonGroupUpdate }) =>
      updateAdminLessonGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-groups'] })
    },
  })
}

export const usePatchAdminLessonGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<AdminLessonGroupUpdate>
    }) => patchAdminLessonGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-groups'] })
    },
  })
}

export const useDeleteAdminLessonGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAdminLessonGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-groups'] })
    },
  })
}

// Lessons
export const useAdminLessons = (params?: {
  search?: string | Ref<string>
  group?: string | Ref<string>
  lesson_type?: 'simple' | 'tutorial' | Ref<'simple' | 'tutorial' | ''>
  order?: string | Ref<string>
  teacher?: string | Ref<string>
  ordering?: string | Ref<string>
  limit?: number | Ref<number>
  offset?: number | Ref<number>
  group_id?: number | Ref<number | undefined>
}) => {
  const reactiveParams = computed(() => ({
    search: unref(params?.search) || undefined,
    group: unref(params?.group) || undefined,
    lesson_type:
      (unref(params?.lesson_type) as 'simple' | 'tutorial' | '') || undefined,
    order: unref(params?.order) || undefined,
    teacher: unref(params?.teacher) || undefined,
    ordering: unref(params?.ordering) || undefined,
    limit: unref(params?.limit) as number | undefined,
    offset: unref(params?.offset) as number | undefined,
    group_id: unref(params?.group_id) as number | undefined,
  }))
  return useQuery({
    queryKey: ['admin-lessons', reactiveParams],
    queryFn: () => getAdminLessons(reactiveParams.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAdminLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminLessonCreate) => createAdminLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] })
    },
  })
}

export const useUpdateAdminLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminLessonUpdate }) =>
      updateAdminLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] })
    },
  })
}

export const useDeleteAdminLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAdminLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons'] })
    },
  })
}

// Cartoons
export const useAdminCartoons = (params?: {
  page?: number
  search?: string
  ordering?: string
  limit?: number
  offset?: number
  created_after?: string
  created_before?: string
}) => {
  return useQuery({
    queryKey: ['admin-cartoons', params],
    queryFn: () => getAdminCartoons(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminCartoonById = (id: number) => {
  return useQuery({
    queryKey: ['admin-cartoon', id],
    queryFn: () => getAdminCartoonById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAdminCartoon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminCartoonCreate) => createAdminCartoon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cartoons'] })
    },
  })
}

export const useUpdateAdminCartoon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminCartoonUpdate }) =>
      updateAdminCartoon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cartoons'] })
    },
  })
}

export const useDeleteAdminCartoon = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAdminCartoon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cartoons'] })
    },
  })
}

// Practice Items
export const useAdminPracticeItems = (params?: {
  page?: number
  search?: string
  type?: 'tts' | 'stt'
  difficulty?: string
  difficulty_min?: number
  difficulty_max?: number
  has_audio?: boolean
  has_image?: boolean
  is_active?: boolean
}) => {
  return useQuery({
    queryKey: ['admin-practice-items', params],
    queryFn: () => getAdminPracticeItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminPracticeItemById = (id: number) => {
  return useQuery({
    queryKey: ['admin-practice-item', id],
    queryFn: () => getAdminPracticeItemById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAdminPracticeItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminPracticeItemCreate) =>
      createAdminPracticeItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-practice-items'] })
    },
  })
}

export const useUpdateAdminPracticeItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminPracticeItemUpdate }) =>
      updateAdminPracticeItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-practice-items'] })
    },
  })
}

export const useDeleteAdminPracticeItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAdminPracticeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-practice-items'] })
    },
  })
}

// Lesson Items
export const useAdminLessonItems = (params?: {
  page?: number
  search?: string
  lesson_id?: number
  group_id?: number
  type?: 'tts' | 'tutorial'
  has_audio?: boolean
  has_image?: boolean
}) => {
  return useQuery({
    queryKey: ['admin-lesson-items', params],
    queryFn: () => getAdminLessonItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminLessonItemById = (id: number) => {
  return useQuery({
    queryKey: ['admin-lesson-item', id],
    queryFn: () => getAdminLessonItemById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAdminLessonItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminLessonItemCreate) => createAdminLessonItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-items'] })
    },
  })
}

export const useUpdateAdminLessonItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminLessonItemUpdate }) =>
      updateAdminLessonItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-items'] })
    },
  })
}

export const useDeleteAdminLessonItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAdminLessonItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-items'] })
    },
  })
}

// Lesson Statistics
export const useAdminLessonStatistics = (id: Ref<number | null> | number) => {
  return useQuery({
    queryKey: ['admin-lesson-statistics', computed(() => unref(id))],
    queryFn: () => {
      const lessonId = unref(id)
      if (!lessonId) throw new Error('Lesson ID is required')
      return getAdminLessonStatistics(lessonId)
    },
    enabled: computed(() => !!unref(id)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Practice Items Statistics
export const useAdminPracticeItemsStatistics = () => {
  return useQuery({
    queryKey: ['admin-practice-items-statistics'],
    queryFn: () => getAdminPracticeItemsStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Assignments
export const useAdminAssignments = (params?: {
  search?: string
  ordering?: string
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: ['admin-assignments', params],
    queryFn: () => getAdminAssignments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAdminAssignmentById = (id: number) => {
  return useQuery({
    queryKey: ['admin-assignment', id],
    queryFn: () => getAdminAssignmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateAdminAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdminAssignmentCreate) => createAdminAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] })
    },
  })
}

export const useUpdateAdminAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminAssignmentUpdate }) =>
      updateAdminAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] })
    },
  })
}

export const usePatchAdminAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<AdminAssignmentUpdate>
    }) => patchAdminAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] })
    },
  })
}

export const useDeleteAdminAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAdminAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] })
    },
  })
}

// Teachers
export const useAdminTeachers = () => {
  return useQuery<AdminTeacher[]>({
    queryKey: ['admin-teachers'],
    queryFn: () => getAdminTeachers(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateAdminTeacher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminTeacherCreate) => createAdminTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
    },
  })
}

export const useUpdateAdminTeacher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminTeacherUpdate }) =>
      updateAdminTeacher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
    },
  })
}

export const usePatchAdminTeacher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<AdminTeacherUpdate>
    }) => patchAdminTeacher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
    },
  })
}

export const useDeleteAdminTeacher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAdminTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
    },
  })
}
