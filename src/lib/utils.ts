import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatApiErrors(errors: unknown): string {
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const entries = Object.entries(errors as Record<string, unknown>)
    if (entries.length === 0) return 'Validation error'
    return entries
      .map(([field, msgs]) => {
        if (Array.isArray(msgs)) {
          return `${field}: ${msgs.join('; ')}`
        }
        if (typeof msgs === 'string') {
          return `${field}: ${msgs}`
        }
        return `${field}: invalid`
      })
      .join('\n')
  }
  if (Array.isArray(errors)) return errors.join('\n')
  if (typeof errors === 'string') return errors
  return 'An error occurred'
}
