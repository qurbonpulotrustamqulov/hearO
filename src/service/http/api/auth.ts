import { useMutation } from '@tanstack/vue-query'
import http from '@/service/http'

export interface LoginData {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export function login() {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: (data: LoginData) => {
      return http.post<LoginResponse>('/auth/login/', data)
    },
  })
}
