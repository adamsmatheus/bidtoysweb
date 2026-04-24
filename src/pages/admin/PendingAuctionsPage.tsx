import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/adminApi'

export function PendingAuctionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-auctions-pending', 0, 50],
    queryFn: () => adminApi.listPending(0, 50),
    refetchInterval: 30_000,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Fila de aprovação</h1>
      <p className="text-sm text-gray-500 mb-6">
        {data?.totalElements ?? 0} leilão(ões) aguardando análise
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 h-20 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : data?.content.length === 0 ? (
        <p className="text-center py-16 text-gray-400">Nenhum leilão pendente.</p>
      ) : (
        <div className="space-y-3">
          {data?.content.map((auction) => (
            <Link
              key={auction.id}
              to={`/admin/auctions/${auction.id}`}
              className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow block"
            >
              <div>
                <p className="font-semibold text-gray-900">{auction.title}</p>
                <p className="text-sm text-gray-500">
                  Vendedor: {auction.sellerName} · Preço inicial: R$ {auction.initialPriceAmount.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Enviado em: {new Date(auction.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <span className="btn-primary btn-sm shrink-0">Revisar →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
