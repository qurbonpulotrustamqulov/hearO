export interface User {
  name: string
}
export interface BaseFilter {
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  count: number
  results: T[]
}
