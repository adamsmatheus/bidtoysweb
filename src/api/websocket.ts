import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { AuctionSocketMessage } from '@/types/auction'

const WS_URL = '/ws'

export function createAuctionSocketClient(
  auctionId: string,
  onMessage: (msg: AuctionSocketMessage) => void,
  onConnect?: () => void
): Client {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
    reconnectDelay: 5000,
    onConnect: () => {
      onConnect?.()
      client.subscribe(`/topic/auctions/${auctionId}`, (frame) => {
        try {
          const msg = JSON.parse(frame.body) as AuctionSocketMessage
          onMessage(msg)
        } catch {
          console.error('Failed to parse WebSocket message', frame.body)
        }
      })
    },
    onStompError: (frame) => {
      console.error('STOMP error', frame)
    },
  })

  return client
}
