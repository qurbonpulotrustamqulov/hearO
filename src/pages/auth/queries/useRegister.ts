import { useMutation } from '@tanstack/vue-query'
import type { RegisterRequest, RegisterResponse, APIError } from '../types'
import { registerUser } from '../api/auth.api'

export const useRegister = () => {
  return useMutation<RegisterResponse, APIError, RegisterRequest>({
    mutationFn: (data) => registerUser(data),
    onSuccess: (data) => {
      console.log('Registration successful:', data)
    },
    onError: (error) => {
      console.error('Error registering:', error)
    },
  })
}
