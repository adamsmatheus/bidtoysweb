export type AppNotificationType =
  | 'AUCTION_WON'
  | 'PAYMENT_DECLARED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_DISPUTED'

export interface AppNotification {
  id: string
  type: AppNotificationType
  title: string
  message: string
  auctionId: string
  read: boolean
  createdAt: string
}

// Mensagem recebida via WebSocket
export interface UserNotificationMessage {
  type: AppNotificationType
  title: string
  message: string
  auctionId: string
  createdAt: string
}
