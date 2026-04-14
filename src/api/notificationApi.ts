import http from './http'
import type { AppNotification } from '@/types/notification'

interface ServerNotification {
  id: string
  type: string
  title: string
  message: string
  auctionId: string | null
  read: boolean
  createdAt: string
}

function toAppNotification(n: ServerNotification): AppNotification {
  return {
    id: n.id,
    type: n.type as AppNotification['type'],
    title: n.title,
    message: n.message,
    auctionId: n.auctionId ?? '',
    read: n.read,
    createdAt: n.createdAt,
  }
}

export const notificationApi = {
  list: () =>
    http.get<ServerNotification[]>('/notifications').then((r) => r.data.map(toAppNotification)),

  markRead: (id: string) =>
    http.patch(`/notifications/${id}/read`),

  markAllRead: () =>
    http.patch('/notifications/read-all'),
}
