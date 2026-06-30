import http from './http'
import type { LoginRequest, LoginResponse, RegisterRequest, VerifyEmailRequest } from '@/types/auth'
import type { UserResponse } from '@/types/user'

export const authApi = {
  register: (data: RegisterRequest) =>
    http.post<UserResponse>('/auth/register', data).then((r) => r.data),

  verifyEmail: (data: VerifyEmailRequest) =>
    http.post('/auth/verify-email', data),

  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  forgotPassword: (email: string) =>
    http.post('/auth/forgot-password', { email }),

  resetPassword: (data: { email: string; code: string; newPassword: string }) =>
    http.post('/auth/reset-password', data),
}
