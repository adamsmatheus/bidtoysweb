export interface PlaceBidRequest {
  amount: number
  requestId?: string
}

export interface BidResponse {
  id: string
  auctionId: string
  bidderId: string
  bidderName: string
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
