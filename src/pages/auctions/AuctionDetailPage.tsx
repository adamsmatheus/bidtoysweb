import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { bidApi } from '@/api/bidApi'
import { useAuctionSocket } from '@/hooks/useAuctionSocket'
import { useAuctionStore } from '@/store/auctionStore'
import { useAuthStore } from '@/store/authStore'
import { StatusBadge } from '@/components/StatusBadge'
import { CountdownTimer } from '@/components/CountdownTimer'
import { BidForm } from '@/components/BidForm'

export function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userId } = useAuthStore()
  const { setLiveAuction, currentPrice, nextMinimumBid, endsAt, isFinished, status: liveStatus, winnerUserId, reset } = useAuctionStore()

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionApi.get(id!),
    enabled: !!id,
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

            <p className="text-sm text-gray-400">Vendedor: {auction.sellerName}</p>
          </div>

          {/* Bid list */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Histórico de lances</h2>
            {bidsPage?.content.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum lance ainda.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {bidsPage?.content.map((bid) => (
                  <li key={bid.id} className="py-2 flex justify-between text-sm">
                    <span className="text-gray-500 font-mono">{bid.bidderId.slice(0, 8)}...</span>
                    <span className="font-semibold text-primary-700">
                      R$ {bid.amount.toLocaleString('pt-BR')}
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
                R$ {displayPrice.toLocaleString('pt-BR')}
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
                {winnerUserId === userId || auction.winnerUserId === userId
                  ? '🏆 Você ganhou este leilão!'
                  : `Vencedor: ${(winnerUserId ?? auction.winnerUserId ?? '').slice(0, 8)}...`}
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
            <p>Preço inicial: R$ {auction.initialPriceAmount.toLocaleString('pt-BR')}</p>
            <p>Incremento mínimo: R$ {auction.minIncrementAmount.toLocaleString('pt-BR')}</p>
            <p>Duração: {Math.round(auction.durationSeconds / 60)} min</p>
          </div>
        </div>
      </div>
    </div>
  )
}
