import http from './http'
import type { PlaceBidRequest, BidResponse, PageResponse } from '@/types/bid'

export const bidApi = {
  place: (auctionId: string, data: PlaceBidRequest) =>
    http.post<BidResponse>(`/auctions/${auctionId}/bids`, data).then((r) => r.data),

  list: (auctionId: string, params?: { page?: number; size?: number }) =>
    http
      .get<PageResponse<BidResponse>>(`/auctions/${auctionId}/bids`, { params })
      .then((r) => r.data),
}
