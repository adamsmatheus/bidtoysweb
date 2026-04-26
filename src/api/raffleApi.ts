import http from './http'
import type {
  RifaResponse,
  RifaStatus,
  CreateRifaRequest,
  UpdateRifaRequest,
  BuyTicketsRequest,
  DeclareWinnerRequest,
} from '@/types/raffle'
import type { PageResponse } from '@/types/bid'

export const raffleApi = {
  list: (params?: { status?: RifaStatus; page?: number; size?: number; sellerId?: string }) =>
    http.get<PageResponse<RifaResponse>>('/rifas', { params }).then((r) => r.data),

  get: (id: string) =>
    http.get<RifaResponse>(`/rifas/${id}`).then((r) => r.data),

  create: (data: CreateRifaRequest) =>
    http.post<RifaResponse>('/rifas', data).then((r) => r.data),

  update: (id: string, data: UpdateRifaRequest) =>
    http.put<RifaResponse>(`/rifas/${id}`, data).then((r) => r.data),

  submit: (id: string) =>
    http.post<RifaResponse>(`/rifas/${id}/submit`).then((r) => r.data),

  start: (id: string) =>
    http.post<RifaResponse>(`/rifas/${id}/start`).then((r) => r.data),

  buyTickets: (id: string, data: BuyTicketsRequest) =>
    http.post<RifaResponse>(`/rifas/${id}/buy`, data).then((r) => r.data),

  declareWinner: (id: string, data: DeclareWinnerRequest) =>
    http.post<RifaResponse>(`/rifas/${id}/winner`, data).then((r) => r.data),

  myRifas: (params?: { status?: RifaStatus; page?: number; size?: number }) =>
    http.get<PageResponse<RifaResponse>>('/rifas/my-rifas', { params }).then((r) => r.data),
}
