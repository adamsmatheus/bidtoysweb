import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/userApi'
import { companyApi } from '@/api/companyApi'
import { useAuthStore } from '@/store/authStore'

export function ProfilePage() {
  const { userId, setName } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => userApi.me(),
    enabled: !!userId,
  })

  const { data: company } = useQuery({
    queryKey: ['my-company'],
    queryFn: () => companyApi.getMe(),
    enabled: !!userId,
  })

  const [form, setForm] = useState({ name: '', phoneNumber: '' })
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', logoUrl: '' })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, phoneNumber: user.phoneNumber ?? '' })
    }
  }, [user])

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name,
        description: company.description ?? '',
        logoUrl: company.logoUrl ?? '',
      })
    }
  }, [company])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. O tamanho máximo permitido é 5 MB.')
      e.target.value = ''
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const userMutation = useMutation({
    mutationFn: () =>
      userApi.update(userId!, {
        name: form.name,
        phoneNumber: form.phoneNumber || undefined,
      }),
    onSuccess: (updated) => {
      setName(updated.name)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const companyMutation = useMutation({
    mutationFn: async () => {
      let logoUrl = companyForm.logoUrl || undefined
      if (logoFile) {
        const result = await companyApi.uploadLogo(logoFile)
        logoUrl = result.logoUrl
      }
      return companyApi.upsertMe({
        name: companyForm.name,
        description: companyForm.description || undefined,
        logoUrl,
      })
    },
    onSuccess: (data) => {
      setLogoFile(null)
      setCompanyForm((p) => ({ ...p, logoUrl: data.logoUrl ?? '' }))
      queryClient.invalidateQueries({ queryKey: ['my-company'] })
      queryClient.invalidateQueries({ queryKey: ['companies-active'] })
    },
  })

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    userMutation.mutate()
  }

  const deleteMutation = useMutation({
    mutationFn: () => companyApi.deleteMe(),
    onSuccess: () => {
      setCompanyForm({ name: '', description: '', logoUrl: '' })
      setLogoFile(null)
      setLogoPreview(null)
      setConfirmDelete(false)
      queryClient.invalidateQueries({ queryKey: ['my-company'] })
      queryClient.invalidateQueries({ queryKey: ['companies-active'] })
    },
  })

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    companyMutation.mutate()
  }

  if (!user) {
    return <div className="max-w-xl mx-auto px-4 py-8 animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Meu perfil</h1>

      {/* Dados pessoais */}
      <div className="card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className={`badge text-xs mt-1 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
        </div>

        <form onSubmit={handleUserSubmit} className="space-y-4 mt-4 border-t border-gray-100 pt-4">
          <div>
            <label className="label">Nome</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              minLength={2}
            />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input
              type="tel"
              className="input"
              value={form.phoneNumber}
              onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          {userMutation.isSuccess && (
            <p className="text-sm text-green-600">Perfil atualizado!</p>
          )}

          <button type="submit" className="btn-primary" disabled={userMutation.isPending}>
            {userMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>

      {/* Empresa */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Minha Empresa</h2>
        <p className="text-sm text-gray-500 mb-4">
          Necessário para criar leilões. Suas informações serão exibidas publicamente.
        </p>

        <form onSubmit={handleCompanySubmit} className="space-y-4">
          <div>
            <label className="label">Nome da empresa *</label>
            <input
              type="text"
              className="input"
              value={companyForm.name}
              onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))}
              required
              minLength={2}
              maxLength={255}
              disabled={!!company}
            />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea
              className="input resize-none"
              rows={2}
              value={companyForm.description}
              onChange={(e) => setCompanyForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Breve descrição da sua empresa"
              disabled={!!company}
            />
          </div>
          <div>
            <label className="label">Logo da empresa</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
              disabled={!!company}
            />
            <div className="flex items-center gap-4">
              {(logoPreview || companyForm.logoUrl) && (
                <img
                  src={logoPreview ?? companyForm.logoUrl}
                  alt="Preview do logo"
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              {!company && (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  {companyForm.logoUrl || logoPreview ? 'Trocar logo' : 'Selecionar logo'}
                </button>
              )}
              {logoFile && (
                <span className="text-sm text-gray-500 truncate max-w-[160px]">{logoFile.name}</span>
              )}
            </div>
            {!company && (
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG ou WEBP · máx. 5 MB</p>
            )}
          </div>

          {companyMutation.isSuccess && (
            <p className="text-sm text-green-600">Empresa salva!</p>
          )}

          {deleteMutation.isError && (
            <p className="text-sm text-red-600">
              Não é possível excluir a empresa com leilões em andamento.
            </p>
          )}

          {company ? (
            <div className="flex items-center gap-3 pt-1">
              {confirmDelete ? (
                <>
                  <span className="text-sm text-gray-600">Confirma a exclusão da empresa?</span>
                  <button
                    type="button"
                    className="btn-danger text-sm"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleteMutation.isPending}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-danger text-sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  Deletar empresa
                </button>
              )}
            </div>
          ) : (
            <button type="submit" className="btn-primary" disabled={companyMutation.isPending}>
              {companyMutation.isPending ? 'Salvando...' : 'Cadastrar empresa'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
