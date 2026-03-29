import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { companyApi } from '@/api/companyApi'
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
  const [selectedSellerId, setSelectedSellerId] = useState<string | undefined>(undefined)

  const { data: activeCompanies } = useQuery({
    queryKey: ['companies-all'],
    queryFn: () => companyApi.listAll(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['auctions', status, page, selectedSellerId],
    queryFn: () =>
      auctionApi.list({ status: status || undefined, page, size: 12, sellerId: selectedSellerId }),
  })

  const handleCompanyClick = (sellerId: string) => {
    if (selectedSellerId === sellerId) {
      setSelectedSellerId(undefined)
      setStatus('ACTIVE')
    } else {
      setSelectedSellerId(sellerId)
      setStatus('')
    }
    setPage(0)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Empresas com leilões ativos */}
      {activeCompanies && activeCompanies.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Empresas</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {activeCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanyClick(company.sellerId)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  selectedSellerId === company.sellerId
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {company.logoUrl ? (
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-7 h-7 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium whitespace-nowrap">{company.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {selectedSellerId
            ? `Leilões de ${activeCompanies?.find((c) => c.sellerId === selectedSellerId)?.name ?? 'empresa'}`
            : 'Leilões'}
        </h1>
        <div className="flex items-center gap-2">
          {selectedSellerId && (
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => { setSelectedSellerId(undefined); setStatus('ACTIVE'); setPage(0) }}
            >
              Limpar filtro ×
            </button>
          )}
          <Link to="/auctions/new" className="btn-primary btn-sm">
            + Criar leilão
          </Link>
        </div>
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
