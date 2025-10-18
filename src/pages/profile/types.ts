export interface Profile {
  is_staff: boolean
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  gender?: 'male' | 'female' | null
  bio?: string | null
  image?: string | null
  date_joined: string
  telegram_id?: string | null
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  gender?: 'male' | 'female' | null
  image?: File | null
}
