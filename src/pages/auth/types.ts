export interface TelegramLoginRequest {
  id: number
  first_name: string
  last_name?: string
  auth_date: number
  hash: string
}

export interface TelegramLoginResponse {
  access_token: string
  refresh: string
  user_id: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  session: string
}

export interface RegisterResponse {
  access: string
  refresh: string
}

export interface SendOtpRequest {
  email: string
}

export interface SendOtpResponse {
  session: string
}

export interface VerifyOtpRequest {
  session: string
  code: string
}

export interface VerifyOtpResponse {
  valid: boolean
}

export interface CheckEmailRequest {
  email: string
}

export interface CheckEmailResponse {
  is_available: boolean
  message?: string
}

export interface TokenObtainPairRequest {
  email: string
  password: string
}

export interface TokenObtainPairResponse {
  access: string
  refresh: string
}

export interface TokenRefreshRequest {
  refresh: string
}

export interface TokenRefreshResponse {
  access: string
}

export interface TokenVerifyRequest {
  token: string
}

export interface TokenVerifyResponse {
  valid: boolean
}

export interface APIError {
  response?: {
    data?: {
      error?: string
    }
  }
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_bot: boolean
  auth_date: number
  hash: string
}

export interface User {
  id: number
  email: string
  firstName: string
  is_staff?: boolean
  is_superuser?: boolean
}
