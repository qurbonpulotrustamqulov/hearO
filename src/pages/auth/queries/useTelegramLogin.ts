import { useMutation } from '@tanstack/vue-query'
import { telegramLogin } from '../api/auth.api'
import type { TelegramLoginRequest, TelegramLoginResponse } from '../types'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'vue-router'

export function useTelegramLogin() {
  const authStore = useAuthStore()
  const router = useRouter()

  return useMutation<TelegramLoginResponse, Error, TelegramLoginRequest>({
    mutationFn: telegramLogin,
    onSuccess: (data) => {
      authStore.setTokens(data.access_token, data.refresh)
      router.push('/')
    },
  })
}
