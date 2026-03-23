import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { adminApi } from '@/api/adminApi'
import { StatusBadge } from '@/components/StatusBadge'

export function AuctionReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const { data: auction, isLoading } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionApi.get(id!),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: () => adminApi.approve(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auctions-pending'] })
      navigate('/admin/auctions')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.reject(id!, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auctions-pending'] })
      navigate('/admin/auctions')
    },
  })

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  }

  if (!auction) return <p className="text-center py-16 text-gray-500">Leilão não encontrado.</p>

  const canAct = auction.status === 'PENDING_APPROVAL'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Revisar leilão</h1>

      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{auction.title}</h2>
          <StatusBadge status={auction.status} />
        </div>

        {auction.description && (
          <p className="text-gray-600 mb-4">{auction.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Vendedor</span>
            <p className="font-medium">{auction.sellerName}</p>
          </div>
          <div>
            <span className="text-gray-500">Preço inicial</span>
            <p className="font-medium">R$ {auction.initialPriceAmount.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <span className="text-gray-500">Incremento mínimo</span>
            <p className="font-medium">R$ {auction.minIncrementAmount.toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <span className="text-gray-500">Duração</span>
            <p className="font-medium">{Math.round(auction.durationSeconds / 60)} minutos</p>
          </div>
          <div>
            <span className="text-gray-500">Criado em</span>
            <p className="font-medium">{new Date(auction.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <span className="text-gray-500">Enviado em</span>
            <p className="font-medium">{new Date(auction.updatedAt).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {canAct && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Decisão</h3>

          <div className="flex gap-3">
            <button
              className="btn-primary flex-1"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
            </button>
            <button
              className="btn-danger flex-1"
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={approveMutation.isPending}
            >
              Rejeitar
            </button>
          </div>

          {showRejectForm && (
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <div>
                <label className="label">Motivo da rejeição *</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique o motivo da rejeição..."
                  required
                />
              </div>
              <button
                className="btn-danger"
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejeitando...' : 'Confirmar rejeição'}
              </button>
            </div>
          )}
        </div>
      )}

      {!canAct && (
        <div className="card p-4 text-sm text-gray-500">
          Este leilão já foi processado (status: {auction.status}).
        </div>
      )}
    </div>
  )
}
