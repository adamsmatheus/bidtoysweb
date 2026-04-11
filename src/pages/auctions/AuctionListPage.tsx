import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { companyApi } from '@/api/companyApi'
import { AuctionCard } from '@/components/AuctionCard'
import type { AuctionStatus } from '@/types/auction'

const STATUS_OPTIONS: { value: AuctionStatus | ''; label: string }[] = [
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'READY_TO_START', label: 'Prontos para iniciar' },
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

  // Busca leilões ativos para calcular contagens por empresa
  const { data: activeAuctionsAll } = useQuery({
    queryKey: ['auctions-active-all'],
    queryFn: () => auctionApi.list({ status: 'ACTIVE', size: 200 }),
    staleTime: 30_000,
  })

  // Mapa sellerId → quantidade de leilões ativos
  const activeCountBySeller = useMemo(() => {
    const map: Record<string, number> = {}
    for (const auction of activeAuctionsAll?.content ?? []) {
      map[auction.sellerId] = (map[auction.sellerId] ?? 0) + 1
    }
    return map
  }, [activeAuctionsAll])

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

  const selectedCompanyName = activeCompanies?.find((c) => c.sellerId === selectedSellerId)?.name

  return (
    <div className="pb-24 md:pb-12">
      {/* Stores Section */}
      {activeCompanies && activeCompanies.length > 0 && (
        <section className="px-6 py-12 max-w-screen-2xl mx-auto">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-none mb-2">
                  Lojas com Leilões{' '}
                  <span className="text-primary italic">Ativos</span>
                </h2>
                <p className="text-on-surface-variant font-medium">
                  Selecione uma loja para ver os itens exclusivos em leilão agora.
                </p>
              </div>
              <Link
                to="/auctions/new"
                className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-on-primary shadow-md"
                style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
              >
                <span className="material-symbols-outlined text-base">add</span>
                Criar leilão
              </Link>
            </div>

            {/* Company Cards */}
            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar snap-x">
              {activeCompanies.map((company) => {
                const isSelected = selectedSellerId === company.sellerId
                const count = activeCountBySeller[company.sellerId] ?? 0

                return (
                  <button
                    key={company.id}
                    onClick={() => handleCompanyClick(company.sellerId)}
                    className="flex-none w-56 group snap-start text-left"
                  >
                    <div
                      className={`relative rounded-2xl p-5 border-2 transition-all ${
                        isSelected
                          ? 'bg-white border-primary shadow-xl shadow-primary/10'
                          : 'bg-surface-container-low border-transparent hover:border-primary-container'
                      }`}
                    >
                      {/* Logo / Icon */}
                      <div
                        className={`w-28 h-28 rounded-2xl flex items-center justify-center mb-4 overflow-hidden transition-transform group-hover:scale-105 shadow-md ${
                          isSelected ? 'bg-primary-container' : 'bg-white'
                        }`}
                      >
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <span
                            className={`text-4xl font-black ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-on-surface mb-0.5 line-clamp-1">
                        {company.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mb-4">
                        {count > 0 ? `${count} Leilões Ativos` : 'Nenhum leilão ativo'}
                      </p>

                      {/* Bubbles */}
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: '#d9e2ff' }} />
                        <div className="w-8 h-8 rounded-full border-2 border-white" style={{ backgroundColor: '#c7d4fa' }} />
                        {count > 0 ? (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-[10px] text-on-primary flex items-center justify-center font-bold">
                            +{count}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high" />
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Selecionada
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Filter Chips & Section Header */}
      <section className="px-6 mb-8 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-on-surface">
              {selectedCompanyName ? (
                <>Leilões em <span className="text-primary">{selectedCompanyName}</span></>
              ) : (
                'Todos os Leilões'
              )}
            </span>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {selectedSellerId && (
              <button
                className="text-xs text-on-surface-variant hover:text-error transition-colors"
                onClick={() => { setSelectedSellerId(undefined); setStatus('ACTIVE'); setPage(0) }}
              >
                × Limpar filtro
              </button>
            )}
          </div>

          <div className="flex gap-2 no-scrollbar overflow-x-auto">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setStatus(opt.value); setPage(0) }}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  status === opt.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Auction Grid */}
      <section className="px-6 max-w-screen-2xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : data?.content.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline-variant block mb-4">search_off</span>
            <p className="text-on-surface-variant font-medium">Nenhum leilão encontrado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.content.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  className="px-5 py-2 rounded-full text-sm font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-40"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Anterior
                </button>
                <span className="text-sm text-on-surface-variant flex items-center px-4 font-medium">
                  {page + 1} / {data.totalPages}
                </span>
                <button
                  className="px-5 py-2 rounded-full text-sm font-bold bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-40"
                  disabled={data.last}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
