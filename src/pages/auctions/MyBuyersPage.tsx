import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { formatBRL } from '@/utils/currency'
import type { BuyerSummaryResponse } from '@/types/auction'

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  FINISHED_WITH_WINNER: { label: 'Aguard. pagamento', className: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_DECLARED:     { label: 'Pag. declarado',    className: 'bg-blue-100 text-blue-800' },
  PAYMENT_CONFIRMED:    { label: 'Pag. confirmado',   className: 'bg-green-100 text-green-800' },
  PAYMENT_DISPUTED:     { label: 'Pag. contestado',   className: 'bg-red-100 text-red-800' },
}

const SHIPMENT_LABEL: Record<string, { label: string; className: string; highlight?: boolean }> = {
  PENDING:            { label: 'Aguard. envio',    className: 'bg-gray-100 text-gray-600' },
  DELIVERY_REQUESTED: { label: 'Envio solicitado', className: 'bg-orange-100 text-orange-700', highlight: true },
  PREPARING:          { label: 'Preparando',       className: 'bg-yellow-100 text-yellow-800' },
  SHIPPED:            { label: 'Enviado',           className: 'bg-green-100 text-green-800' },
}

function BuyerCard({ buyer }: { buyer: BuyerSummaryResponse }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* Header do comprador */}
      <button
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
            {buyer.buyerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{buyer.buyerName}</p>
            <p className="text-xs text-gray-500">
              {buyer.auctionCount} {buyer.auctionCount === 1 ? 'leilão' : 'leilões'} · Total {formatBRL(buyer.totalAmount)}
            </p>
          </div>
        </div>
        <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 shrink-0 ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Lista de leilões */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {buyer.auctions.map((auction) => {
            const badge = STATUS_LABEL[auction.status]
            const shipmentBadge = auction.shipmentStatus ? SHIPMENT_LABEL[auction.shipmentStatus] : null
            const isDeliveryRequested = auction.shipmentStatus === 'DELIVERY_REQUESTED'
            return (
              <Link
                key={auction.id}
                to={`/auctions/${auction.id}`}
                className={`flex items-center justify-between gap-3 px-5 py-3 transition-colors ${
                  isDeliveryRequested
                    ? 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-400'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{auction.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                    )}
                    {auction.holdShipment && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">inventory_2</span>
                        Envio futuro
                      </span>
                    )}
                    {shipmentBadge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${shipmentBadge.className}`}>
                        {shipmentBadge.highlight && (
                          <span className="material-symbols-outlined text-[10px]">local_shipping</span>
                        )}
                        {shipmentBadge.label}
                      </span>
                    )}
                    {auction.finishedAt && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(auction.finishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-bold text-primary-700 shrink-0">
                  {formatBRL(auction.currentPriceAmount)}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function MyBuyersPage() {
  const [search, setSearch] = useState('')

  const { data: buyers = [], isLoading } = useQuery({
    queryKey: ['my-buyers'],
    queryFn: () => auctionApi.listMyBuyers(),
  })

  const filtered = buyers.filter((b) =>
    b.buyerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Compradores</h1>
        <p className="text-sm text-gray-500">
          Histórico de compradores dos seus leilões.
        </p>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition"
          placeholder="Buscar pelo nome do comprador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">group</span>
          <p className="text-gray-500 font-medium">
            {search ? 'Nenhum comprador encontrado.' : 'Nenhum comprador ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((buyer) => (
            <BuyerCard key={buyer.buyerId} buyer={buyer} />
          ))}
        </div>
      )}
    </div>
  )
}
