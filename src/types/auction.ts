export type AuctionStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'READY_TO_START'
  | 'CANCELLED'
  | 'ACTIVE'
  | 'FINISHED_WITH_WINNER'
  | 'FINISHED_NO_BIDS'
  | 'PAYMENT_DECLARED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_DISPUTED'

export interface AuctionImageResponse {
  id: string
  fileUrl: string
  position: number
}

export interface AuctionCompany {
  id: string
  name: string
  logoUrl: string | null
  pixKey: string | null
}

export interface AuctionResponse {
  id: string
  sellerId: string
  sellerName: string
  title: string
  description: string | null
  initialPriceAmount: number
  currentPriceAmount: number
  minIncrementAmount: number
  nextMinimumBid: number
  durationSeconds: number
  status: AuctionStatus
  startedAt: string | null
  endsAt: string | null
  leadingBidId: string | null
  winnerUserId: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
  images: AuctionImageResponse[]
  company: AuctionCompany | null
  bidCount: number
}

export interface CreateAuctionRequest {
  title: string
  description?: string
  initialPriceAmount: number
  minIncrementAmount: number
  durationSeconds: number
}

export interface UpdateAuctionRequest {
  title?: string
  description?: string
  initialPriceAmount?: number
  minIncrementAmount?: number
  durationSeconds?: number
}

export interface CancelAuctionRequest {
  reason?: string
}

// WebSocket messages
export interface NewBidMessage {
  type: 'NEW_BID'
  bidId: string
  auctionId: string
  bidderId: string
  amount: number
  newCurrentPrice: number
  nextMinimumBid: number
  endsAt: string
  bidAt: string
}

export interface AuctionFinishedMessage {
  type: 'AUCTION_FINISHED'
  auctionId: string
  status: AuctionStatus
  winnerUserId: string | null
  finalPrice: number
  finishedAt: string
}

export type AuctionSocketMessage = NewBidMessage | AuctionFinishedMessage
