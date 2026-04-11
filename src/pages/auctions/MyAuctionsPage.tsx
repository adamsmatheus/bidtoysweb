import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { useAuthStore } from '@/store/authStore'
import type { AuctionResponse, AuctionStatus } from '@/types/auction'

const STATUS_OPTIONS: { value: AuctionStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'PENDING_APPROVAL', label: 'Aguardando aprovação' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: 'READY_TO_START', label: 'Prontos' },
  { value: 'ACTIVE', label: 'Ativos' },
  { value: 'FINISHED_WITH_WINNER', label: 'Encerrados' },
]

const STATUS_BADGE: Record<AuctionStatus, { label: string; className: string }> = {
  DRAFT:                { label: 'Rascunho',             className: 'bg-outline-variant/30 text-on-surface-variant' },
  PENDING_APPROVAL:     { label: 'Aguardando aprovação', className: 'bg-surface-container-highest text-on-surface-variant' },
  REJECTED:             { label: 'Rejeitado',            className: 'bg-error-container text-on-error-container' },
  READY_TO_START:       { label: 'Pronto',               className: 'bg-primary-container text-on-primary-container' },
  CANCELLED:            { label: 'Cancelado',            className: 'bg-surface-container text-on-surface-variant' },
  ACTIVE:               { label: 'Ativo',                className: 'bg-tertiary-container text-on-tertiary-container' },
  FINISHED_WITH_WINNER: { label: 'Encerrado',            className: 'bg-on-surface text-surface' },
  FINISHED_NO_BIDS:     { label: 'Sem lances',           className: 'bg-surface-container-high text-on-surface-variant' },
}

function MyAuctionCard({ auction }: { auction: AuctionResponse }) {
  const coverImage = auction.images.find((img) => img.position === 0) ?? auction.images[0]
  const badge = STATUS_BADGE[auction.status]
  const isDraft = auction.status === 'DRAFT'
  const isFinished = auction.status === 'FINISHED_WITH_WINNER' || auction.status === 'FINISHED_NO_BIDS'

  return (
    <div className={`group bg-surface-container-lowest rounded-2xl p-5 shadow-sm ring-1 ring-outline-variant/10 flex flex-col transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 ${isFinished ? 'opacity-80 hover:opacity-100' : ''}`}>
      {/* Image */}
      <div className="relative w-full aspect-square mb-5 rounded-xl overflow-hidden bg-surface-container-low">
        {coverImage ? (
          <img
            src={coverImage.fileUrl}
            alt={auction.title}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isFinished ? 'grayscale group-hover:grayscale-0' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-6xl text-outline-variant">image</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-extrabold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {auction.title}
        </h3>
        {auction.description && (
          <p className="text-on-surface-variant text-xs mb-4 line-clamp-2">{auction.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end pt-4 border-t border-surface-container-high">
        <div>
          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
            {auction.status === 'ACTIVE' ? 'Lance Atual' : 'Preço Inicial'}
          </p>
          <p className={`text-xl font-black tracking-tight ${
            auction.status === 'ACTIVE' ? 'text-secondary' : isFinished ? 'text-on-surface-variant' : 'text-on-surface opacity-40'
          }`}>
            R$ {auction.currentPriceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {isDraft ? (
          <Link
            to={`/auctions/${auction.id}/edit`}
            className="p-3 rounded-full text-on-primary active:scale-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
          >
            <span className="material-symbols-outlined text-sm">edit_square</span>
          </Link>
        ) : isFinished ? (
          <Link
            to={`/auctions/${auction.id}`}
            className="bg-primary-container text-on-primary-container font-bold px-4 py-2 rounded-full text-xs active:scale-90 transition-all"
          >
            Ver detalhes
          </Link>
        ) : (
          <Link
            to={`/auctions/${auction.id}`}
            className="bg-surface-container-high text-on-surface p-3 rounded-full active:scale-90 transition-all hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export function MyAuctionsPage() {
  const { userId } = useAuthStore()
  const [status, setStatus] = useState<AuctionStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['my-auctions', status, page, userId],
    queryFn: () => auctionApi.list({ status: status || undefined, page, size: 12, sellerId: userId ?? undefined }),
    enabled: !!userId,
  })

  const myAuctions = data?.content ?? []

  return (
    <div className="max-w-screen-xl mx-auto px-6 pt-10 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-2">
            Meus Leilões
          </h1>
          <p className="text-on-surface-variant font-medium">
            Gerencie suas coleções e acompanhe seus lances ativos.
          </p>
        </div>
        <Link
          to="/auctions/new"
          className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-on-primary shadow-lg active:scale-95 transition-all self-start md:self-auto"
          style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
        >
          <span className="material-symbols-outlined text-base">add</span>
          Criar leilão
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-10 overflow-x-auto no-scrollbar -mx-6 px-6">
        <div className="flex items-center gap-2 min-w-max">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = opt.value === 'ACTIVE'
            return (
              <button
                key={opt.value}
                onClick={() => { setStatus(opt.value); setPage(0) }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  status === opt.value
                    ? isActive
                      ? 'bg-tertiary-container text-on-tertiary-container font-bold'
                      : 'bg-on-surface text-surface font-bold'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : myAuctions.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-6xl text-outline-variant block mb-4">inventory_2</span>
          <p className="text-on-surface-variant font-medium text-lg mb-6">
            {status ? 'Nenhum leilão nesta categoria.' : 'Você ainda não tem leilões.'}
          </p>
          {!status && (
            <Link
              to="/auctions/new"
              className="inline-block px-8 py-4 rounded-full font-bold text-sm text-on-primary"
              style={{ background: 'linear-gradient(135deg, #0050d4 0%, #7b9cff 100%)' }}
            >
              Criar meu primeiro leilão
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myAuctions.map((auction) => (
            <MyAuctionCard key={auction.id} auction={auction} />
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
