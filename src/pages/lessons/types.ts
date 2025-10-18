export interface LessonGroupRes {
  id: number
  name: string
}

export interface LessonItemState {
  id: number
  state: 'wrong' | 'correct' | null
  wrong_count: number
  created_at: string
  last_submit_at: string
}

export interface ILessonItem {
  id: number
  type: 'tts' | 'tutorial'
  word: string
  audio: string | null
  image: string | null
  state: LessonItemState | null
}

export interface ILesson {
  id: number
  title: string
  items: ILessonItem[]
  group: LessonGroupRes
  completed_items_count: number
  items_count: number
}

export interface LessonGroupType {
  id: number
  name: string
  slug: string
  order: number
  total_items_count: number
  completed_items_count: number
}
