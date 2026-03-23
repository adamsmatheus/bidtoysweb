import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'

export function AdminDashboardPage() {
  const { data: pending } = useQuery({
    queryKey: ['admin-auctions-pending'],
    queryFn: () => auctionApi.list({ status: 'PENDING_APPROVAL', size: 1 }),
  })

  const { data: active } = useQuery({
    queryKey: ['auctions', 'ACTIVE', 0],
    queryFn: () => auctionApi.list({ status: 'ACTIVE', size: 1 }),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel Admin</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/admin/auctions" className="card p-6 hover:shadow-md transition-shadow">
          <p className="text-3xl font-bold text-yellow-600 mb-1">
            {pending?.totalElements ?? '—'}
          </p>
          <p className="text-gray-600 font-medium">Leilões aguardando aprovação</p>
          <p className="text-xs text-primary-600 mt-2">Revisar →</p>
        </Link>

        <div className="card p-6">
          <p className="text-3xl font-bold text-green-600 mb-1">
            {active?.totalElements ?? '—'}
          </p>
          <p className="text-gray-600 font-medium">Leilões ativos agora</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Ações rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/auctions" className="btn-primary btn-sm">
            Fila de aprovação
          </Link>
          <Link to="/auctions" className="btn-secondary btn-sm">
            Ver todos os leilões
          </Link>
        </div>
      </div>
    </div>
  )
}
