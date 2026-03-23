import http from './http'
import type { UserResponse, UpdateUserRequest } from '@/types/user'

export const userApi = {
  me: () =>
    http.get<UserResponse>('/users/me').then((r) => r.data),

  update: (id: string, data: UpdateUserRequest) =>
    http.put<UserResponse>(`/users/${id}`, data).then((r) => r.data),
}
