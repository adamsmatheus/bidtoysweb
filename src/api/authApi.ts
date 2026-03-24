import http from './http'
import type { LoginRequest, LoginResponse, RegisterRequest, SendWhatsAppCodeRequest } from '@/types/auth'
import type { UserResponse } from '@/types/user'

export const authApi = {
  register: (data: RegisterRequest) =>
    http.post<UserResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    http.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  sendWhatsAppCode: (data: SendWhatsAppCodeRequest) =>
    http.post('/auth/whatsapp/send-code', data),
}
