import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import type { AuctionResponse, AuctionStatus } from '@/types/auction'

const WIN_STATUS_OPTIONS: { value: AuctionStatus | ''; label: string }[] = [
  { value: '',                      label: 'Todos' },
  { value: 'ACTIVE',                label: 'Em aberto' },
  { value: 'FINISHED_WITH_WINNER',  label: 'Aguard. pagamento' },
]

const PAYMENT_STATUS_OPTIONS: { value: AuctionStatus; label: string; dotClass: string }[] = [
  { value: 'PAYMENT_DECLARED',  label: 'Pag. declarado',  dotClass: 'bg-yellow-400' },
  { value: 'PAYMENT_CONFIRMED', label: 'Pag. confirmado', dotClass: 'bg-green-400' },
  { value: 'PAYMENT_DISPUTED',  label: 'Pag. contestado', dotClass: 'bg-red-400' },
]

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; dotClass: string; statusClass: string; chipClass: string }> = {
  FINISHED_WITH_WINNER: { label: 'Aguardando pagamento', dotClass: 'bg-yellow-400', statusClass: 'text-yellow-700', chipClass: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_DECLARED:     { label: 'Pagamento declarado',  dotClass: 'bg-blue-400',   statusClass: 'text-blue-700',   chipClass: 'bg-blue-100 text-blue-800' },
  PAYMENT_CONFIRMED:    { label: 'Pagamento confirmado', dotClass: 'bg-green-400',  statusClass: 'text-green-700',  chipClass: 'bg-green-100 text-green-800' },
  PAYMENT_DISPUTED:     { label: 'Pagamento contestado', dotClass: 'bg-red-400',    statusClass: 'text-red-700',    chipClass: 'bg-red-100 text-red-800' },
}

const SHIPMENT_STATUS_CHIP: Record<string, { label: string; chipClass: string }> = {
  PENDING:   { label: 'Aguard. envio',   chipClass: 'bg-gray-100 text-gray-600' },
  PREPARING: { label: 'Preparando',      chipClass: 'bg-yellow-100 text-yellow-800' },
  SHIPPED:   { label: 'Enviado',         chipClass: 'bg-green-100 text-green-800' },
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
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
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
          {auction.shipmentStatus && (
            <span className={`${SHIPMENT_STATUS_CHIP[auction.shipmentStatus]?.chipClass ?? ''} text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm`}>
              {SHIPMENT_STATUS_CHIP[auction.shipmentStatus]?.label}
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
  const [status, setStatus] = useState<AuctionStatus | ''>('')
  const [page, setPage] = useState(0)

  function selectStatus(value: AuctionStatus | '') {
    setStatus(value)
    setPage(0)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['my-wins', status, page],
    queryFn: () => auctionApi.listWon({ status: status || undefined, page, size: 24 }),
  })

  const auctions = data?.content ?? []

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-12 pb-24 md:pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
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
      </div>

      {/* Filter Tabs */}
      <div className="mb-10 space-y-3">
        {/* Status do arremate */}
        <div className="flex flex-wrap items-center gap-2">
          {WIN_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectStatus(opt.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                status === opt.value
                  ? opt.value === 'ACTIVE'
                    ? 'bg-tertiary-container text-on-tertiary-container font-bold'
                    : 'bg-on-surface text-surface font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Pagamentos */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-outline uppercase tracking-wider pr-1">Pagamento</span>
          <div className="w-px h-4 bg-outline-variant/40" />
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectStatus(status === opt.value ? '' : opt.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                status === opt.value
                  ? 'bg-on-surface text-surface font-bold'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dotClass}`} />
              {opt.label}
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
      ) : auctions.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-outline-variant block mb-4">
            shopping_bag
          </span>
          <p className="text-on-surface-variant font-medium text-lg">
            {!status
              ? 'Você ainda não arrematou nenhum leilão.'
              : 'Nenhum arremate nesta categoria.'}
          </p>
          {!status && (
            <Link
              to="/auctions"
              className="inline-block mt-6 px-8 py-4 rounded-full font-bold text-sm text-on-primary"
              style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
            >
              Explorar Leilões
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {auctions.map((auction) => (
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
