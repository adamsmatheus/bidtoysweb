export interface CompanyResponse {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  pixKey: string | null
}

export interface ActiveCompanyResponse {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  sellerId: string
}

export interface UpsertCompanyRequest {
  name: string
  description?: string
  logoUrl?: string
  pixKey?: string
}
