import { Link } from 'react-router-dom'
import type { AuctionResponse } from '@/types/auction'
import { StatusBadge } from './StatusBadge'
import { CountdownTimer } from './CountdownTimer'

interface Props {
  auction: AuctionResponse
}

export function AuctionCard({ auction }: Props) {
  return (
    <Link
      to={`/auctions/${auction.id}`}
      className="card p-4 hover:shadow-md transition-shadow block"
    >
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
    </Link>
  )
}
