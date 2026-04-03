import http from './http'
import type { AuctionResponse } from '@/types/auction'
import type { PageResponse } from '@/types/bid'

export const adminApi = {
  listPending: (page = 0, size = 50) =>
    http
      .get<PageResponse<AuctionResponse>>('/admin/auctions/pending', { params: { page, size } })
      .then((r) => r.data),

  approve: (id: string) =>
    http.post<AuctionResponse>(`/admin/auctions/${id}/approve`).then((r) => r.data),

  reject: (id: string, reason: string) =>
    http
      .post<AuctionResponse>(`/admin/auctions/${id}/reject`, { reason })
      .then((r) => r.data),
}
