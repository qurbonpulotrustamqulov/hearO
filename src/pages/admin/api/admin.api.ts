import http from '@/service/http'
import type {
  AdminUser,
  AdminUserUpdateRequest,
  AdminStats,
  UserActivity,
  LessonStats,
  AdminLessonGroup,
  AdminLesson,
  AdminLessonGroupCreate,
  AdminLessonGroupUpdate,
  AdminLessonCreate,
  AdminLessonUpdate,
  AdminCartoon,
  AdminCartoonCreate,
  AdminCartoonUpdate,
  AdminPracticeItem,
  AdminPracticeItemCreate,
  AdminPracticeItemUpdate,
  AdminLessonItem,
  AdminLessonItemCreate,
  AdminLessonItemUpdate,
  PaginatedResponse,
  AdminLessonGroupDetail,
  AdminAssignment,
  AdminAssignmentCreate,
  AdminAssignmentUpdate,
  AdminTeacher,
  AdminTeacherCreate,
  AdminTeacherUpdate,
  AdminStudent,
  AdminStudentCreate,
  AdminStudentUpdate,
} from '../types'

// User Management APIs
export const getAdminUsers = async (params?: {
  page?: number
  search?: string
  is_active?: boolean
}): Promise<PaginatedResponse<AdminUser>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.is_active !== undefined)
    queryParams.append('is_active', params.is_active.toString())

  const url = `/backoffice/users/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return http.get<PaginatedResponse<AdminUser>>(url).then((res) => res.data)
}

export const getAdminUserById = async (id: number): Promise<AdminUser> => {
  return http.get<AdminUser>(`/backoffice/users/${id}/`).then((res) => res.data)
}

export const updateAdminUser = async (
  id: number,
  data: AdminUserUpdateRequest
): Promise<AdminUser> => {
  return http
    .patch<AdminUser>(`/backoffice/users/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminUser = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/users/${id}/`).then(() => {})
}

export const activateAdminUser = async (id: number): Promise<AdminUser> => {
  return http
    .post<AdminUser>(`/backoffice/users/${id}/activate/`)
    .then((res) => res.data)
}

export const deactivateAdminUser = async (id: number): Promise<AdminUser> => {
  return http
    .post<AdminUser>(`/backoffice/users/${id}/deactivate/`)
    .then((res) => res.data)
}

// Statistics APIs
export const getAdminStats = async (): Promise<AdminStats> => {
  return http.get<AdminStats>('/backoffice/stats/').then((res) => res.data)
}

export const getUserActivity = async (params?: {
  page?: number
  days?: number
}): Promise<PaginatedResponse<UserActivity>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.days) queryParams.append('days', params.days.toString())

  const url = `/backoffice/user-activity/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return http.get<PaginatedResponse<UserActivity>>(url).then((res) => res.data)
}

export const getLessonStats = async (params?: {
  page?: number
  group_id?: number
}): Promise<PaginatedResponse<LessonStats>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.group_id)
    queryParams.append('group_id', params.group_id.toString())

  const url = `/backoffice/lesson-stats/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return http.get<PaginatedResponse<LessonStats>>(url).then((res) => res.data)
}

// Content Management APIs
export const getAdminLessonGroups = async (params?: {
  page?: number
  search?: string
  ordering?: string
  limit?: number
  offset?: number
}): Promise<PaginatedResponse<AdminLessonGroup>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.ordering) queryParams.append('ordering', params.ordering)
  if (params?.limit !== undefined)
    queryParams.append('limit', String(params.limit))
  if (params?.offset !== undefined)
    queryParams.append('offset', String(params.offset))

  const url = `/backoffice/lesson-groups/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await http.get(url)

  // Handle both paginated and simple array responses
  if (Array.isArray(response.data)) {
    // If response is a simple array, convert to paginated format
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    }
  }

  return response.data
}

export const getAdminLessonGroupById = async (
  id: number
): Promise<AdminLessonGroupDetail> => {
  return http
    .get<AdminLessonGroupDetail>(`/backoffice/lesson-groups/${id}/`)
    .then((res) => res.data)
}

export const createAdminLessonGroup = async (
  data: AdminLessonGroupCreate
): Promise<AdminLessonGroup> => {
  return http
    .post<AdminLessonGroup>('/backoffice/lesson-groups/', data)
    .then((res) => res.data)
}

export const updateAdminLessonGroup = async (
  id: number,
  data: AdminLessonGroupUpdate
): Promise<AdminLessonGroup> => {
  return http
    .put<AdminLessonGroup>(`/backoffice/lesson-groups/${id}/`, data)
    .then((res) => res.data)
}

export const patchAdminLessonGroup = async (
  id: number,
  data: Partial<AdminLessonGroupUpdate>
): Promise<AdminLessonGroup> => {
  return http
    .patch<AdminLessonGroup>(`/backoffice/lesson-groups/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminLessonGroup = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/lesson-groups/${id}/`).then(() => {})
}

export const getAdminLessonGroupStatistics = async (
  id: number
): Promise<{
  lessons_count: number
  total_items_count: number
  avg_items_per_lesson: number
}> => {
  return http
    .get(`/backoffice/lesson-groups/${id}/statistics/`)
    .then((res) => res.data)
}

export const getAdminLessons = async (params?: {
  search?: string
  group?: string
  lesson_type?: 'simple' | 'tutorial'
  order?: string
  teacher?: string
  ordering?: string
  limit?: number
  offset?: number
  group_id?: number
}): Promise<PaginatedResponse<AdminLesson>> => {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.group) queryParams.append('group', params.group)
  if (params?.lesson_type) queryParams.append('lesson_type', params.lesson_type)
  if (params?.order) queryParams.append('order', params.order)
  if (params?.teacher) queryParams.append('teacher', params.teacher)
  if (params?.ordering) queryParams.append('ordering', params.ordering)
  if (params?.limit !== undefined)
    queryParams.append('limit', String(params.limit))
  if (params?.offset !== undefined)
    queryParams.append('offset', String(params.offset))
  if (params?.group_id !== undefined)
    queryParams.append('group_id', String(params.group_id))

  const url = `/backoffice/lessons/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return http.get<PaginatedResponse<AdminLesson>>(url).then((res) => res.data)
}

export const createAdminLesson = async (
  data: AdminLessonCreate
): Promise<AdminLesson> => {
  return http
    .post<AdminLesson>('/backoffice/lessons/', data)
    .then((res) => res.data)
}

export const updateAdminLesson = async (
  id: number,
  data: AdminLessonUpdate
): Promise<AdminLesson> => {
  return http
    .patch<AdminLesson>(`/backoffice/lessons/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminLesson = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/lessons/${id}/`).then(() => {})
}

// Cartoon Management APIs
export const getAdminCartoons = async (params?: {
  page?: number
  search?: string
  ordering?: string
  limit?: number
  offset?: number
  created_after?: string // YYYY-MM-DD
  created_before?: string // YYYY-MM-DD
}): Promise<PaginatedResponse<AdminCartoon>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.ordering) queryParams.append('ordering', params.ordering)
  if (params?.limit !== undefined)
    queryParams.append('limit', String(params.limit))
  if (params?.offset !== undefined)
    queryParams.append('offset', String(params.offset))
  if (params?.created_after)
    queryParams.append('created_after', params.created_after)
  if (params?.created_before)
    queryParams.append('created_before', params.created_before)

  const url = `/backoffice/cartoons/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await http.get(url)

  // Handle both paginated and simple array responses
  if (Array.isArray(response.data)) {
    // If response is a simple array, convert to paginated format
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    }
  }

  return response.data
}

export const getAdminCartoonById = async (
  id: number
): Promise<AdminCartoon> => {
  return http
    .get<AdminCartoon>(`/backoffice/cartoons/${id}/`)
    .then((res) => res.data)
}

export const createAdminCartoon = async (
  data: AdminCartoonCreate
): Promise<AdminCartoon> => {
  return http
    .post<AdminCartoon>('/backoffice/cartoons/', data)
    .then((res) => res.data)
}

export const updateAdminCartoon = async (
  id: number,
  data: AdminCartoonUpdate
): Promise<AdminCartoon> => {
  return http
    .put<AdminCartoon>(`/backoffice/cartoons/${id}/`, data)
    .then((res) => res.data)
}

export const patchAdminCartoon = async (
  id: number,
  data: Partial<AdminCartoonUpdate>
): Promise<AdminCartoon> => {
  return http
    .patch<AdminCartoon>(`/backoffice/cartoons/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminCartoon = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/cartoons/${id}/`).then(() => {})
}

// Practice Item Management APIs
export const getAdminPracticeItems = async (params?: {
  page?: number
  search?: string
  type?: 'tts' | 'stt'
  difficulty?: string
  difficulty_min?: number
  difficulty_max?: number
  has_audio?: boolean
  has_image?: boolean
  is_active?: boolean
}): Promise<PaginatedResponse<AdminPracticeItem>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.type) queryParams.append('type', params.type)
  if (params?.difficulty) queryParams.append('difficulty', params.difficulty)
  if (params?.difficulty_min !== undefined)
    queryParams.append('difficulty_min', params.difficulty_min.toString())
  if (params?.difficulty_max !== undefined)
    queryParams.append('difficulty_max', params.difficulty_max.toString())
  if (params?.has_audio !== undefined)
    queryParams.append('has_audio', params.has_audio.toString())
  if (params?.has_image !== undefined)
    queryParams.append('has_image', params.has_image.toString())
  if (params?.is_active !== undefined)
    queryParams.append('is_active', params.is_active.toString())

  const url = `/backoffice/practice-items/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return http
    .get<PaginatedResponse<AdminPracticeItem>>(url)
    .then((res) => res.data)
}

export const getAdminPracticeItemById = async (
  id: number
): Promise<AdminPracticeItem> => {
  return http
    .get<AdminPracticeItem>(`/backoffice/practice-items/${id}/`)
    .then((res) => res.data)
}

export const createAdminPracticeItem = async (
  data: AdminPracticeItemCreate
): Promise<AdminPracticeItem> => {
  return http
    .post<AdminPracticeItem>('/backoffice/practice-items/', data)
    .then((res) => res.data)
}

export const updateAdminPracticeItem = async (
  id: number,
  data: AdminPracticeItemUpdate
): Promise<AdminPracticeItem> => {
  return http
    .patch<AdminPracticeItem>(`/backoffice/practice-items/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminPracticeItem = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/practice-items/${id}/`).then(() => {})
}

export const getAdminPracticeItemsStatistics = async (): Promise<{
  total_items: number
  active_items: number
  total_attempts: number
  average_success_rate: number
}> => {
  return http
    .get('/backoffice/practice-items/statistics/')
    .then((res) => res.data)
}

// Lesson Item Management APIs
export const getAdminLessonItems = async (params?: {
  page?: number
  search?: string
  lesson_id?: number
  type?: 'tts' | 'tutorial'
  is_active?: boolean
}): Promise<PaginatedResponse<AdminLessonItem>> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.lesson_id)
    queryParams.append('lesson_id', params.lesson_id.toString())
  if (params?.type) queryParams.append('type', params.type)
  if (params?.is_active !== undefined)
    queryParams.append('is_active', params.is_active.toString())

  const url = `/backoffice/lesson-items/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return http
    .get<PaginatedResponse<AdminLessonItem>>(url)
    .then((res) => res.data)
}

export const getAdminLessonItemById = async (
  id: number
): Promise<AdminLessonItem> => {
  return http
    .get<AdminLessonItem>(`/backoffice/lesson-items/${id}/`)
    .then((res) => res.data)
}

export const createAdminLessonItem = async (
  data: AdminLessonItemCreate
): Promise<AdminLessonItem> => {
  return http
    .post<AdminLessonItem>('/backoffice/lesson-items/', data)
    .then((res) => res.data)
}

export const updateAdminLessonItem = async (
  id: number,
  data: AdminLessonItemUpdate
): Promise<AdminLessonItem> => {
  return http
    .put<AdminLessonItem>(`/backoffice/lesson-items/${id}/`, data)
    .then((res) => res.data)
}

export const patchAdminLessonItem = async (
  id: number,
  data: Partial<AdminLessonItemUpdate>
): Promise<AdminLessonItem> => {
  return http
    .patch<AdminLessonItem>(`/backoffice/lesson-items/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminLessonItem = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/lesson-items/${id}/`).then(() => {})
}

// Additional Lesson APIs
export const getAdminLessonById = async (id: number): Promise<AdminLesson> => {
  return http
    .get<AdminLesson>(`/backoffice/lessons/${id}/`)
    .then((res) => res.data)
}

export const getAdminLessonStatistics = async (
  id: number
): Promise<{
  total_items_count: number
  completed_items_count: number
  completion_rate: number
  average_score: number
}> => {
  return http
    .get(`/backoffice/lessons/${id}/statistics/`)
    .then((res) => res.data)
}

// Assignments APIs
export const getAdminAssignments = async (params?: {
  search?: string
  ordering?: string
  limit?: number
  offset?: number
}): Promise<PaginatedResponse<AdminAssignment> | AdminAssignment[]> => {
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.append('search', params.search)
  if (params?.ordering) queryParams.append('ordering', params.ordering)
  if (params?.limit !== undefined)
    queryParams.append('limit', String(params.limit))
  if (params?.offset !== undefined)
    queryParams.append('offset', String(params.offset))

  const url = `/backoffice/assignments/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const response = await http.get(url)

  // Support both array and paginated responses
  if (Array.isArray(response.data)) {
    return response.data as AdminAssignment[]
  }
  return response.data as PaginatedResponse<AdminAssignment>
}

export const getAdminAssignmentById = async (
  id: number
): Promise<AdminAssignment> => {
  return http
    .get<AdminAssignment>(`/backoffice/assignments/${id}/`)
    .then((res) => res.data)
}

export const createAdminAssignment = async (
  data: AdminAssignmentCreate
): Promise<AdminAssignment> => {
  return http
    .post<AdminAssignment>('/backoffice/assignments/', data)
    .then((res) => res.data)
}

export const updateAdminAssignment = async (
  id: number,
  data: AdminAssignmentUpdate
): Promise<AdminAssignment> => {
  return http
    .put<AdminAssignment>(`/backoffice/assignments/${id}/`, data)
    .then((res) => res.data)
}

export const patchAdminAssignment = async (
  id: number,
  data: Partial<AdminAssignmentUpdate>
): Promise<AdminAssignment> => {
  return http
    .patch<AdminAssignment>(`/backoffice/assignments/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminAssignment = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/assignments/${id}/`).then(() => {})
}

// Teachers APIs
export const getAdminTeachers = async (): Promise<AdminTeacher[]> => {
  return http
    .get<AdminTeacher[]>('/backoffice/users/teachers/')
    .then((res) => res.data)
}

export const getAdminTeacherById = async (
  id: number
): Promise<AdminTeacher> => {
  return http
    .get<AdminTeacher>(`/backoffice/users/teachers/${id}/`)
    .then((res) => res.data)
}

export const createAdminTeacher = async (
  data: AdminTeacherCreate
): Promise<AdminTeacher> => {
  return http
    .post<AdminTeacher>('/backoffice/users/teachers/', data)
    .then((res) => res.data)
}

export const updateAdminTeacher = async (
  id: number,
  data: AdminTeacherUpdate
): Promise<AdminTeacher> => {
  return http
    .put<AdminTeacher>(`/backoffice/users/teachers/${id}/`, data)
    .then((res) => res.data)
}

export const patchAdminTeacher = async (
  id: number,
  data: Partial<AdminTeacherUpdate>
): Promise<AdminTeacher> => {
  return http
    .patch<AdminTeacher>(`/backoffice/users/teachers/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminTeacher = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/users/teachers/${id}/`).then(() => {})
}

// Students APIs
export const getAdminStudents = async (params?: {
  limit?: number
  offset?: number
  search?: string
}): Promise<PaginatedResponse<AdminStudent>> => {
  const queryParams = new URLSearchParams()
  if (params?.limit !== undefined)
    queryParams.append('limit', String(params.limit))
  if (params?.offset !== undefined)
    queryParams.append('offset', String(params.offset))
  if (params?.search) queryParams.append('search', params.search)
  const url = `/backoffice/users/students/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  return http.get<PaginatedResponse<AdminStudent>>(url).then((res) => res.data)
}

export const getAdminStudentById = async (
  id: number
): Promise<AdminStudent> => {
  return http
    .get<AdminStudent>(`/backoffice/users/students/${id}/`)
    .then((res) => res.data)
}

export const createAdminStudent = async (
  data: AdminStudentCreate
): Promise<AdminStudent> => {
  return http
    .post<AdminStudent>('/backoffice/users/students/', data)
    .then((res) => res.data)
}

export const updateAdminStudent = async (
  id: number,
  data: AdminStudentUpdate
): Promise<AdminStudent> => {
  return http
    .put<AdminStudent>(`/backoffice/users/students/${id}/`, data)
    .then((res) => res.data)
}

export const patchAdminStudent = async (
  id: number,
  data: Partial<AdminStudentUpdate>
): Promise<AdminStudent> => {
  return http
    .patch<AdminStudent>(`/backoffice/users/students/${id}/`, data)
    .then((res) => res.data)
}

export const deleteAdminStudent = async (id: number): Promise<void> => {
  return http.delete(`/backoffice/users/students/${id}/`).then(() => {})
}
