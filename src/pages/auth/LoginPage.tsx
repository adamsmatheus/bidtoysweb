import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'

function BlockedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl text-red-600">gavel</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Conta desativada</h2>
        <p className="text-sm text-gray-600 mb-6">
          Sua conta foi desativada por denúncia de mau comportamento. Se acredita que isso é um engano, entre em contato com o suporte.
        </p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showBlockedModal, setShowBlockedModal] = useState(false)
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password }, {
      onError: (err: any) => {
        if (err?.response?.data?.code === 'USER_BLOCKED') {
          setShowBlockedModal(true)
        }
      },
    })
  }

  const errorMsg = (() => {
    const err = login.error as { response?: { data?: { message?: string; code?: string } } } | null
    if (err?.response?.data?.code === 'USER_BLOCKED') return null
    return err?.response?.data?.message ?? null
  })()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {showBlockedModal && <BlockedModal onClose={() => setShowBlockedModal(false)} />}

      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Entrar</h1>

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
          <div>
            <label className="label">Senha</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={login.isPending}
          >
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          <Link to="/forgot-password" className="text-primary-600 hover:underline">
            Esqueci minha senha
          </Link>
        </p>

        <p className="text-sm text-center text-gray-500 mt-2">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
