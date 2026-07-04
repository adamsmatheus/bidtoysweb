import type { BuyerAuctionItem, BuyerAddress } from './auction'

export type BuyerReportStatus = 'PENDING' | 'RESOLVED_DEACTIVATED' | 'RESOLVED_KEPT_ACTIVE'

export type AuctionReportStatus = 'PENDING' | 'RESOLVED'

export interface AuctionReportResponse {
  id: string
  auctionId: string
  auctionTitle: string
  reporterId: string
  reporterName: string
  reason: string
  status: AuctionReportStatus
  resolvedAt: string | null
  createdAt: string
}

export interface BuyerReportResponse {
  id: string
  reporterId: string
  reporterName: string
  reportedUserId: string
  reportedUserName: string
  reportedUserStatus: string
  reason: string
  imageUrls: string[]
  status: BuyerReportStatus
  resolvedAt: string | null
  createdAt: string
  buyerEmail: string
  buyerPhone: string | null
  buyerAddress: BuyerAddress | null
  buyerAuctions: BuyerAuctionItem[]
}
