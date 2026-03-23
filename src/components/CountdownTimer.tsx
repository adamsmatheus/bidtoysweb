import { useEffect, useState } from 'react'

interface Props {
  endsAt: string | null
  onExpire?: () => void
}

function formatSeconds(total: number): string {
  if (total <= 0) return '00:00:00'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function CountdownTimer({ endsAt, onExpire }: Props) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    if (!endsAt) return

    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
      setRemaining(diff)
      if (diff === 0) onExpire?.()
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt, onExpire])

  if (!endsAt) return null

  const isUrgent = remaining > 0 && remaining <= 60

  return (
    <span className={`font-mono text-lg font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
      {formatSeconds(remaining)}
    </span>
  )
}
