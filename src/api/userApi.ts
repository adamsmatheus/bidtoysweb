import http from './http'
import type { UserResponse, UpdateUserRequest, UpdateAddressRequest } from '@/types/user'

export const userApi = {
  me: () =>
    http.get<UserResponse>('/users/me').then((r) => r.data),

  update: (id: string, data: UpdateUserRequest) =>
    http.put<UserResponse>(`/users/${id}`, data).then((r) => r.data),

  updateAddress: (data: UpdateAddressRequest) =>
    http.put<UserResponse>('/users/me/address', data).then((r) => r.data),

  requestTelegramLink: () =>
    http.post<{ token: string; deepLink: string }>('/users/me/telegram/request-link').then((r) => r.data),

  checkTelegramLinkStatus: (token: string) =>
    http.get<{ linked: boolean }>(`/users/me/telegram/link-status/${token}`).then((r) => r.data),
}
