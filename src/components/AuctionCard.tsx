import { Link } from 'react-router-dom'
import type { AuctionResponse } from '@/types/auction'
import { StatusBadge } from './StatusBadge'
import { CountdownTimer } from './CountdownTimer'

interface Props {
  auction: AuctionResponse
}

export function AuctionCard({ auction }: Props) {
  const coverImage = auction.images.find((img) => img.position === 0) ?? auction.images[0]

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="card overflow-hidden hover:shadow-md transition-shadow block"
    >
      {/* Imagem de capa */}
      {coverImage ? (
        <div className="w-full h-44 bg-gray-50 flex items-center justify-center">
          <img
            src={coverImage.fileUrl}
            alt={auction.title}
            className="max-h-full max-w-full object-contain p-2"
          />
        </div>
      ) : (
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-300 text-4xl">🖼</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{auction.title}</h3>
          <StatusBadge status={auction.status} />
        </div>

        {auction.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{auction.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Lance atual</span>
            <p className="font-bold text-primary-700 text-lg">
              R$ {auction.currentPriceAmount.toLocaleString('pt-BR')}
            </p>
          </div>

          {auction.status === 'ACTIVE' && auction.endsAt && (
            <div className="text-right">
              <span className="text-gray-500 block text-xs">Encerra em</span>
              <CountdownTimer endsAt={auction.endsAt} />
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-2">Vendedor: {auction.sellerName}</p>
      </div>
    </Link>
  )
}
