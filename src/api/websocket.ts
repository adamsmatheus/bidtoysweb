import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { AuctionSocketMessage } from '@/types/auction'
import type { UserNotificationMessage } from '@/types/notification'

const WS_URL = '/ws'

export function createUserNotificationClient(
  userId: string,
  onMessage: (msg: UserNotificationMessage) => void
): Client {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(`/topic/users/${userId}/notifications`, (frame) => {
        try {
          const msg = JSON.parse(frame.body) as UserNotificationMessage
          onMessage(msg)
        } catch {
          console.error('Failed to parse notification message', frame.body)
        }
      })
    },
    onStompError: (frame) => {
      console.error('STOMP notification error', frame)
    },
  })
  return client
}

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
