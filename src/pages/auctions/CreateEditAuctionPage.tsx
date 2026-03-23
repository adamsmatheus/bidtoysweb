import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'

export function CreateEditAuctionPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: existing } = useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionApi.get(id!),
    enabled: isEdit,
  })

  const [form, setForm] = useState({
    title: '',
    description: '',
    initialPriceAmount: '',
    minIncrementAmount: '',
    durationSeconds: '',
  })

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description ?? '',
        initialPriceAmount: String(existing.initialPriceAmount),
        minIncrementAmount: String(existing.minIncrementAmount),
        durationSeconds: String(existing.durationSeconds),
      })
    }
  }, [existing])

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const createMutation = useMutation({
    mutationFn: () =>
      auctionApi.create({
        title: form.title,
        description: form.description || undefined,
        initialPriceAmount: Number(form.initialPriceAmount),
        minIncrementAmount: Number(form.minIncrementAmount),
        durationSeconds: Number(form.durationSeconds),
      }),
    onSuccess: (data) => navigate(`/auctions/${data.id}`),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      auctionApi.update(id!, {
        title: form.title,
        description: form.description || undefined,
        initialPriceAmount: Number(form.initialPriceAmount),
        minIncrementAmount: Number(form.minIncrementAmount),
        durationSeconds: Number(form.durationSeconds),
      }),
    onSuccess: () => navigate(`/auctions/${id}`),
  })

  const mutation = isEdit ? updateMutation : createMutation

  const errorMsg = (() => {
    const err = mutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Editar leilão' : 'Criar leilão'}
      </h1>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Título *</label>
            <input
              type="text"
              className="input"
              value={form.title}
              onChange={set('title')}
              required
              minLength={5}
              maxLength={255}
            />
          </div>

          <div>
            <label className="label">Descrição</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Preço inicial (R$) *</label>
              <input
                type="number"
                className="input"
                value={form.initialPriceAmount}
                onChange={set('initialPriceAmount')}
                required
                min={1}
                step={1}
              />
            </div>
            <div>
              <label className="label">Incremento mínimo (R$) *</label>
              <input
                type="number"
                className="input"
                value={form.minIncrementAmount}
                onChange={set('minIncrementAmount')}
                required
                min={1}
                step={1}
              />
            </div>
          </div>

          <div>
            <label className="label">Duração (segundos, mínimo 60) *</label>
            <input
              type="number"
              className="input"
              value={form.durationSeconds}
              onChange={set('durationSeconds')}
              required
              min={60}
              step={60}
              placeholder="ex: 3600 (1 hora)"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar leilão'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
