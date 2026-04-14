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

// Mensagem recebida via WebSocket (o id vem do backend após persistência)
export interface UserNotificationMessage {
  id?: string
  type: AppNotificationType
  title: string
  message: string
  auctionId: string
  createdAt: string
}
