import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { AuctionCard } from '@/components/AuctionCard'

export function MyWinsPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['my-wins', page],
    queryFn: () => auctionApi.listWon({ page, size: 12 }),
  })

  const auctions = data?.content ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus arremates</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 h-36 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Você ainda não arrematou nenhum leilão.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((auction) => (
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
