import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/userApi'
import { companyApi } from '@/api/companyApi'
import { useAuthStore } from '@/store/authStore'
import { Toast } from '@/components/Toast'

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
  const [companyForm, setCompanyForm] = useState({ name: '', description: '', logoUrl: '', pixKey: '' })
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({ cep: '', street: '', city: '', state: '', number: '', complement: '' })
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [editingCompany, setEditingCompany] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, phoneNumber: user.phoneNumber ?? '' })
      if (user.address) {
        setAddressForm({
          cep: user.address.cep,
          street: user.address.street,
          city: user.address.city,
          state: user.address.state,
          number: user.address.number,
          complement: user.address.complement ?? '',
        })
      }
    }
  }, [user])

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name,
        description: company.description ?? '',
        logoUrl: company.logoUrl ?? '',
        pixKey: company.pixKey ?? '',
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
      setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' })
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
        pixKey: companyForm.pixKey || undefined,
      })
    },
    onSuccess: (data) => {
      setLogoFile(null)
      setLogoPreview(null)
      setCompanyForm((p) => ({ ...p, logoUrl: data.logoUrl ?? '' }))
      setEditingCompany(false)
      queryClient.invalidateQueries({ queryKey: ['my-company'] })
      queryClient.invalidateQueries({ queryKey: ['companies-active'] })
      setToast({ message: 'Empresa salva com sucesso!', type: 'success' })
    },
  })

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    userMutation.mutate()
  }

  const deleteMutation = useMutation({
    mutationFn: () => companyApi.deleteMe(),
    onSuccess: () => {
      setCompanyForm({ name: '', description: '', logoUrl: '', pixKey: '' })
      setLogoFile(null)
      setLogoPreview(null)
      setConfirmDelete(false)
      queryClient.invalidateQueries({ queryKey: ['my-company'] })
      queryClient.invalidateQueries({ queryKey: ['companies-active'] })
      setToast({ message: 'Empresa excluída com sucesso.', type: 'success' })
    },
  })

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    companyMutation.mutate()
  }

  const addressMutation = useMutation({
    mutationFn: () => userApi.updateAddress({
      cep: addressForm.cep,
      street: addressForm.street,
      city: addressForm.city,
      state: addressForm.state,
      number: addressForm.number,
      complement: addressForm.complement || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setEditingAddress(false)
      setToast({ message: 'Endereço atualizado com sucesso!', type: 'success' })
    },
  })

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addressMutation.mutate()
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw
    setAddressForm((p) => ({ ...p, cep: formatted, street: '', city: '', state: '' }))
    setCepError(null)

    if (raw.length === 8) {
      setIsFetchingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
        const data = await res.json()
        if (data.erro) {
          setCepError('CEP não encontrado.')
        } else {
          setAddressForm((p) => ({ ...p, cep: formatted, street: data.logradouro, city: data.localidade, state: data.uf }))
        }
      } catch {
        setCepError('Erro ao buscar CEP. Preencha manualmente.')
      } finally {
        setIsFetchingCep(false)
      }
    }
  }

  if (!user) {
    return <div className="max-w-xl mx-auto px-4 py-8 animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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

          <button type="submit" className="btn-primary" disabled={userMutation.isPending}>
            {userMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>

      {/* Endereço */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Meu Endereço</h2>
            <p className="text-sm text-gray-500">Usado para envio dos arremates.</p>
          </div>
          {!editingAddress && (
            <button
              type="button"
              onClick={() => setEditingAddress(true)}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              {user.address ? 'Editar' : 'Adicionar'}
            </button>
          )}
        </div>

        {!editingAddress ? (
          user.address ? (
            <div className="space-y-1 text-sm text-gray-700">
              <p>{user.address.street}, {user.address.number}{user.address.complement ? ` - ${user.address.complement}` : ''}</p>
              <p>{user.address.city} — {user.address.state}</p>
              <p className="text-gray-500">CEP: {user.address.cep}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Nenhum endereço cadastrado.</p>
          )
        ) : (
          <form onSubmit={handleAddressSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">CEP *</label>
                <input type="text" className="input" value={addressForm.cep} onChange={handleCepChange} required maxLength={9} placeholder="00000-000" />
                {isFetchingCep && <p className="text-xs text-gray-500 mt-1">Buscando endereço...</p>}
                {cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
              </div>
              <div>
                <label className="label">Estado *</label>
                <input type="text" className="input" value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value.toUpperCase() }))} required maxLength={2} placeholder="SP" />
              </div>
            </div>
            <div>
              <label className="label">Rua / Logradouro *</label>
              <input type="text" className="input" value={addressForm.street} onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Número *</label>
                <input type="text" className="input" value={addressForm.number} onChange={(e) => setAddressForm((p) => ({ ...p, number: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Complemento</label>
                <input type="text" className="input" value={addressForm.complement} onChange={(e) => setAddressForm((p) => ({ ...p, complement: e.target.value }))} placeholder="Apto, bloco..." />
              </div>
            </div>
            <div>
              <label className="label">Cidade *</label>
              <input type="text" className="input" value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} required />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn-primary" disabled={addressMutation.isPending}>
                {addressMutation.isPending ? 'Salvando...' : 'Salvar endereço'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditingAddress(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Empresa */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Minha Empresa</h2>
          {company && !editingCompany && (
            <button
              type="button"
              onClick={() => setEditingCompany(true)}
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Editar
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Necessário para criar leilões. Suas informações serão exibidas publicamente.
        </p>

        {/* Modo leitura — empresa já cadastrada e não editando */}
        {company && !editingCompany ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {company.logoUrl && (
                <img
                  src={company.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{company.name}</p>
                {company.description && <p className="text-sm text-gray-500 mt-0.5">{company.description}</p>}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-0.5">Chave PIX</p>
              <p className="text-sm font-medium text-gray-800">{company.pixKey ?? '—'}</p>
            </div>
            <div className="border-t border-gray-100 pt-3">
              {deleteMutation.isError && (
                <p className="text-sm text-red-600 mb-2">Não é possível excluir a empresa com leilões em andamento.</p>
              )}
              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Confirma a exclusão?</span>
                  <button type="button" className="btn-danger text-sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
                    {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar'}
                  </button>
                  <button type="button" className="btn-secondary text-sm" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                </div>
              ) : (
                <button type="button" className="btn-danger text-sm" onClick={() => setConfirmDelete(true)}>Deletar empresa</button>
              )}
            </div>
          </div>
        ) : (
          /* Formulário — cadastro ou edição */
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
              {company && <p className="text-xs text-gray-400 mt-1">O nome da empresa não pode ser alterado.</p>}
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={companyForm.description}
                onChange={(e) => setCompanyForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Breve descrição da sua empresa"
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
                <button type="button" onClick={() => logoInputRef.current?.click()} className="btn-secondary text-sm">
                  {companyForm.logoUrl || logoPreview ? 'Trocar logo' : 'Selecionar logo'}
                </button>
                {logoFile && <span className="text-sm text-gray-500 truncate max-w-[160px]">{logoFile.name}</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG ou WEBP · máx. 5 MB</p>
            </div>
            <div>
              <label className="label">Chave PIX {!company && <span className="text-red-500">*</span>}</label>
              <input
                type="text"
                className="input"
                value={companyForm.pixKey}
                onChange={(e) => setCompanyForm((p) => ({ ...p, pixKey: e.target.value }))}
                placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                maxLength={150}
                required={!company}
              />
              <p className="text-xs text-gray-400 mt-1">Será exibida ao vencedor para realizar o pagamento via PIX.</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn-primary" disabled={companyMutation.isPending}>
                {companyMutation.isPending ? 'Salvando...' : company ? 'Salvar alterações' : 'Cadastrar empresa'}
              </button>
              {company && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingCompany(false)
                    setLogoFile(null)
                    setLogoPreview(null)
                    setCompanyForm({ name: company.name, description: company.description ?? '', logoUrl: company.logoUrl ?? '', pixKey: company.pixKey ?? '' })
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
