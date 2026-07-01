import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/adminApi'
import { formatBRL } from '@/utils/currency'
import type { BuyerReportResponse } from '@/types/report'

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
  RESOLVED_DEACTIVATED: { label: 'Resolvido — Conta desativada', className: 'bg-red-100 text-red-700' },
  RESOLVED_KEPT_ACTIVE: { label: 'Resolvido — Conta mantida', className: 'bg-green-100 text-green-700' },
}

function SidebarLink({ to, icon, label, active = false }: { to: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${
        active
          ? 'bg-surface-container-low text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-low'
      }`}
    >
      <span className="material-symbols-outlined mr-3 text-base">{icon}</span>
      {label}
    </Link>
  )
}

function ReportCard({ report }: { report: BuyerReportResponse }) {
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const resolveMutation = useMutation({
    mutationFn: (action: string) => adminApi.resolveReport(report.id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-buyer-reports'] }),
  })

  const cfg = STATUS_CONFIG[report.status]
  const isPending = report.status === 'PENDING'

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} className="max-h-[90vh] max-w-full rounded-xl object-contain" />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.className}`}>
                {cfg.label}
              </span>
              {report.reportedUserStatus === 'BLOCKED' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                  Conta desativada
                </span>
              )}
            </div>
            <p className="font-bold text-gray-900 text-base">
              Comprador reportado: <span className="text-red-600">{report.reportedUserName}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Reportado por <span className="font-semibold text-gray-600">{report.reporterName}</span>
              {' · '}{new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className={`material-symbols-outlined transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
        </div>

        {/* Reason */}
        <div className="px-6 pb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivo do reporte</p>
          <p className="text-sm text-gray-800 whitespace-pre-line">{report.reason}</p>
        </div>

        {/* Images */}
        {report.imageUrls.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Imagens anexadas</p>
            <div className="flex gap-2 flex-wrap">
              {report.imageUrls.map((url, i) => (
                <button key={i} onClick={() => setLightbox(url)} className="group">
                  <img
                    src={url}
                    className="w-20 h-20 object-cover rounded-xl ring-1 ring-gray-200 group-hover:ring-2 group-hover:ring-blue-400 transition-all"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buyer contact */}
        <div className="px-6 pb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contato do comprador</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-500">mail</span>
              {report.buyerEmail}
            </span>
            {report.buyerPhone && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-green-500">phone</span>
                {report.buyerPhone}
              </span>
            )}
            {report.buyerAddress && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-green-600">location_on</span>
                {report.buyerAddress.street}, {report.buyerAddress.number} — {report.buyerAddress.city}/{report.buyerAddress.state}
              </span>
            )}
          </div>
        </div>

        {/* Purchase history (expandable) */}
        {expanded && (
          <div className="border-t border-gray-100">
            <div className="px-6 py-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Histórico de compras ({report.buyerAuctions.length} leilões)
              </p>
            </div>
            {report.buyerAuctions.length === 0 ? (
              <p className="px-6 pb-4 text-sm text-gray-400">Nenhuma compra registrada.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {report.buyerAuctions.slice(0, 10).map((a) => (
                  <Link
                    key={a.id}
                    to={`/auctions/${a.id}`}
                    className="flex items-center justify-between gap-3 px-6 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-gray-800 truncate flex-1">{a.title}</p>
                    <span className="text-sm font-bold text-primary-700 shrink-0">{formatBRL(a.currentPriceAmount)}</span>
                  </Link>
                ))}
                {report.buyerAuctions.length > 10 && (
                  <p className="px-6 py-2 text-xs text-gray-400">
                    +{report.buyerAuctions.length - 10} leilões não exibidos
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="border-t border-gray-100 px-6 py-4 flex gap-3 flex-wrap">
            <button
              onClick={() => resolveMutation.mutate('DEACTIVATE')}
              disabled={resolveMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">person_off</span>
              Desativar usuário
            </button>
            <button
              onClick={() => resolveMutation.mutate('KEEP_ACTIVE')}
              disabled={resolveMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Manter conta ativa
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export function BuyerReportsPage() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-buyer-reports'],
    queryFn: () => adminApi.listBuyerReports(),
  })

  const pending = reports.filter((r) => r.status === 'PENDING')
  const resolved = reports.filter((r) => r.status !== 'PENDING')

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 p-4 bg-white/60 backdrop-blur-sm border-r border-outline-variant/20">
        <div className="px-4 mb-8 mt-4">
          <h2 className="text-lg font-black text-primary">Admin Central</h2>
          <p className="text-xs text-on-surface-variant font-medium">Painel de Controle</p>
        </div>
        <nav className="flex-1 space-y-1">
          <SidebarLink to="/admin" icon="dashboard" label="Visão Geral" />
          <SidebarLink to="/admin/auctions" icon="pending_actions" label="Fila de Aprovação" />
          <SidebarLink to="/auctions" icon="gavel" label="Todos os Leilões" />
          <SidebarLink to="/admin/buyer-reports" icon="flag" label="Reportes" active />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Reportes de Compradores</h1>
          <p className="text-sm text-gray-500">Revise os reportes enviados pelos vendedores e tome uma decisão.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">flag</span>
            <p className="text-gray-500 font-medium">Nenhum reporte enviado ainda.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-yellow-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">pending</span>
                  Pendentes ({pending.length})
                </h2>
                <div className="space-y-4">
                  {pending.map((r) => <ReportCard key={r.id} report={r} />)}
                </div>
              </section>
            )}
            {resolved.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Resolvidos ({resolved.length})
                </h2>
                <div className="space-y-4">
                  {resolved.map((r) => <ReportCard key={r.id} report={r} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
