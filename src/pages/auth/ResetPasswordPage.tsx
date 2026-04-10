import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/authApi'

export function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [email, setEmail] = useState((location.state as { email?: string })?.email ?? '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword({ email, code, newPassword }),
    onSuccess: () => navigate('/login', { state: { passwordReset: true } }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    if (newPassword !== confirmPassword) {
      setLocalError('As senhas não coincidem.')
      return
    }
    mutation.mutate()
  }

  const errorMsg = localError ?? (() => {
    const err = mutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redefinir senha</h1>
        <p className="text-sm text-gray-500 mb-6">
          Digite o código de 6 dígitos enviado via WhatsApp e sua nova senha.
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
            />
          </div>

          <div>
            <label className="label">Código WhatsApp</label>
            <input
              type="text"
              className="input tracking-widest text-center text-lg"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Nova senha</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="label">Confirmar nova senha</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
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
            {mutation.isPending ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Não recebeu o código?{' '}
          <Link to="/forgot-password" className="text-primary-600 hover:underline">
            Reenviar
          </Link>
        </p>
      </div>
    </div>
  )
}
