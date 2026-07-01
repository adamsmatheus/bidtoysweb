import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { reportApi } from '@/api/reportApi'
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
  const [showInfo, setShowInfo] = useState(false)
  const [showAddress, setShowAddress] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportImages, setReportImages] = useState<File[]>([])
  const [reportSuccess, setReportSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reportMutation = useMutation({
    mutationFn: () => reportApi.submit(buyer.buyerId, reportReason, reportImages),
    onSuccess: () => {
      setReportSuccess(true)
      setReportReason('')
      setReportImages([])
    },
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setReportImages((prev) => [...prev, ...files].slice(0, 3))
    e.target.value = ''
  }

  const closeReport = () => {
    setShowReport(false)
    setReportReason('')
    setReportImages([])
    setReportSuccess(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
      {/* Header do comprador */}
      <div className="flex items-center gap-2 px-5 py-4">
        <button
          className="flex items-center gap-3 min-w-0 flex-1 hover:bg-gray-50 -mx-2 px-2 py-1 rounded-xl transition-colors text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
            {buyer.buyerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{buyer.buyerName}</p>
            <p className="text-xs text-gray-500">
              {buyer.auctionCount} {buyer.auctionCount === 1 ? 'leilão' : 'leilões'} · Total {formatBRL(buyer.totalAmount)}
            </p>
          </div>
        </button>

        {/* Botão de endereço do comprador */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowAddress((v) => !v)}
            className={`p-2 rounded-full transition-colors ${showAddress ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
            title="Ver endereço do comprador"
          >
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </button>

          {showAddress && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAddress(false)} />
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 z-20 w-72 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Endereço do comprador</p>
                {buyer.buyerAddress ? (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] text-green-500 shrink-0 mt-0.5">home</span>
                      <div className="text-sm text-gray-800 space-y-0.5">
                        <p>{buyer.buyerAddress.street}, {buyer.buyerAddress.number}{buyer.buyerAddress.complement ? ` — ${buyer.buyerAddress.complement}` : ''}</p>
                        <p>{buyer.buyerAddress.city} — {buyer.buyerAddress.state}</p>
                        <p className="text-gray-500">CEP: {buyer.buyerAddress.cep}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gray-300 shrink-0">location_off</span>
                    <span className="text-sm text-gray-400">Endereço não informado</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Botão de informações do comprador */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowInfo((v) => !v)}
            className={`p-2 rounded-full transition-colors ${showInfo ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'}`}
            title="Ver contato do comprador"
          >
            <span className="material-symbols-outlined text-[20px]">info</span>
          </button>

          {showInfo && (
            <>
              {/* Overlay para fechar ao clicar fora */}
              <div className="fixed inset-0 z-10" onClick={() => setShowInfo(false)} />
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 z-20 w-72 bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contato do comprador</p>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0 mt-0.5">mail</span>
                  <a
                    href={`mailto:${buyer.buyerEmail}`}
                    className="text-sm text-gray-800 hover:text-blue-600 break-all transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {buyer.buyerEmail}
                  </a>
                </div>
                {buyer.buyerPhone ? (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-green-500 shrink-0">phone</span>
                    <a
                      href={`tel:${buyer.buyerPhone}`}
                      className="text-sm text-gray-800 hover:text-green-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {buyer.buyerPhone}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-gray-300 shrink-0">phone_disabled</span>
                    <span className="text-sm text-gray-400">Telefone não informado</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Botão de reporte */}
        <button
          onClick={() => setShowReport(true)}
          className="shrink-0 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Reportar comprador"
        >
          <span className="material-symbols-outlined text-[20px]">flag</span>
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className={`material-symbols-outlined transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
      </div>

      {/* Modal de reporte */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={closeReport}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {reportSuccess ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-5xl text-green-500 block mb-3">check_circle</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Reporte enviado!</h3>
                <p className="text-sm text-gray-500 mb-6">Nossa equipe irá analisar e tomar as devidas providências.</p>
                <button
                  onClick={closeReport}
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Reportar comprador</h3>
                    <p className="text-sm text-gray-500">{buyer.buyerName}</p>
                  </div>
                  <button onClick={closeReport} className="p-1 text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Motivo do reporte <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      rows={4}
                      placeholder="Descreva o motivo do reporte..."
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Imagens em anexo (máx. 3)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {reportImages.map((img, i) => (
                        <div key={i} className="relative">
                          <img
                            src={URL.createObjectURL(img)}
                            className="w-16 h-16 object-cover rounded-xl ring-1 ring-gray-200"
                          />
                          <button
                            onClick={() => setReportImages((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {reportImages.length < 3 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>

                  {reportMutation.isError && (
                    <p className="text-sm text-red-600">Erro ao enviar reporte. Tente novamente.</p>
                  )}

                  <button
                    onClick={() => reportMutation.mutate()}
                    disabled={!reportReason.trim() || reportMutation.isPending}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    {reportMutation.isPending ? 'Enviando...' : 'Enviar reporte'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
