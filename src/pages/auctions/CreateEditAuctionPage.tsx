import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { companyApi } from '@/api/companyApi'
import { useAuthStore } from '@/store/authStore'

const MAX_IMAGES = 5
const EDITABLE_STATUSES = ['DRAFT', 'REJECTED']

interface StagedFile {
  file: File
  preview: string
}

export function CreateEditAuctionPage() {
  const { id } = useParams<{ id: string }>()
  const { userId } = useAuthStore()
  const [createdId, setCreatedId] = useState<string | null>(null)
  const activeId = id ?? createdId
  const isEdit = !!id
  const hasAuction = !!activeId
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fotos selecionadas localmente antes da criação do leilão
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showDraftModal, setShowDraftModal] = useState(false)

  const { data: existing } = useQuery({
    queryKey: ['auction', activeId],
    queryFn: () => auctionApi.get(activeId!),
    enabled: hasAuction,
  })

  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['my-company'],
    queryFn: () => companyApi.getMe(),
    enabled: !!userId && !isEdit,
  })

  const [form, setForm] = useState({
    title: '',
    description: '',
    initialPriceAmount: '',
    minIncrementAmount: '',
    durationMinutes: '',
  })

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description ?? '',
        initialPriceAmount: String(existing.initialPriceAmount),
        minIncrementAmount: String(existing.minIncrementAmount),
        durationMinutes: String(Math.round(existing.durationSeconds / 60)),
      })
    }
  }, [existing])

  // Libera URLs de preview ao desmontar
  useEffect(() => {
    return () => {
      stagedFiles.forEach((s) => URL.revokeObjectURL(s.preview))
    }
  }, [stagedFiles])

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const setCurrency = (field: 'initialPriceAmount' | 'minIncrementAmount') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '')
      setForm((prev) => ({ ...prev, [field]: raw }))
    }

  const formatBRL = (raw: string): string => {
    if (!raw) return ''
    const n = parseInt(raw, 10)
    if (isNaN(n)) return ''
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      auctionApi.update(activeId!, {
        title: form.title,
        description: form.description || undefined,
        initialPriceAmount: Number(form.initialPriceAmount),
        minIncrementAmount: Number(form.minIncrementAmount),
        durationSeconds: Number(form.durationMinutes) * 60,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', activeId] }),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      auctionApi.create({
        title: form.title,
        description: form.description || undefined,
        initialPriceAmount: Number(form.initialPriceAmount),
        minIncrementAmount: Number(form.minIncrementAmount),
        durationSeconds: Number(form.durationMinutes) * 60,
      }),
    onSuccess: async (data) => {
      queryClient.setQueryData(['auction', data.id], data)

      // Upload das fotos staged em sequência
      if (stagedFiles.length > 0) {
        setIsUploading(true)
        try {
          for (const staged of stagedFiles) {
            await auctionApi.uploadImage(data.id, staged.file)
          }
          stagedFiles.forEach((s) => URL.revokeObjectURL(s.preview))
          setStagedFiles([])
          await queryClient.invalidateQueries({ queryKey: ['auction', data.id] })
        } finally {
          setIsUploading(false)
        }
      }

      setCreatedId(data.id)
      setShowDraftModal(true)
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => auctionApi.uploadImage(activeId!, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', activeId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => auctionApi.deleteImage(activeId!, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['auction', activeId] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hasAuction) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  // Seleciona foto antes da criação (staged)
  const handleStagedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const totalImages = stagedFiles.length
    if (totalImages >= MAX_IMAGES) return
    setStagedFiles((prev) => [...prev, { file, preview: URL.createObjectURL(file) }])
    e.target.value = ''
  }

  // Remove foto staged
  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  // Upload de foto adicional no modo edição (leilão já existe)
  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadMutation.mutate(file)
    e.target.value = ''
  }

  const canEditImages = hasAuction && !!existing && EDITABLE_STATUSES.includes(existing.status)
  const existingImages = existing?.images ?? []
  const totalImages = existingImages.length + stagedFiles.length
  const canAddMore = totalImages < MAX_IMAGES

  const isPending = createMutation.isPending || isUploading || updateMutation.isPending

  const errorMsg = (() => {
    const err = (createMutation.error ?? updateMutation.error) as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  const uploadErrorMsg = (() => {
    const err = uploadMutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  const buttonText = isPending
    ? isUploading ? 'Enviando fotos...' : 'Salvando...'
    : hasAuction
      ? 'Salvar alterações'
      : 'Criar leilão'

  if (!isEdit && isCompanyLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!isEdit && !company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 block">
          ← Voltar
        </button>
        <div className="card p-8 text-center space-y-3">
          <p className="text-lg font-semibold text-gray-800">Cadastre sua empresa primeiro</p>
          <p className="text-sm text-gray-500">
            Para criar um leilão, você precisa ter uma empresa cadastrada no seu perfil.
          </p>
          <Link to="/profile" className="btn-primary inline-block mt-2">
            Ir para o perfil
          </Link>
        </div>
      </div>
    )
  }

  if (showDraftModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Leilão criado como rascunho</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Seu leilão foi salvo como <strong>rascunho</strong>. Antes de ser publicado,
            ele precisa ser revisado e enviado para aprovação. Você pode fazer isso a qualquer
            momento em <strong>Meus leilões</strong>.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              className="btn-primary w-full"
              onClick={() => navigate('/my-auctions')}
            >
              Ver meus leilões
            </button>
            <button
              className="btn-secondary w-full"
              onClick={() => {
                setShowDraftModal(false)
                setCreatedId(null)
                setForm({ title: '', description: '', initialPriceAmount: '', minIncrementAmount: '', durationMinutes: '' })
                setStagedFiles([])
              }}
            >
              Criar novo leilão
            </button>
            <button
              className="btn-secondary w-full"
              onClick={() => setShowDraftModal(false)}
            >
              Continuar editando
            </button>
          </div>
        </div>
      </div>
    )
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
              <label className="label">Preço inicial *</label>
              <input
                type="text"
                inputMode="numeric"
                className="input"
                value={formatBRL(form.initialPriceAmount)}
                onChange={setCurrency('initialPriceAmount')}
                required
              />
            </div>
            <div>
              <label className="label">Incremento mínimo *</label>
              <input
                type="text"
                inputMode="numeric"
                className="input"
                value={formatBRL(form.minIncrementAmount)}
                onChange={setCurrency('minIncrementAmount')}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Duração (minutos, mínimo 1) *</label>
            <input
              type="number"
              className="input"
              value={form.durationMinutes}
              onChange={set('durationMinutes')}
              required
              min={1}
              step={1}
              placeholder="ex: 60 (1 hora)"
            />
          </div>

          {/* Seção de fotos na criação (antes de ter ID) */}
          {!hasAuction && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">
                  Fotos{' '}
                  <span className="text-sm font-normal text-gray-500">
                    ({stagedFiles.length}/{MAX_IMAGES})
                  </span>
                </label>
                <button
                  type="button"
                  className="btn-secondary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canAddMore}
                  onClick={() => fileInputRef.current?.click()}
                >
                  + Adicionar foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleStagedFileChange}
                />
              </div>

              {stagedFiles.length === 0 ? (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="text-sm text-gray-400">Clique para adicionar fotos do produto</p>
                  <p className="text-xs text-gray-300 mt-1">JPEG, PNG ou WebP · máx. {MAX_IMAGES} fotos</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {stagedFiles.map((staged, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={staged.preview}
                        alt="Foto do produto"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeStagedFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {canAddMore && (
                    <button
                      type="button"
                      className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isPending}
            >
              {buttonText}
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

      {/* Seção de fotos no modo edição (leilão já existe) */}
      {canEditImages && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Fotos{' '}
              <span className="text-sm font-normal text-gray-500">
                ({existingImages.length}/{MAX_IMAGES})
              </span>
            </h2>
            <button
              type="button"
              className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={existingImages.length >= MAX_IMAGES || uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadMutation.isPending ? 'Enviando...' : '+ Adicionar foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleUploadFileChange}
            />
          </div>

          {uploadErrorMsg && (
            <p className="text-sm text-red-600 mb-3">{uploadErrorMsg}</p>
          )}

          {existingImages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhuma foto adicionada ainda.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[...existingImages]
                .sort((a, b) => a.position - b.position)
                .map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img
                      src={img.fileUrl}
                      alt="Foto do leilão"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(img.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
