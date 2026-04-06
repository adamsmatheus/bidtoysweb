import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bidApi } from '@/api/bidApi'
import { formatBRL } from '@/utils/currency'

interface Props {
  auctionId: string
  nextMinimumBid: number
  minIncrementAmount: number
  disabled?: boolean
}

interface ConfirmModalProps {
  amount: number
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function ConfirmModal({ amount, onConfirm, onCancel, isPending }: ConfirmModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center space-y-6">
        <div>
          <p className="text-lg font-semibold text-gray-800 mb-1">Confirmar lance</p>
          <p className="text-sm text-gray-500">Você está prestes a dar um lance de</p>
        </div>

        <div className="bg-primary-50 rounded-xl py-5 px-4">
          <p className="text-4xl font-extrabold text-primary-700 tracking-tight">
            {formatBRL(amount)}
          </p>
        </div>

        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Após a confirmação, o lance <strong>não poderá ser cancelado ou ajustado</strong>.
        </p>

        <div className="flex gap-3">
          <button
            className="btn-secondary flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            Não
          </button>
          <button
            className="btn-primary flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Enviando...' : 'Sim, confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function BidForm({ auctionId, nextMinimumBid, minIncrementAmount, disabled }: Props) {
  const [amount, setAmount] = useState('')
  const [decimalError, setDecimalError] = useState(false)
  const [incrementError, setIncrementError] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      bidApi.place(auctionId, {
        amount: Number(amount),
        requestId: crypto.randomUUID(),
      }),
    onSuccess: () => {
      setAmount('')
      setShowConfirm(false)
      queryClient.invalidateQueries({ queryKey: ['bids', auctionId] })
    },
    onError: () => {
      setShowConfirm(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = Number(amount)
    if (!val || val < nextMinimumBid) return
    if (!Number.isInteger(val)) {
      setDecimalError(true)
      return
    }
    setDecimalError(false)
    if ((val - (nextMinimumBid - minIncrementAmount)) % minIncrementAmount !== 0) {
      setIncrementError(true)
      return
    }
    setIncrementError(false)
    setShowConfirm(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    setDecimalError(false)
    setIncrementError(false)
  }

  const errorMsg = (() => {
    const err = mutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label">
            Seu lance (mínimo {formatBRL(nextMinimumBid)})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              className="input flex-1"
              placeholder={nextMinimumBid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              value={amount}
              onChange={handleChange}
              min={nextMinimumBid}
              step={minIncrementAmount}
              disabled={disabled || mutation.isPending}
              required
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={disabled || mutation.isPending || !amount}
            >
              Dar lance
            </button>
          </div>
        </div>

        {decimalError && (
          <p className="text-sm text-red-600">O lance deve ser um valor inteiro, sem centavos.</p>
        )}
        {incrementError && (
          <p className="text-sm text-red-600">O lance deve ser múltiplo de {formatBRL(minIncrementAmount)} (ex: {formatBRL(nextMinimumBid)}, {formatBRL(nextMinimumBid + minIncrementAmount)}, ...).</p>
        )}
        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
        {mutation.isSuccess && (
          <p className="text-sm text-green-600">Lance registrado com sucesso!</p>
        )}
      </form>

      {showConfirm && (
        <ConfirmModal
          amount={Number(amount)}
          onConfirm={() => mutation.mutate()}
          onCancel={() => setShowConfirm(false)}
          isPending={mutation.isPending}
        />
      )}
    </>
  )
}
