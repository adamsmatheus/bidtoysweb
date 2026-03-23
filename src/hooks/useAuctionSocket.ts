import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createAuctionSocketClient } from '@/api/websocket'
import { useAuctionStore } from '@/store/auctionStore'
import type { AuctionSocketMessage } from '@/types/auction'

export function useAuctionSocket(auctionId: string | undefined) {
  const queryClient = useQueryClient()
  const { updateBid, setFinished } = useAuctionStore()
  const clientRef = useRef<ReturnType<typeof createAuctionSocketClient> | null>(null)

  useEffect(() => {
    if (!auctionId) return

    const client = createAuctionSocketClient(
      auctionId,
      (msg: AuctionSocketMessage) => {
        if (msg.type === 'NEW_BID') {
          updateBid({
            newCurrentPrice: msg.newCurrentPrice,
            nextMinimumBid: msg.nextMinimumBid,
            endsAt: msg.endsAt,
          })
          // Invalidate bid list so it refreshes
          queryClient.invalidateQueries({ queryKey: ['bids', auctionId] })
        } else if (msg.type === 'AUCTION_FINISHED') {
          setFinished({ status: msg.status, winnerUserId: msg.winnerUserId })
          queryClient.invalidateQueries({ queryKey: ['auction', auctionId] })
        }
      }
    )

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [auctionId, updateBid, setFinished, queryClient])
}
