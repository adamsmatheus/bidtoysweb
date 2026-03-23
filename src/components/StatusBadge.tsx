import type { AuctionStatus } from '@/types/auction'

const CONFIG: Record<AuctionStatus, { label: string; className: string }> = {
  DRAFT:               { label: 'Rascunho',         className: 'bg-gray-100 text-gray-700' },
  PENDING_APPROVAL:    { label: 'Aguardando aprovação', className: 'bg-yellow-100 text-yellow-800' },
  REJECTED:            { label: 'Rejeitado',         className: 'bg-red-100 text-red-700' },
  READY_TO_START:      { label: 'Pronto para iniciar', className: 'bg-blue-100 text-blue-700' },
  CANCELLED:           { label: 'Cancelado',         className: 'bg-gray-100 text-gray-500' },
  ACTIVE:              { label: 'Ativo',             className: 'bg-green-100 text-green-800' },
  FINISHED_WITH_WINNER:{ label: 'Encerrado',         className: 'bg-purple-100 text-purple-700' },
  FINISHED_NO_BIDS:    { label: 'Sem lances',        className: 'bg-orange-100 text-orange-700' },
}

interface Props {
  status: AuctionStatus
}

export function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status]
  return <span className={`badge ${className}`}>{label}</span>
}
