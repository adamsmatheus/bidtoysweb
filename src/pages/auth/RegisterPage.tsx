import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '@/hooks/useAuth'

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
  })
  const register = useRegister()

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      phoneNumber: form.phoneNumber || undefined,
    })
  }

  const errorMsg = (() => {
    const err = register.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar conta</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input type="text" className="input" value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div>
            <label className="label">Telefone (opcional)</label>
            <input type="tel" className="input" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="(11) 99999-9999" />
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          {register.isSuccess && (
            <p className="text-sm text-green-600">Conta criada! Faça login.</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={register.isPending}>
            {register.isPending ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
