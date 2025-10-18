import { useQuery } from '@tanstack/vue-query'
import { getRandomCartoon } from '../api/randomCartoon.api'

export const useRandomCartoon = () => {
  return useQuery({
    queryKey: ['random-cartoon'],
    queryFn: getRandomCartoon,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
