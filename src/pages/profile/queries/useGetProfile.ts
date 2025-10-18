import { useQuery } from '@tanstack/vue-query'
import { getProfile } from '@/pages/profile/api/profile.api'
import { useAuthStore } from '@/store/auth.store.ts'

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      getProfile().then((res) => {
        if (res) {
          useAuthStore().setUser({
            id: res.id,
            email: res.email,
            firstName: res.first_name,
            is_staff: res.is_staff,
          })
        }
        return res
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
