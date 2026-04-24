import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useRegister } from '@/hooks/useAuth'
import { authApi } from '@/api/authApi'

type Step = 'form' | 'address' | 'verify'

const COUNTRY_CODES = [
  { code: '+55', iso: 'br', name: 'Brasil' },
  { code: '+1', iso: 'us', name: 'EUA / Canadá' },
  { code: '+54', iso: 'ar', name: 'Argentina' },
  { code: '+598', iso: 'uy', name: 'Uruguai' },
  { code: '+595', iso: 'py', name: 'Paraguai' },
  { code: '+56', iso: 'cl', name: 'Chile' },
  { code: '+51', iso: 'pe', name: 'Peru' },
  { code: '+57', iso: 'co', name: 'Colômbia' },
  { code: '+58', iso: 've', name: 'Venezuela' },
  { code: '+591', iso: 'bo', name: 'Bolívia' },
  { code: '+593', iso: 'ec', name: 'Equador' },
  { code: '+52', iso: 'mx', name: 'México' },
  { code: '+34', iso: 'es', name: 'Espanha' },
  { code: '+351', iso: 'pt', name: 'Portugal' },
  { code: '+44', iso: 'gb', name: 'Reino Unido' },
  { code: '+49', iso: 'de', name: 'Alemanha' },
  { code: '+33', iso: 'fr', name: 'França' },
  { code: '+39', iso: 'it', name: 'Itália' },
  { code: '+31', iso: 'nl', name: 'Holanda' },
  { code: '+81', iso: 'jp', name: 'Japão' },
  { code: '+82', iso: 'kr', name: 'Coreia do Sul' },
  { code: '+86', iso: 'cn', name: 'China' },
  { code: '+91', iso: 'in', name: 'Índia' },
  { code: '+61', iso: 'au', name: 'Austrália' },
  { code: '+7', iso: 'ru', name: 'Rússia' },
  { code: '+27', iso: 'za', name: 'África do Sul' },
  { code: '+234', iso: 'ng', name: 'Nigéria' },
  { code: '+971', iso: 'ae', name: 'Emirados Árabes' },
]

function flagUrl(iso: string) {
  return `https://flagcdn.com/w40/${iso}.png`
}

function CountryCodePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (code: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = COUNTRY_CODES.find((c) => c.code === value) ?? COUNTRY_CODES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input flex items-center gap-2 w-24 cursor-pointer select-none"
      >
        <img src={flagUrl(selected.iso)} alt={selected.name} className="w-5 h-auto rounded-sm" />
        <span className="text-sm font-medium">{selected.code}</span>
        <svg className="w-3 h-3 ml-auto text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {COUNTRY_CODES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onChange(c.code); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 ${c.code === value ? 'bg-primary-50 font-medium' : ''}`}
            >
              <img src={flagUrl(c.iso)} alt={c.name} className="w-6 h-auto rounded-sm shrink-0" />
              <span className="flex-1 text-left">{c.name}</span>
              <span className="text-gray-400">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ViaCepResponse {
  logradouro: string
  localidade: string
  uf: string
  erro?: boolean
}

export function RegisterPage() {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+55',
    whatsappNumber: '',
    verificationCode: '',
    cep: '',
    street: '',
    city: '',
    state: '',
    number: '',
    complement: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  const register = useRegister()

  const fullPhone = () => `${form.countryCode}${form.whatsappNumber}`

  const sendCode = useMutation({
    mutationFn: () => authApi.sendWhatsAppCode({ phoneNumber: fullPhone() }),
    onSuccess: () => setStep('verify'),
  })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw
    setForm((prev) => ({ ...prev, cep: formatted, street: '', city: '', state: '' }))
    setCepError(null)

    if (raw.length === 8) {
      setIsFetchingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
        const data: ViaCepResponse = await res.json()
        if (data.erro) {
          setCepError('CEP não encontrado.')
        } else {
          setForm((prev) => ({
            ...prev,
            cep: formatted,
            street: data.logradouro,
            city: data.localidade,
            state: data.uf,
          }))
        }
      } catch {
        setCepError('Erro ao buscar CEP. Preencha manualmente.')
      } finally {
        setIsFetchingCep(false)
      }
    }
  }

  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }
    setPasswordError(null)
    setStep('address')
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      password: form.password,
      whatsappNumber: fullPhone(),
      verificationCode: form.verificationCode,
      address: {
        cep: form.cep,
        street: form.street,
        city: form.city,
        state: form.state,
        number: form.number,
        complement: form.complement || undefined,
      },
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
          <form onSubmit={handleFormNext} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nome</label>
                <input type="text" className="input" value={form.firstName} onChange={set('firstName')} required autoFocus />
              </div>
              <div>
                <label className="label">Sobrenome</label>
                <input type="text" className="input" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" className="input" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-3.364l-14.728 14.728" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirmar senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-3.364l-14.728 14.728" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-600 mt-1">{passwordError}</p>}
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <div className="flex gap-2">
                <CountryCodePicker
                  value={form.countryCode}
                  onChange={(code) => setForm((prev) => ({ ...prev, countryCode: code }))}
                />
                <input
                  type="tel"
                  className="input flex-1"
                  value={form.whatsappNumber}
                  onChange={set('whatsappNumber')}
                  placeholder="11 99999-9999"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Você receberá um código de verificação neste número.
              </p>
            </div>

            <button type="submit" className="btn-primary w-full">
              Próximo
            </button>
          </form>
        )}

        {step === 'address' && (
          <form onSubmit={(e) => { e.preventDefault(); sendCode.mutate() }} className="space-y-4">
            <div>
              <label className="label">CEP</label>
              <input
                type="text"
                className="input"
                value={form.cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                required
                autoFocus
              />
              {isFetchingCep && <p className="text-xs text-gray-500 mt-1">Buscando endereço...</p>}
              {cepError && <p className="text-xs text-red-600 mt-1">{cepError}</p>}
            </div>
            <div>
              <label className="label">Rua</label>
              <input type="text" className="input" value={form.street} onChange={set('street')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cidade</label>
                <input type="text" className="input" value={form.city} onChange={set('city')} required />
              </div>
              <div>
                <label className="label">Estado</label>
                <input type="text" className="input" value={form.state} onChange={set('state')} maxLength={2} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Número</label>
                <input type="text" className="input" value={form.number} onChange={set('number')} required autoComplete="off" />
              </div>
              <div>
                <label className="label">Complemento</label>
                <input type="text" className="input" value={form.complement} onChange={set('complement')} placeholder="Apto, sala..." />
              </div>
            </div>

            {getErrorMsg(sendCode) && (
              <p className="text-sm text-red-600">{getErrorMsg(sendCode)}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={sendCode.isPending}>
              {sendCode.isPending ? 'Enviando código...' : 'Enviar código de verificação'}
            </button>

            <button type="button" className="btn-secondary w-full" onClick={() => setStep('form')}>
              Voltar
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                Código enviado para <strong>{fullPhone()}</strong>. Verifique seu WhatsApp.
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
              onClick={() => { setStep('address'); sendCode.reset() }}
            >
              Voltar
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
