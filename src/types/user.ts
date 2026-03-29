export type UserRole = 'USER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'BLOCKED'

export interface AddressResponse {
  cep: string
  street: string
  city: string
  state: string
  number: string
  complement: string | null
}

export interface UserResponse {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  whatsappEnabled: boolean
  role: UserRole
  status: UserStatus
  createdAt: string
  address: AddressResponse | null
}

export interface UpdateUserRequest {
  name?: string
  phoneNumber?: string
  whatsappEnabled?: boolean
}
