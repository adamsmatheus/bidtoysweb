import http from './http'
import type { ActiveCompanyResponse, CompanyResponse, UpsertCompanyRequest } from '@/types/company'

export const companyApi = {
  getMe: () =>
    http.get<CompanyResponse | null>('/companies/me').then((r) => r.data),

  upsertMe: (data: UpsertCompanyRequest) =>
    http.put<CompanyResponse>('/companies/me', data).then((r) => r.data),

  uploadLogo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post<{ logoUrl: string }>('/companies/me/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  deleteMe: () =>
    http.delete('/companies/me'),

  listActive: () =>
    http.get<ActiveCompanyResponse[]>('/companies/active').then((r) => r.data),

  listAll: () =>
    http.get<ActiveCompanyResponse[]>('/companies').then((r) => r.data),
}
