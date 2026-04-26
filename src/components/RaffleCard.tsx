import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { RifaResponse } from '@/types/raffle'

interface Props {
  rifa: RifaResponse
}

export function RaffleCard({ rifa }: Props) {
  const images = [...rifa.images].sort((a, b) => a.position - b.position)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const isActive = rifa.status === 'ACTIVE'
  const hasMultiple = images.length > 1

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i + 1) % images.length)
  }

  const goTo = (e: React.MouseEvent, i: number) => {
    e.preventDefault()
    e.stopPropagation()
    setIndex(i)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      setIndex((i) =>
        diff > 0
          ? (i + 1) % images.length
          : (i - 1 + images.length) % images.length
      )
    }
    touchStartX.current = null
  }

  const soldPct = rifa.totalTickets > 0 ? Math.round((rifa.soldTickets / rifa.totalTickets) * 100) : 0
  const drawDate = new Date(rifa.drawDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const statusLabel: Record<string, string> = {
    DRAFT: 'Rascunho',
    PENDING_APPROVAL: 'Em análise',
    REJECTED: 'Rejeitada',
    READY_TO_START: 'Pronta',
    ACTIVE: 'Ativa',
    FINISHED: 'Sorteada',
    CANCELLED: 'Cancelada',
  }

  return (
    <Link
      to={`/rifas/${rifa.id}`}
      className="group bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 ring-1 ring-outline-variant/10 block"
    >
      {/* Image carousel */}
      <div
        className="relative aspect-[4/5] bg-surface-container-low overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.length > 0 ? (
          <>
            <div
              className="flex h-full transition-transform duration-300 ease-in-out"
              style={{
                width: `${images.length * 100}%`,
                transform: `translateX(-${(index * 100) / images.length}%)`,
              }}
            >
              {images.map((img) => (
                <div
                  key={img.id}
                  className="h-full flex items-center justify-center p-6"
                  style={{ width: `${100 / images.length}%` }}
                >
                  <img
                    src={img.fileUrl}
                    alt={rifa.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/55"
                  aria-label="Foto anterior"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/35 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/55"
                  aria-label="Próxima foto"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>

                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => goTo(e, i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Foto ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant">confirmation_number</span>
          </div>
        )}

        {/* Status badge */}
        {!isActive && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container text-on-surface-variant ring-1 ring-outline-variant/30">
              {statusLabel[rifa.status] ?? rifa.status}
            </span>
          </div>
        )}

        {/* Sorteio badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          Sorteio: {drawDate}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {rifa.title}
        </h3>
        {rifa.description && (
          <p className="text-on-surface-variant text-xs mb-3 line-clamp-2">{rifa.description}</p>
        )}

        {/* Ticket progress */}
        <div className="mb-4 mt-auto">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1.5">
            <span>Bilhetes vendidos</span>
            <span>{rifa.soldTickets}/{rifa.totalTickets}</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${soldPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60 mb-0.5">
              Preço do bilhete
            </span>
            <span className="text-xl font-black text-secondary">
              R$ {(rifa.ticketPriceAmount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60 mb-0.5">
              Disponíveis
            </span>
            <span className="text-sm font-bold text-on-surface">
              {rifa.totalTickets - rifa.soldTickets} bilhetes
            </span>
          </div>
        </div>

        <button
          className="w-full py-3 rounded-full font-bold text-sm text-on-primary transition-all active:scale-95 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
        >
          {isActive ? 'Comprar Bilhete' : 'Ver Detalhes'}
        </button>
      </div>
    </Link>
  )
}
