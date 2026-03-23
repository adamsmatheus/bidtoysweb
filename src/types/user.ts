export type UserRole = 'USER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'BLOCKED'

export interface UserResponse {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  whatsappEnabled: boolean
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface UpdateUserRequest {
  name?: string
  phoneNumber?: string
  whatsappEnabled?: boolean
}
