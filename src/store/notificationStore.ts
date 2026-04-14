import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification, UserNotificationMessage } from '@/types/notification'

interface NotificationState {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (msg: UserNotificationMessage) => void
  setNotifications: (list: AppNotification[]) => void
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
        const existing = get().notifications
        // Evita duplicatas caso a notificação já tenha chegado via fetch inicial
        if (msg.id && existing.some((n) => n.id === msg.id)) return

        const notification: AppNotification = {
          id: msg.id ?? crypto.randomUUID(),
          type: msg.type,
          title: msg.title,
          message: msg.message,
          auctionId: msg.auctionId,
          read: false,
          createdAt: msg.createdAt ?? new Date().toISOString(),
        }
        const updated = [notification, ...existing].slice(0, 50)
        set({ notifications: updated, unreadCount: updated.filter((n) => !n.read).length })
      },

      setNotifications: (list) => {
        set({ notifications: list, unreadCount: list.filter((n) => !n.read).length })
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
