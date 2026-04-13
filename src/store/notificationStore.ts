import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification, UserNotificationMessage } from '@/types/notification'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (msg: UserNotificationMessage) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (msg) => {
        const notification: AppNotification = {
          id: crypto.randomUUID(),
          type: msg.type,
          title: msg.title,
          message: msg.message,
          auctionId: msg.auctionId,
          read: false,
          createdAt: msg.createdAt ?? new Date().toISOString(),
        }
        const updated = [notification, ...get().notifications].slice(0, 50)
        set({ notifications: updated, unreadCount: updated.filter((n) => !n.read).length })
      },

      markAsRead: (id) => {
        const updated = get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        set({ notifications: updated, unreadCount: updated.filter((n) => !n.read).length })
      },

      markAllAsRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, read: true }))
        set({ notifications: updated, unreadCount: 0 })
      },

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'notifications' }
  )
)
