export interface AddressRequest {
  cep: string
  street: string
  city: string
  state: string
  number: string
  complement?: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  telegramToken: string
  address: AddressRequest
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface LoginRequest {
  email: string
  password: string
}

// Backend returns only token; userId/email/role are decoded from JWT
export interface LoginResponse {
  token: string
  tokenType: string
}

// Decoded from JWT payload
export interface JwtPayload {
  sub: string   // userId
  email: string
  role: 'USER' | 'ADMIN'
  exp: number
}
