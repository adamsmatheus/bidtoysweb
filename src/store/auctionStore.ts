import { create } from 'zustand'
import type { AuctionStatus } from '@/types/auction'

interface LiveAuctionState {
  auctionId: string | null
  currentPrice: number | null
  nextMinimumBid: number | null
  endsAt: string | null
  status: AuctionStatus | null
  winnerUserId: string | null
  isFinished: boolean
  setLiveAuction: (data: {
    auctionId: string
    currentPrice: number
    nextMinimumBid: number
    endsAt: string | null
    status: AuctionStatus
  }) => void
  updateBid: (data: { newCurrentPrice: number; nextMinimumBid: number; endsAt: string }) => void
  setFinished: (data: { status: AuctionStatus; winnerUserId: string | null }) => void
  reset: () => void
}

export const useAuctionStore = create<LiveAuctionState>()((set) => ({
  auctionId: null,
  currentPrice: null,
  nextMinimumBid: null,
  endsAt: null,
  status: null,
  winnerUserId: null,
  isFinished: false,

  setLiveAuction: (data) =>
    set({
      auctionId: data.auctionId,
      currentPrice: data.currentPrice,
      nextMinimumBid: data.nextMinimumBid,
      endsAt: data.endsAt,
      status: data.status,
      isFinished: false,
      winnerUserId: null,
    }),

  updateBid: (data) =>
    set({
      currentPrice: data.newCurrentPrice,
      nextMinimumBid: data.nextMinimumBid,
      endsAt: data.endsAt,
    }),

  setFinished: (data) =>
    set({
      status: data.status,
      winnerUserId: data.winnerUserId,
      isFinished: true,
    }),

  reset: () =>
    set({
      auctionId: null,
      currentPrice: null,
      nextMinimumBid: null,
      endsAt: null,
      status: null,
      winnerUserId: null,
      isFinished: false,
    }),
}))
