import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/authApi'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => navigate('/reset-password', { state: { email } }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  const errorMsg = (() => {
    const err = mutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Esqueci minha senha</h1>
        <p className="text-sm text-gray-500 mb-6">
          Informe seu e-mail e enviaremos um código via WhatsApp para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
