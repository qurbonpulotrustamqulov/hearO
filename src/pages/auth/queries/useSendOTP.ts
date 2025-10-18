import { useMutation } from '@tanstack/vue-query'
import type { SendOtpRequest, SendOtpResponse, APIError } from '../types'
import { sendOtp } from '../api/auth.api'

export const useSendOtp = () => {
  return useMutation<SendOtpResponse, APIError, SendOtpRequest>({
    mutationFn: (data) => sendOtp(data),
    onSuccess: (data) => {
      console.log('OTP sent successfully:', data)
    },
    onError: (error) => {
      console.error('Error sending OTP:', error)
    },
  })
}
