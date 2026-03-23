import http from './http'
import type { AuctionResponse } from '@/types/auction'

export const adminApi = {
  approve: (id: string) =>
    http.post<AuctionResponse>(`/admin/auctions/${id}/approve`).then((r) => r.data),

  reject: (id: string, reason: string) =>
    http
      .post<AuctionResponse>(`/admin/auctions/${id}/reject`, { reason })
      .then((r) => r.data),
}
