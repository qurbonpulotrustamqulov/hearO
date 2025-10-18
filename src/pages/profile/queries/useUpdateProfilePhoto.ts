import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { updateProfile } from '@/pages/profile/api/profile.api'
import type { Profile } from '@/pages/profile/types'

export const useUpdateProfilePhoto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (image: File): Promise<Profile> => {
      return updateProfile({ image })
    },
    onSuccess: (data) => {
      // Update the profile cache with new data
      queryClient.setQueryData(['profile'], data)

      // Invalidate and refetch profile queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error) => {
      console.error('Failed to update profile photo:', error)
    },
  })
}
