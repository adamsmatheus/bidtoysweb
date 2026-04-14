import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/store/notificationStore'
import { notificationApi } from '@/api/notificationApi'
import type { AppNotification, AppNotificationType } from '@/types/notification'

const ICON: Record<AppNotificationType, string> = {
  AUCTION_WON:       'emoji_events',
  PAYMENT_DECLARED:  'payments',
  PAYMENT_CONFIRMED: 'check_circle',
  PAYMENT_DISPUTED:  'error',
}

const ICON_COLOR: Record<AppNotificationType, string> = {
  AUCTION_WON:       'text-yellow-500',
  PAYMENT_DECLARED:  'text-blue-500',
  PAYMENT_CONFIRMED: 'text-green-500',
  PAYMENT_DISPUTED:  'text-red-500',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  return `${Math.floor(hrs / 24)}d atrás`
}

function NotificationItem({ notification, onClose }: { notification: AppNotification; onClose: () => void }) {
  const navigate = useNavigate()
  const { markAsRead } = useNotificationStore()

  function handleClick() {
    markAsRead(notification.id)
    notificationApi.markRead(notification.id).catch(() => {})
    onClose()
    navigate(`/auctions/${notification.auctionId}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container transition-colors ${
        !notification.read ? 'bg-primary-container/10' : ''
      }`}
    >
      <span className={`material-symbols-outlined text-xl mt-0.5 shrink-0 ${ICON_COLOR[notification.type]}`}>
        {ICON[notification.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold text-on-surface leading-tight ${!notification.read ? 'text-primary' : ''}`}>
          {notification.title}
        </p>
        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-outline mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </button>
  )
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-surface-container transition-colors"
        aria-label="Notificações"
      >
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-xl ring-1 ring-outline-variant/20 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
            <span className="text-sm font-semibold text-on-surface">Notificações</span>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead()
                  notificationApi.markAllRead().catch(() => {})
                }}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/10">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant block mb-2">
                  notifications_none
                </span>
                <p className="text-sm text-on-surface-variant">Nenhuma notificação ainda.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onClose={() => setOpen(false)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
