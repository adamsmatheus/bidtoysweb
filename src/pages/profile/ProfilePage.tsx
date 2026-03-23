import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/userApi'
import { useAuthStore } from '@/store/authStore'

export function ProfilePage() {
  const { userId, setName } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => userApi.me(),
    enabled: !!userId,
  })

  const [form, setForm] = useState({ name: '', phoneNumber: '' })

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, phoneNumber: user.phoneNumber ?? '' })
    }
  }, [user])

  const mutation = useMutation({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  if (!user) {
    return <div className="max-w-xl mx-auto px-4 py-8 animate-pulse space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu perfil</h1>

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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t border-gray-100 pt-4">
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

          {mutation.isSuccess && (
            <p className="text-sm text-green-600">Perfil atualizado!</p>
          )}

          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  )
}
