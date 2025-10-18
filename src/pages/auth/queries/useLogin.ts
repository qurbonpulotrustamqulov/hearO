import { useMutation } from '@tanstack/vue-query'
import type {
  TokenObtainPairRequest,
  TokenObtainPairResponse,
  APIError,
} from '../types'
import { obtainTokenPair } from '../api/auth.api'

export const useLogin = () => {
  return useMutation<TokenObtainPairResponse, APIError, TokenObtainPairRequest>(
    {
      mutationFn: (data) => obtainTokenPair(data),
      onSuccess: (data) => {
        // Handle success, e.g., show a success message or redirect
        console.log('Login successful:', data)
      },
      onError: (error) => {
        // Handle error, e.g., show an error message
        console.error('Error logging in:', error)
      },
    }
  )
}
