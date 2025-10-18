import http from '@/service/http'

export interface Cartoon {
  id: number
  title: string
  link: string
  created_at: string
}

export const getRandomCartoon = async (): Promise<Cartoon> => {
  return http.get<Cartoon>('/random-cartoon/').then((res) => res.data)
}
