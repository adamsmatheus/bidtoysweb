import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { auctionApi } from '@/api/auctionApi'
import { bidApi } from '@/api/bidApi'
import { useAuctionSocket } from '@/hooks/useAuctionSocket'
import { useAuctionStore } from '@/store/auctionStore'
import { useAuthStore } from '@/store/authStore'
import { StatusBadge } from '@/components/StatusBadge'
import { CountdownTimer } from '@/components/CountdownTimer'
import { BidForm } from '@/components/BidForm'
import { formatBRL } from '@/utils/currency'
import { buildPixPayload } from '@/utils/pixPayload'

function PixPaymentBlock({ pixKey, sellerName, amount }: { pixKey: string; sellerName: string; amount: number }) {
  const [copied, setCopied] = useState(false)
  const payload = buildPixPayload(pixKey, sellerName, amount)

  function copyKey() {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-600 text-lg">qr_code_2</span>
        <p className="text-sm font-semibold text-primary-800">Pagamento via PIX</p>
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-3 rounded-xl shadow-sm inline-block">
          <QRCodeSVG value={payload} size={180} level="M" />
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Valor</p>
        <p className="text-xl font-black text-primary-800">{formatBRL(amount)}</p>
      </div>

      <div>
        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Chave PIX</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-white border border-primary-200 rounded-lg px-3 py-2 text-on-surface break-all font-mono">
            {pixKey}
          </code>
          <button
            onClick={copyKey}
            className="p-2 rounded-lg bg-white border border-primary-200 hover:bg-primary-100 transition-colors shrink-0"
            title="Copiar chave PIX"
          >
            <span className="material-symbols-outlined text-sm text-primary-700">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>
      </div>

      <p className="text-[10px] text-primary-600">
        Escaneie o QR Code ou copie a chave e pague pelo seu aplicativo bancário. Após o pagamento, clique em "Confirmar que realizei o pagamento".
      </p>
    </div>
  )
}

export function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()
  const { setLiveAuction, currentPrice, nextMinimumBid, endsAt, isFinished, status: liveStatus, winnerUserId, reset } = useAuctionStore()

  const [selectedImage, setSelectedImage] = useState(0)

  const TRANSITIONAL_STATUSES = ['PENDING_APPROVAL', 'READY_TO_START']

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionApi.get(id!),
    enabled: !!id,
    staleTime: 0,
    refetchInterval: (query) =>
      TRANSITIONAL_STATUSES.includes(query.state.data?.status ?? '')
        ? 5_000
        : false,
  })

  const { data: bidsPage } = useQuery({
    queryKey: ['bids', id],
    queryFn: () => bidApi.list(id!, { size: 10 }),
    enabled: !!id,
  })

  // Sync store with initial REST data
  useEffect(() => {
    if (auction) {
      setLiveAuction({
        auctionId: auction.id,
        currentPrice: auction.currentPriceAmount,
        nextMinimumBid: auction.nextMinimumBid,
        endsAt: auction.endsAt,
        status: auction.status,
      })
    }
    return () => reset()
  }, [auction, setLiveAuction, reset])

  // Start WebSocket only for active auctions
  useAuctionSocket(auction?.status === 'ACTIVE' ? id : undefined)

  const startMutation = useMutation({
    mutationFn: () => auctionApi.start(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', id] }),
  })

  const cancelMutation = useMutation({
    mutationFn: () => auctionApi.cancel(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', id] }),
  })

  const submitMutation = useMutation({
    mutationFn: () => auctionApi.submit(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', id] }),
  })

  const declarePaymentMutation = useMutation({
    mutationFn: () => auctionApi.declarePayment(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', id] }),
  })

  const confirmPaymentMutation = useMutation({
    mutationFn: () => auctionApi.confirmPayment(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', id] }),
  })

  const disputePaymentMutation = useMutation({
    mutationFn: () => auctionApi.disputePayment(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', id] }),
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    )
  }

  if (!auction) {
    return <p className="text-center py-16 text-gray-500">Leilão não encontrado.</p>
  }

  const isSeller = auction.sellerId === userId
  const isWinner = (winnerUserId ?? auction.winnerUserId) === userId
  const isActive = auction.status === 'ACTIVE'
  const displayPrice = currentPrice ?? auction.currentPriceAmount
  const displayNextBid = nextMinimumBid ?? auction.nextMinimumBid
  const displayEndsAt = endsAt ?? auction.endsAt
  const displayStatus = (liveStatus ?? auction.status)
  const isFinishedNow = isFinished || ['FINISHED_WITH_WINNER', 'FINISHED_NO_BIDS', 'CANCELLED'].includes(displayStatus)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
        ← Voltar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">{auction.title}</h1>
              <StatusBadge status={displayStatus} />
            </div>

            {auction.description && (
              <p className="text-gray-600 text-sm mb-4">{auction.description}</p>
            )}

            {auction.company && (
              <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                {auction.company.logoUrl ? (
                  <img
                    src={auction.company.logoUrl}
                    alt={auction.company.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                    {auction.company.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{auction.company.name}</span>
              </div>
            )}

            <p className="text-sm text-gray-400 mt-2">Vendedor: {auction.sellerName}</p>
          </div>

          {/* Image gallery */}
          {auction.images.length > 0 && (
            <div className="card p-4 space-y-3">
              {/* Main image */}
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={auction.images[selectedImage].fileUrl}
                  alt={`Imagem ${selectedImage + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Thumbnails */}
              {auction.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {auction.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        idx === selectedImage
                          ? 'border-primary-600'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.fileUrl}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bid list */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Histórico de lances</h2>
            {bidsPage?.content.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum lance ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {bidsPage?.content.map((bid) => (
                  <li key={bid.id} className="py-2 flex justify-between text-sm">
                    <span className="text-gray-500">{bid.bidderName}</span>
                    <span className="font-semibold text-primary-700">
                      {formatBRL(bid.amount)}
                    </span>
                    <span className="text-gray-400">
                      {new Date(bid.createdAt).toLocaleTimeString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-500">Lance atual</p>
              <p className="text-3xl font-bold text-primary-700">
                {formatBRL(displayPrice)}
              </p>
            </div>

            {isActive && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Encerra em</p>
                <CountdownTimer
                  endsAt={displayEndsAt}
                  onExpire={() => queryClient.invalidateQueries({ queryKey: ['auction', id] })}
                />
              </div>
            )}

            {isFinishedNow && displayStatus === 'FINISHED_WITH_WINNER' && (
              <div className="rounded-md bg-purple-50 border border-purple-200 p-3 text-sm text-purple-700">
                {isWinner
                  ? 'Você ganhou este leilão!'
                  : `Vencedor: ${bidsPage?.content[0]?.bidderName ?? (winnerUserId ?? auction.winnerUserId ?? '').slice(0, 8) + '...'}`}
              </div>
            )}

            {/* Vencedor declara pagamento */}
            {displayStatus === 'FINISHED_WITH_WINNER' && isWinner && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {auction.company?.pixKey ? (
                  <PixPaymentBlock
                    pixKey={auction.company.pixKey}
                    sellerName={auction.sellerName}
                    amount={displayPrice}
                  />
                ) : (
                  <p className="text-xs text-gray-500">
                    Realize o pagamento via PIX e clique abaixo para avisar o vendedor.
                  </p>
                )}
                <button
                  className="btn-primary w-full btn-sm"
                  onClick={() => declarePaymentMutation.mutate()}
                  disabled={declarePaymentMutation.isPending}
                >
                  {declarePaymentMutation.isPending ? 'Aguarde...' : 'Confirmar que realizei o pagamento'}
                </button>
              </div>
            )}

            {/* Status: pagamento declarado */}
            {displayStatus === 'PAYMENT_DECLARED' && (
              <div className="space-y-3">
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                  {isWinner
                    ? 'Pagamento declarado. Aguardando confirmação do vendedor.'
                    : 'O vencedor declarou que realizou o pagamento. Verifique seu extrato.'}
                </div>
                {isWinner && auction.company?.pixKey && (
                  <PixPaymentBlock
                    pixKey={auction.company.pixKey}
                    sellerName={auction.sellerName}
                    amount={displayPrice}
                  />
                )}
              </div>
            )}

            {/* Vendedor confirma ou contesta */}
            {displayStatus === 'PAYMENT_DECLARED' && isSeller && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <button
                  className="btn-primary w-full btn-sm"
                  onClick={() => confirmPaymentMutation.mutate()}
                  disabled={confirmPaymentMutation.isPending || disputePaymentMutation.isPending}
                >
                  {confirmPaymentMutation.isPending ? 'Aguarde...' : 'Confirmar recebimento'}
                </button>
                <button
                  className="btn-danger w-full btn-sm"
                  onClick={() => disputePaymentMutation.mutate()}
                  disabled={confirmPaymentMutation.isPending || disputePaymentMutation.isPending}
                >
                  {disputePaymentMutation.isPending ? 'Aguarde...' : 'Contestar pagamento'}
                </button>
              </div>
            )}

            {/* Pagamento confirmado */}
            {displayStatus === 'PAYMENT_CONFIRMED' && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                {isWinner
                  ? 'Pagamento confirmado pelo vendedor. Entre em contato para combinar a entrega.'
                  : 'Pagamento confirmado. Combine a entrega com o comprador.'}
              </div>
            )}

            {/* Pagamento contestado */}
            {displayStatus === 'PAYMENT_DISPUTED' && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {isWinner
                  ? 'O vendedor não identificou seu pagamento. Entre em contato com o suporte.'
                  : 'Você contestou o pagamento. O suporte foi notificado.'}
              </div>
            )}

            {isFinishedNow && displayStatus === 'FINISHED_NO_BIDS' && (
              <div className="rounded-md bg-orange-50 border border-orange-200 p-3 text-sm text-orange-700">
                Leilão encerrado sem lances.
              </div>
            )}

            {/* Bid form */}
            {isActive && !isSeller && !isFinishedNow && (
              <BidForm
                auctionId={auction.id}
                nextMinimumBid={displayNextBid}
                minIncrementAmount={auction.minIncrementAmount}
                disabled={isFinishedNow}
              />
            )}
            {isActive && isSeller && (
              <p className="text-xs text-gray-400">Você é o vendedor e não pode dar lances.</p>
            )}

            {/* Seller actions */}
            {isSeller && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {auction.status === 'DRAFT' && (
                  <>
                    <button
                      className="btn-secondary w-full btn-sm"
                      onClick={() => navigate(`/auctions/${id}/edit`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-primary w-full btn-sm"
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending}
                    >
                      Enviar para aprovação
                    </button>
                  </>
                )}
                {auction.status === 'REJECTED' && (
                  <>
                    <button
                      className="btn-secondary w-full btn-sm"
                      onClick={() => navigate(`/auctions/${id}/edit`)}
                    >
                      Editar e reenviar
                    </button>
                    <button
                      className="btn-primary w-full btn-sm"
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending}
                    >
                      Reenviar para aprovação
                    </button>
                  </>
                )}
                {auction.status === 'READY_TO_START' && (
                  <>
                    <button
                      className="btn-primary w-full btn-sm"
                      onClick={() => startMutation.mutate()}
                      disabled={startMutation.isPending}
                    >
                      Iniciar leilão
                    </button>
                    <button
                      className="btn-danger w-full btn-sm"
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="card p-4 text-xs text-gray-400 space-y-1">
            <p>Preço inicial: {formatBRL(auction.initialPriceAmount)}</p>
            <p>Incremento mínimo: {formatBRL(auction.minIncrementAmount)}</p>
            <p>Duração: {Math.round(auction.durationSeconds / 60)} min</p>
          </div>
        </div>
      </div>
    </div>
  )
}
