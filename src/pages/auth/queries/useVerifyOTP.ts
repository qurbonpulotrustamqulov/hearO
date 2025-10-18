import { useMutation } from '@tanstack/vue-query'
import type { VerifyOtpRequest, VerifyOtpResponse, APIError } from '../types'
import { verifyOtp } from '../api/auth.api'

export const useVerifyOtp = () => {
  return useMutation<VerifyOtpResponse, APIError, VerifyOtpRequest>({
    mutationFn: (data) => verifyOtp(data),
    onSuccess: (data) => {
      console.log('OTP verified successfully:', data)
    },
    onError: (error) => {
      console.error('Error verifying OTP:', error)
    },
  })
}
