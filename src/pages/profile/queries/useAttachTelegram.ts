import { attachTelegram } from '@/pages/auth/api/auth.api.ts'
import { useMutation } from '@tanstack/vue-query'

export const useAttachTelegram = () => {
  return useMutation({
    mutationFn: attachTelegram,
  })
}
