import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { useAuthStore } from '@/store/authStore'
import { AuctionCard } from '@/components/AuctionCard'
import type { AuctionStatus } from '@/types/auction'

const STATUS_OPTIONS: { value: AuctionStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'PENDING_APPROVAL', label: 'Aguardando aprovação' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: 'READY_TO_START', label: 'Prontos' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'FINISHED_WITH_WINNER', label: 'Encerrados' },
]

export function MyAuctionsPage() {
  const { userId } = useAuthStore()
  const [status, setStatus] = useState<AuctionStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['my-auctions', status, page],
    queryFn: () => auctionApi.list({ status: status || undefined, page, size: 12 }),
    enabled: !!userId,
  })

  // Filter client-side by sellerId since backend doesn't have /my endpoint yet
  const myAuctions = data?.content.filter((a) => a.sellerId === userId) ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus leilões</h1>
        <Link to="/auctions/new" className="btn-primary btn-sm">
          + Criar leilão
        </Link>
      </div>

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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 h-36 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : myAuctions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Você ainda não tem leilões.</p>
          <Link to="/auctions/new" className="btn-primary">
            Criar meu primeiro leilão
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button className="btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </button>
          <span className="text-sm text-gray-600 flex items-center px-2">{page + 1} / {data.totalPages}</span>
          <button className="btn-secondary btn-sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
