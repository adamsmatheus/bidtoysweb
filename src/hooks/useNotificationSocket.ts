import { useEffect, useRef } from 'react'
import { createUserNotificationClient } from '@/api/websocket'
import { useNotificationStore } from '@/store/notificationStore'

export function useNotificationSocket(userId: string | null | undefined) {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const clientRef = useRef<ReturnType<typeof createUserNotificationClient> | null>(null)

  useEffect(() => {
    if (!userId) return

    const client = createUserNotificationClient(userId, (msg) => {
      addNotification(msg)
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [userId, addNotification])
}
