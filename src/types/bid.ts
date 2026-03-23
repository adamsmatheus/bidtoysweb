export interface PlaceBidRequest {
  amount: number
  requestId?: string
}

export interface BidResponse {
  id: string
  auctionId: string
  bidderId: string
  amount: number
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
