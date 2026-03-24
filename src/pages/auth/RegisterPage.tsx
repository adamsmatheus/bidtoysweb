import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useRegister } from '@/hooks/useAuth'
import { authApi } from '@/api/authApi'

type Step = 'form' | 'verify'

export function RegisterPage() {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    whatsappNumber: '',
    verificationCode: '',
  })

  const register = useRegister()

  const sendCode = useMutation({
    mutationFn: () => authApi.sendWhatsAppCode({ phoneNumber: form.whatsappNumber }),
    onSuccess: () => setStep('verify'),
  })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    sendCode.mutate()
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      whatsappNumber: form.whatsappNumber,
      verificationCode: form.verificationCode,
    })
  }

  const getErrorMsg = (mutation: typeof register | typeof sendCode) => {
    const err = mutation.error as { response?: { data?: { message?: string } } } | null
    return err?.response?.data?.message ?? null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar conta</h1>

        {step === 'form' && (
          <form onSubmit={handleSendCode} className="space-y-4">
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
              <label className="label">WhatsApp</label>
              <input
                type="tel"
                className="input"
                value={form.whatsappNumber}
                onChange={set('whatsappNumber')}
                placeholder="+55 11 99999-9999"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Você receberá um código de verificação neste número.
              </p>
            </div>

            {getErrorMsg(sendCode) && (
              <p className="text-sm text-red-600">{getErrorMsg(sendCode)}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={sendCode.isPending}>
              {sendCode.isPending ? 'Enviando código...' : 'Enviar código de verificação'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                Código enviado para <strong>{form.whatsappNumber}</strong>. Verifique seu WhatsApp.
              </p>
            </div>

            <div>
              <label className="label">Código de verificação</label>
              <input
                type="text"
                className="input text-center tracking-widest text-lg"
                value={form.verificationCode}
                onChange={set('verificationCode')}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            {getErrorMsg(register) && (
              <p className="text-sm text-red-600">{getErrorMsg(register)}</p>
            )}

            {register.isSuccess && (
              <p className="text-sm text-green-600">Conta criada! Faça login.</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={register.isPending}>
              {register.isPending ? 'Criando conta...' : 'Criar conta'}
            </button>

            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => { setStep('form'); sendCode.reset() }}
            >
              Voltar e alterar número
            </button>

            <button
              type="button"
              className="text-sm text-primary-600 hover:underline w-full text-center"
              disabled={sendCode.isPending}
              onClick={() => { sendCode.reset(); sendCode.mutate() }}
            >
              {sendCode.isPending ? 'Reenviando...' : 'Reenviar código'}
            </button>
          </form>
        )}

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
