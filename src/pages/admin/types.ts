// Admin User Management Types
export interface AdminUser {
  id: number
  email: string
  first_name: string
  last_name: string
  username: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
  last_login: string | null
  telegram_id?: string | null
  gender?: 'male' | 'female' | null
  image?: string | null
}

export interface AdminUserUpdateRequest {
  first_name?: string
  last_name?: string
  email?: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
}

// Admin Statistics Types
export interface AdminStats {
  total_users: number
  active_users_today: number
  new_users_this_week: number
  total_lessons_completed: number
  average_completion_rate: number
  total_practice_sessions: number
  average_session_duration: number
}

export interface UserActivity {
  user_id: number
  user_name: string
  last_activity: string
  lessons_completed: number
  practice_sessions: number
  streak_days: number
}

export interface LessonStats {
  lesson_id: number
  lesson_name: string
  total_attempts: number
  successful_completions: number
  average_score: number
  completion_rate: number
}

// Content Management Types
export interface AdminLessonGroup {
  id: number
  name: string
  slug: string
  order?: number
  lessons_count: string
  total_items_count: string
}

export interface AdminLessonGroupDetail extends AdminLessonGroup {
  lessons: AdminLesson[]
}

export interface AdminLesson {
  id: number
  title: string
  description?: string
  group_id: number
  group_name: string
  is_active: boolean
  order: number
  total_items: number
  items_count?: number
  teacher_id?: number | null
  lesson_type?: 'simple' | 'tutorial'
  created_at: string
  updated_at: string
}

export interface AdminLessonGroupCreate {
  name: string
  slug: string
  order?: number
}

export interface AdminLessonGroupUpdate extends AdminLessonGroupCreate {
  id: number
}

export interface AdminLessonCreate {
  title: string
  description?: string
  group_id: number
  is_active?: boolean
  order?: number
  teacher_id?: number | null
  lesson_type?: 'simple' | 'tutorial'
}

export interface AdminLessonUpdate extends AdminLessonCreate {
  id: number
}

// Cartoon Management Types (matches /backoffice/cartoons/)
export interface AdminCartoon {
  id: number
  title: string
  link: string
  created_at: string
}

export interface AdminCartoonCreate {
  title: string
  link: string
}

export interface AdminCartoonUpdate extends AdminCartoonCreate {
  id: number
}

// Practice Item Management Types
export interface AdminPracticeItem {
  id: number
  word: string
  audio: string | null
  image: string | null
  type: 'tts' | 'stt'
  difficulty: number
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminPracticeItemCreate {
  word: string
  audio?: File | string | null
  image?: File | string | null
  type: 'tts' | 'stt'
  difficulty: number
  order?: number
  is_active?: boolean
}

export interface AdminPracticeItemUpdate extends AdminPracticeItemCreate {
  id: number
}

// Lesson Item Management Types
export interface AdminLessonItem {
  id: number
  word: string
  audio: string | null
  image: string | null
  type: 'tts' | 'tutorial'
  lesson_id: number
  lesson_title: string
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface AdminLessonItemCreate {
  word: string
  audio?: File | string | null
  image?: File | string | null
  type: 'tts' | 'tutorial'
  lesson_id: number
  is_active?: boolean
  order?: number
}

export interface AdminLessonItemUpdate extends AdminLessonItemCreate {
  id: number
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface APIError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

// Assignments (matches /backoffice/assignments/)
export interface AdminAssignment {
  id: number
  student: number
  teacher_id: number
  lesson: number
  begin_time: string
  end_time: string
  passing_score: number
  created_at?: string
  updated_at?: string
}

export interface AdminAssignmentCreate {
  student: number
  teacher_id: number
  lesson: number
  begin_time: string
  end_time: string
  passing_score: number
}

export interface AdminAssignmentUpdate extends AdminAssignmentCreate {
  id: number
}

// Teachers (matches /backoffice/users/teachers/)
export interface AdminTeacher {
  id: number
  email?: string | null
  username: string
  first_name?: string
  last_name?: string
  gender?: string
  image?: string | null
}

export interface AdminTeacherCreate {
  email?: string | null
  username: string
  first_name?: string
  last_name?: string
  gender?: string
  password: string
}

export interface AdminTeacherUpdate {
  email?: string | null
  username?: string
  first_name?: string
  last_name?: string
  gender?: string
  password?: string
}

// Students (matches /backoffice/users/students/)
export interface AdminStudent {
  id: number
  email?: string | null
  username: string
  first_name?: string
  last_name?: string
  gender?: string
  image?: string | null
  teacher_id?: number | null
}

export interface AdminStudentCreate {
  email?: string | null
  username: string
  first_name?: string
  last_name?: string
  gender?: string
  password: string
  teacher_id?: number | null
}

export interface AdminStudentUpdate {
  email?: string | null
  username?: string
  first_name?: string
  last_name?: string
  gender?: string
  password?: string
  teacher_id?: number | null
}
