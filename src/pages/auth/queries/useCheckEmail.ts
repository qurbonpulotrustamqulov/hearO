import { useMutation } from '@tanstack/vue-query'
import { checkEmail } from '@/pages/auth/api/auth.api'

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: checkEmail,
  })
}
