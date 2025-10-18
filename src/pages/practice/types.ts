export interface PracticeNextItemResponse {
  id: number
  word: string
  audio: string | null
  image: string | null
  difficulty: number
  type: 'stt' | 'tts'
  order: number
}

export interface UpdatePracticeItemStateRequest {
  practice_item: number
  user_audio: File
}

export interface UpdatePracticeItemStateResponse {
  user_text: string
  is_correct: boolean
  wrong_count: number
  total_attempts: number
  streak_days: number
}

export interface PracticeStats {
  streak_days: number
  total_attempts: number
  correct_attempts: number
  accuracy_percentage: number
}
