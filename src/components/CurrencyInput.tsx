import { useState } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function CurrencyInput({ value, onChange, placeholder = 'ex: 100', required }: Props) {
  const [focused, setFocused] = useState(false)

  const displayValue = focused
    ? value
    : value
      ? Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ''

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    onChange(digits)
  }

  return (
    <div className="flex items-center input p-0 overflow-hidden">
      <span className="px-3 text-gray-400 text-sm select-none border-r border-gray-200 h-full flex items-center">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        className="flex-1 px-3 py-2 outline-none bg-transparent text-sm"
        value={displayValue}
        placeholder={focused ? placeholder : ''}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
      />
    </div>
  )
}
