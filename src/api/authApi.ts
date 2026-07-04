import http from './http'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth'
import type { UserResponse } from '@/types/user'

export const authApi = {
  register: (data: RegisterRequest) =>
    http.post<UserResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  forgotPassword: (email: string) =>
    http.post('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    http.post('/auth/reset-password', data),

  requestWhatsAppVerification: (phoneNumber: string) =>
    http.post<{ token: string }>('/auth/whatsapp/request-verification', { phoneNumber }).then((r) => r.data),

  verifyWhatsAppCode: (token: string, code: string) =>
    http.post<{ verified: boolean }>('/auth/whatsapp/verify-code', { token, code }).then((r) => r.data),
}
