import http from '@/service/http'
import type {
  RegisterRequest,
  RegisterResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CheckEmailRequest,
  CheckEmailResponse,
  TokenObtainPairRequest,
  TokenObtainPairResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  TokenVerifyRequest,
  TokenVerifyResponse,
  TelegramLoginRequest,
  TelegramLoginResponse,
} from '@/pages/auth/types.ts'

// --- API functions ---
export async function checkEmail(
  data: CheckEmailRequest
): Promise<CheckEmailResponse> {
  const res = await http.post<CheckEmailResponse>('/check-email/', data)
  return res.data
}

export async function sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
  const res = await http.post<SendOtpResponse>('/otp-send/', data)
  return res.data
}

export async function verifyOtp(
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> {
  const res = await http.post<VerifyOtpResponse>('/otp-verify/', data)
  return res.data
}

export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const res = await http.post<RegisterResponse>('/register/', data)
  return res.data
}

export async function obtainTokenPair(
  data: TokenObtainPairRequest
): Promise<TokenObtainPairResponse> {
  const res = await http.post<TokenObtainPairResponse>('/token/', data)
  return res.data
}

export async function refreshToken(
  data: TokenRefreshRequest
): Promise<TokenRefreshResponse> {
  const res = await http.post<TokenRefreshResponse>('/token/refresh/', data)
  return res.data
}

export async function verifyToken(
  data: TokenVerifyRequest
): Promise<TokenVerifyResponse> {
  const res = await http.post<TokenVerifyResponse>('/token/verify/', data)
  return res.data
}

export async function telegramLogin(
  data: TelegramLoginRequest
): Promise<TelegramLoginResponse> {
  const res = await http.post<TelegramLoginResponse>('/telegram_login/', data)
  return res.data
}

export const attachTelegram = async (data: TelegramLoginRequest) => {
  const res = await http.post<TelegramLoginResponse>(
    '/attach-telegram-id/',
    data
  )
  return res.data
}

// --- Vue Query mutation hook for sending OTP ---
