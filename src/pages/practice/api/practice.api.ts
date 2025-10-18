import http from '@/service/http'
import type {
  PracticeNextItemResponse,
  UpdatePracticeItemStateResponse,
} from '../types'

export const getNextPracticeItem = async (
  currentItemId?: number,
  easyMode?: boolean
): Promise<PracticeNextItemResponse | null> => {
  const params = new URLSearchParams()

  if (currentItemId !== undefined) {
    params.append('current_item_id', currentItemId.toString())
  }

  if (easyMode !== undefined) {
    params.append('easy_mode', easyMode ? 'Y' : 'N')
  }

  const url = `/practice/next-item/${params.toString() ? '?' + params.toString() : ''}`
  return http.get<PracticeNextItemResponse>(url).then((res) => {
    const data = res.data
    // If API returns empty object {}, treat it as no items available
    if (!data || !data.id) {
      return null
    }
    return data
  })
}

export const updatePracticeItemState = async (
  practiceItemId: number,
  audioBlob: Blob
): Promise<UpdatePracticeItemStateResponse> => {
  const formData = new FormData()
  formData.append('practice_item', practiceItemId.toString())
  formData.append('user_audio', audioBlob, 'recording.wav')

  return http
    .post<UpdatePracticeItemStateResponse>(
      '/practice/update-state/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    .then((res) => res.data)
}
