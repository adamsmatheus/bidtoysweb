export interface RegisterRequest {
  name: string
  email: string
  password: string
  whatsappNumber: string
  verificationCode: string
}

export interface SendWhatsAppCodeRequest {
  phoneNumber: string
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
