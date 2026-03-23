import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { AuctionCard } from '@/components/AuctionCard'
import type { AuctionStatus } from '@/types/auction'

const STATUS_OPTIONS: { value: AuctionStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'READY_TO_START', label: 'Prontos para iniciar' },
  { value: 'FINISHED_WITH_WINNER', label: 'Encerrados' },
  { value: 'FINISHED_NO_BIDS', label: 'Sem lances' },
]

export function AuctionListPage() {
  const [status, setStatus] = useState<AuctionStatus | ''>('ACTIVE')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['auctions', status, page],
    queryFn: () => auctionApi.list({ status: status || undefined, page, size: 12 }),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leilões</h1>
        <Link to="/auctions/new" className="btn-primary btn-sm">
          + Criar leilão
        </Link>
      </div>

      {/* Filtro de status */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`btn btn-sm ${status === opt.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setStatus(opt.value); setPage(0) }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 h-36 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : data?.content.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Nenhum leilão encontrado.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.content.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>

          {/* Paginação */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                className="btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 flex items-center px-2">
                {page + 1} / {data.totalPages}
              </span>
              <button
                className="btn-secondary btn-sm"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
