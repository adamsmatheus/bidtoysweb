import http from './http'
import type { AuctionResponse } from '@/types/auction'
import type { PageResponse } from '@/types/bid'
import type { BuyerReportResponse, AuctionReportResponse } from '@/types/report'

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

  listBuyerReports: () =>
    http.get<BuyerReportResponse[]>('/admin/buyer-reports').then((r) => r.data),

  resolveReport: (id: string, action: string) =>
    http.post(`/admin/buyer-reports/${id}/resolve`, { action }),

  listAuctionReports: () =>
    http.get<AuctionReportResponse[]>('/admin/auction-reports').then((r) => r.data),

  resolveAuctionReport: (id: string) =>
    http.post(`/admin/auction-reports/${id}/resolve`),
}
