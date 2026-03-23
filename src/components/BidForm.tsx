import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bidApi } from '@/api/bidApi'

interface Props {
  auctionId: string
  nextMinimumBid: number
  disabled?: boolean
}

export function BidForm({ auctionId, nextMinimumBid, disabled }: Props) {
  const [amount, setAmount] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      bidApi.place(auctionId, {
        amount: Number(amount),
        requestId: crypto.randomUUID(),
      }),
    onSuccess: () => {
      setAmount('')
      queryClient.invalidateQueries({ queryKey: ['bids', auctionId] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = Number(amount)
    if (!val || val < nextMinimumBid) return
    mutation.mutate()
  }

  const errorMsg = (() => {
    const err = mutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">
          Seu lance (mínimo R$ {nextMinimumBid.toLocaleString('pt-BR')})
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            className="input flex-1"
            placeholder={`${nextMinimumBid}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={nextMinimumBid}
            step={1}
            disabled={disabled || mutation.isPending}
            required
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={disabled || mutation.isPending || !amount}
          >
            {mutation.isPending ? 'Enviando...' : 'Dar lance'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
      {mutation.isSuccess && (
        <p className="text-sm text-green-600">Lance registrado com sucesso!</p>
      )}
    </form>
  )
}
