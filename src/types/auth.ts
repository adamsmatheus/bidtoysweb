export interface RegisterRequest {
  name: string
  email: string
  password: string
  phoneNumber?: string
  whatsappEnabled?: boolean
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
