import { Link } from 'react-router-dom'
import type { AuctionResponse } from '@/types/auction'
import { StatusBadge } from './StatusBadge'
import { CountdownTimer } from './CountdownTimer'

interface Props {
  auction: AuctionResponse
}

export function AuctionCard({ auction }: Props) {
  const coverImage = auction.images.find((img) => img.position === 0) ?? auction.images[0]
  const isActive = auction.status === 'ACTIVE'

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="group bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 ring-1 ring-outline-variant/10 block"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden flex items-center justify-center p-6">
        {coverImage ? (
          <img
            src={coverImage.fileUrl}
            alt={auction.title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-6xl text-outline-variant">image</span>
          </div>
        )}

        {/* Timer overlay (active auctions) */}
        {isActive && auction.endsAt && (
          <div className="absolute top-3 right-3">
            <CountdownTimer endsAt={auction.endsAt} compact />
          </div>
        )}

        {/* Status badge overlay (non-active) */}
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

        <button className="w-full py-3 rounded-full font-bold text-sm text-on-primary transition-all active:scale-95 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}>
          {isActive ? 'Dar Lance' : 'Ver Detalhes'}
        </button>
      </div>
    </Link>
  )
}
