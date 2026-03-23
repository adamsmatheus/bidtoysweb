import http from './http'
import type {
  AuctionResponse,
  AuctionStatus,
  CreateAuctionRequest,
  UpdateAuctionRequest,
  CancelAuctionRequest,
} from '@/types/auction'
import type { PageResponse } from '@/types/bid'

export const auctionApi = {
  list: (params?: { status?: AuctionStatus; page?: number; size?: number }) =>
    http.get<PageResponse<AuctionResponse>>('/auctions', { params }).then((r) => r.data),

  get: (id: string) =>
    http.get<AuctionResponse>(`/auctions/${id}`).then((r) => r.data),

  create: (data: CreateAuctionRequest) =>
    http.post<AuctionResponse>('/auctions', data).then((r) => r.data),

  update: (id: string, data: UpdateAuctionRequest) =>
    http.put<AuctionResponse>(`/auctions/${id}`, data).then((r) => r.data),

  submit: (id: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/submit`).then((r) => r.data),

  start: (id: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/start`).then((r) => r.data),

  cancel: (id: string, data?: CancelAuctionRequest) =>
    http.post<AuctionResponse>(`/auctions/${id}/cancel`, data ?? {}).then((r) => r.data),
}
