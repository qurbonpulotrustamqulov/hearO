import { toast } from 'sonner'

export const useToasts = () => {
  const success = (message: string, title?: string) => {
    if (title) {
      toast.success(title, { description: message })
    } else {
      toast.success(message)
    }
  }

  const error = (message: string, title?: string) => {
    if (title) {
      toast.error(title, { description: message })
    } else {
      toast.error(message)
    }
  }

  const warning = (message: string, title?: string) => {
    if (title) {
      toast.warning(title, { description: message })
    } else {
      toast.warning(message)
    }
  }

  const info = (message: string, title?: string) => {
    if (title) {
      toast.info(title, { description: message })
    } else {
      toast.info(message)
    }
  }

  return { success, error, warning, info }
}

export default useToasts
