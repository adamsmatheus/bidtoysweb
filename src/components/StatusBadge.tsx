import type { AuctionStatus } from '@/types/auction'

const CONFIG: Record<AuctionStatus, { label: string; className: string }> = {
  DRAFT:                { label: 'Rascunho',             className: 'bg-outline-variant/30 text-on-surface-variant' },
  PENDING_APPROVAL:     { label: 'Aguardando aprovação', className: 'bg-surface-container-highest text-on-surface-variant' },
  REJECTED:             { label: 'Rejeitado',            className: 'bg-error-container text-on-error-container' },
  READY_TO_START:       { label: 'Pronto',               className: 'bg-primary-container text-on-primary-container' },
  CANCELLED:            { label: 'Cancelado',            className: 'bg-surface-container text-on-surface-variant' },
  ACTIVE:               { label: 'Ativo',                className: 'bg-tertiary-container text-on-tertiary-container' },
  FINISHED_WITH_WINNER: { label: 'Encerrado',            className: 'bg-on-surface text-surface' },
  FINISHED_NO_BIDS:     { label: 'Sem lances',           className: 'bg-surface-container-high text-on-surface-variant' },
  PAYMENT_DECLARED:     { label: 'Pag. declarado',       className: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_CONFIRMED:    { label: 'Pag. confirmado',      className: 'bg-green-100 text-green-800' },
  PAYMENT_DISPUTED:     { label: 'Pag. contestado',      className: 'bg-red-100 text-red-800' },
}

interface Props {
  status: AuctionStatus
}

export function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`badge ${className}`}>
      {label}
    </span>
  )
}
