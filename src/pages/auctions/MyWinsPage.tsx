import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import type { AuctionResponse } from '@/types/auction'

type FilterTab = 'todos' | 'ativos' | 'encerrados'

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; dotClass: string; statusClass: string; chipClass: string }> = {
  FINISHED_WITH_WINNER: { label: 'Aguardando pagamento', dotClass: 'bg-yellow-400', statusClass: 'text-yellow-700', chipClass: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_DECLARED:     { label: 'Pagamento declarado',  dotClass: 'bg-blue-400',   statusClass: 'text-blue-700',   chipClass: 'bg-blue-100 text-blue-800' },
  PAYMENT_CONFIRMED:    { label: 'Pagamento confirmado', dotClass: 'bg-green-400',  statusClass: 'text-green-700',  chipClass: 'bg-green-100 text-green-800' },
  PAYMENT_DISPUTED:     { label: 'Pagamento contestado', dotClass: 'bg-red-400',    statusClass: 'text-red-700',    chipClass: 'bg-red-100 text-red-800' },
}

function WinCard({ auction }: { auction: AuctionResponse }) {
  const coverImage = auction.images.find((img) => img.position === 0) ?? auction.images[0]
  const isActive = auction.status === 'ACTIVE'
  const isFinished = auction.status === 'FINISHED_WITH_WINNER'
  const paymentConfig = PAYMENT_STATUS_CONFIG[auction.status]

  let statusLabel = ''
  let statusClass = ''
  let dotClass = ''
  let dotPing = false

  if (isActive) {
    statusLabel = 'Liderando Lance'
    statusClass = 'text-tertiary'
    dotClass = 'bg-tertiary-fixed-dim'
    dotPing = true
  } else if (paymentConfig) {
    statusLabel = paymentConfig.label
    statusClass = paymentConfig.statusClass
    dotClass = paymentConfig.dotClass
  } else if (isFinished) {
    statusLabel = 'Arremate Concluído'
    statusClass = 'text-outline'
    dotClass = 'bg-outline'
  } else {
    statusLabel = 'Em andamento'
    statusClass = 'text-primary'
    dotClass = 'bg-primary'
  }

  return (
    <div className="group relative flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-sm ring-1 ring-outline-variant/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5">
      {/* Image */}
      <div className="relative w-full aspect-square mb-5 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
        {coverImage ? (
          <img
            src={coverImage.fileUrl}
            alt={auction.title}
            className={`w-4/5 h-4/5 object-contain transition-transform group-hover:scale-110 ${!isActive && isFinished ? 'grayscale group-hover:grayscale-0' : ''}`}
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-outline-variant">image</span>
        )}

        {/* Status Chip */}
        <div className="absolute top-3 right-3">
          {isActive && (
            <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              Ao Vivo
            </span>
          )}
          {paymentConfig && (
            <span className={`${paymentConfig.chipClass} text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm`}>
              {paymentConfig.label}
            </span>
          )}
          {isFinished && !paymentConfig && (
            <span className="bg-surface-container text-on-surface-variant text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              Encerrado
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${dotClass} ${dotPing ? 'animate-ping' : ''}`} />
          <span className={`text-xs font-bold uppercase tracking-tight ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        <h3 className="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {auction.title}
        </h3>
        <p className="text-on-surface-variant text-sm mb-4">
          Vendedor: <span className="font-semibold text-on-surface">{auction.sellerName}</span>
        </p>

        <div className="bg-surface-container-low rounded-2xl p-4 mb-5">
          <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest block mb-1">
            {isActive ? 'Seu Lance Atual' : 'Valor Final'}
          </span>
          <span className={`text-2xl font-black ${isActive ? 'text-tertiary' : 'text-on-surface'}`}>
            R$ {auction.currentPriceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <Link
        to={`/auctions/${auction.id}`}
        className={`w-full py-3.5 rounded-full font-bold text-sm text-center transition-all active:scale-95 ${
          isActive
            ? 'bg-on-surface text-surface'
            : auction.status === 'FINISHED_WITH_WINNER'
            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
            : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container'
        }`}
      >
        {isActive ? 'Aumentar Lance' : auction.status === 'FINISHED_WITH_WINNER' ? 'Realizar pagamento' : 'Ver Detalhes'}
      </Link>
    </div>
  )
}

export function MyWinsPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<FilterTab>('todos')

  const { data, isLoading } = useQuery({
    queryKey: ['my-wins', page],
    queryFn: () => auctionApi.listWon({ page, size: 24 }),
  })

  const allAuctions = data?.content ?? []

  const FINISHED_STATUSES = ['FINISHED_WITH_WINNER', 'PAYMENT_DECLARED', 'PAYMENT_CONFIRMED', 'PAYMENT_DISPUTED']

  const filtered = allAuctions.filter((a) => {
    if (filter === 'ativos') return a.status === 'ACTIVE'
    if (filter === 'encerrados') return FINISHED_STATUSES.includes(a.status)
    return true
  })

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-12 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="text-primary font-bold tracking-widest uppercase text-xs block mb-2">
            Coleção Pessoal
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface leading-none mb-4">
            Meus Arremates
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md">
            Gerencie suas vitórias e acompanhe o status dos seus itens raros.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-surface-container-low p-1.5 rounded-full self-start md:self-auto">
          {(['todos', 'ativos', 'encerrados'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === tab
                  ? 'text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              style={filter === tab ? { background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' } : {}}
            >
              {tab === 'todos' ? 'Todos' : tab === 'ativos' ? 'Em aberto' : 'Encerrados'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-outline-variant block mb-4">
            shopping_bag
          </span>
          <p className="text-on-surface-variant font-medium text-lg">
            {filter === 'todos'
              ? 'Você ainda não arrematou nenhum leilão.'
              : 'Nenhum arremate nesta categoria.'}
          </p>
          <Link
            to="/auctions"
            className="inline-block mt-6 px-8 py-4 rounded-full font-bold text-sm text-on-primary"
            style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
          >
            Explorar Leilões
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((auction) => (
            <WinCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

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
    </div>
  )
}
