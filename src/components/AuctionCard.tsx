import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { AuctionResponse } from '@/types/auction'
import { StatusBadge } from './StatusBadge'
import { CountdownTimer } from './CountdownTimer'

interface Props {
  auction: AuctionResponse
}

export function AuctionCard({ auction }: Props) {
  const images = [...auction.images].sort((a, b) => a.position - b.position)
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const isActive = auction.status === 'ACTIVE'
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

  return (
    <Link
      to={`/auctions/${auction.id}`}
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
            {/* Sliding strip */}
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
                    alt={auction.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {/* Prev / Next — visible on hover (desktop) or always (touch) */}
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

                {/* Dot indicators */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => goTo(e, i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index
                          ? 'w-4 bg-white'
                          : 'w-1.5 bg-white/50 hover:bg-white/75'
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
            <span className="material-symbols-outlined text-6xl text-outline-variant">image</span>
          </div>
        )}

        {/* Timer overlay */}
        {isActive && auction.endsAt && (
          <div className="absolute top-3 right-3">
            <CountdownTimer endsAt={auction.endsAt} compact />
          </div>
        )}

        {/* Status badge */}
        {!isActive && (
          <div className="absolute top-3 left-3">
            <StatusBadge status={auction.status} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {auction.title}
        </h3>
        {auction.description && (
          <p className="text-on-surface-variant text-xs mb-3 line-clamp-2">{auction.description}</p>
        )}

        <div className="flex items-end justify-between mb-4 mt-auto">
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60 mb-0.5">
              {isActive ? 'Lance atual' : 'Preço final'}
            </span>
            <span className="text-xl font-black text-secondary">
              R$ {auction.currentPriceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60 mb-0.5">
              Lances
            </span>
            <span className="text-sm font-bold text-on-surface">
              {auction.bidCount} {auction.bidCount === 1 ? 'oferta' : 'ofertas'}
            </span>
          </div>
        </div>

        <button
          className="w-full py-3 rounded-full font-bold text-sm text-on-primary transition-all active:scale-95 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
        >
          {isActive ? 'Dar Lance' : 'Ver Detalhes'}
        </button>
      </div>
    </Link>
  )
}
