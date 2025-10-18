import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { updateProfile } from '@/pages/profile/api/profile.api'
import type { UpdateProfileRequest } from '@/pages/profile/types.ts'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] }).then((r) => {
        console.log('Profile data refetched after update:', r)
      })
    },
  })
}
