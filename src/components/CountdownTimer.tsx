import { useEffect, useState } from 'react'

interface Props {
  endsAt: string | null
  onExpire?: () => void
  compact?: boolean
}

function formatSeconds(total: number): string {
  if (total <= 0) return '00:00:00'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function CountdownTimer({ endsAt, onExpire, compact = false }: Props) {
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

  const isUrgent = remaining > 0 && remaining <= 300

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
        <span
          className="material-symbols-outlined text-base"
          style={{
            color: isUrgent ? '#b31b25' : '#535b71',
            fontVariationSettings: "'FILL' 1",
          }}
        >
          timer
        </span>
        <span className={`text-xs font-bold ${isUrgent ? 'text-error animate-pulse' : 'text-on-surface'}`}>
          {remaining <= 0 ? 'Encerrado' : formatSeconds(remaining)}
        </span>
      </div>
    )
  }

  return (
    <span className={`font-mono text-sm font-bold ${isUrgent ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
      {formatSeconds(remaining)}
    </span>
  )
}
