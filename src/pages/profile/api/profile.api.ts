import http from '@/service/http'
import type { Profile, UpdateProfileRequest } from '@/pages/profile/types'

export const getProfile = async (): Promise<Profile | null> => {
  return http.get<Profile>('/profile/').then((res) => res.data)
}

export const updateProfile = async (
  data: UpdateProfileRequest | FormData
): Promise<Profile> => {
  // If data is FormData (for image upload), send it directly
  if (data instanceof FormData) {
    return http
      .patch<Profile>('/profile/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data)
  }

  // Otherwise, handle regular profile update
  const formData = new FormData()

  if (data.first_name) {
    formData.append('first_name', data.first_name)
  }

  if (data.last_name) {
    formData.append('last_name', data.last_name)
  }

  if (data.gender) {
    formData.append('gender', data.gender)
  }

  if (data.image) {
    formData.append('image', data.image)
  }

  return http
    .patch<Profile>('/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data)
}
