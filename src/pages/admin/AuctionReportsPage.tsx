import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/adminApi'
import type { AuctionReportResponse } from '@/types/report'

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

function AuctionReportCard({ report }: { report: AuctionReportResponse }) {
  const queryClient = useQueryClient()

  const resolveMutation = useMutation({
    mutationFn: () => adminApi.resolveAuctionReport(report.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-auction-reports'] }),
  })

  const isPending = report.status === 'PENDING'

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
      <div className="px-6 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'
            }`}>
              {isPending ? 'Pendente' : 'Resolvido'}
            </span>
          </div>
          <p className="font-bold text-gray-900 text-base">
            Leilão:{' '}
            <Link to={`/auctions/${report.auctionId}`} className="text-primary-600 hover:underline">
              {report.auctionTitle}
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Reportado por <span className="font-semibold text-gray-600">{report.reporterName}</span>
            {' · '}{new Date(report.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="px-6 pb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Motivo</p>
        <p className="text-sm text-gray-800 whitespace-pre-line">{report.reason}</p>
      </div>

      <div className="px-6 pb-4 flex gap-3 flex-wrap">
        <Link
          to={`/auctions/${report.auctionId}`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Ver leilão
        </Link>
        {isPending && (
          <button
            onClick={() => resolveMutation.mutate()}
            disabled={resolveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {resolveMutation.isPending ? 'Aguarde...' : 'Marcar como resolvido'}
          </button>
        )}
      </div>
    </div>
  )
}

export function AuctionReportsPage() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-auction-reports'],
    queryFn: () => adminApi.listAuctionReports(),
  })

  const pending = reports.filter((r) => r.status === 'PENDING')
  const resolved = reports.filter((r) => r.status !== 'PENDING')

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 p-4 bg-white/60 backdrop-blur-sm border-r border-outline-variant/20">
        <div className="px-4 mb-8 mt-4">
          <h2 className="text-lg font-black text-primary">Admin Central</h2>
          <p className="text-xs text-on-surface-variant font-medium">Painel de Controle</p>
        </div>
        <nav className="flex-1 space-y-1">
          <SidebarLink to="/admin" icon="dashboard" label="Visão Geral" />
          <SidebarLink to="/admin/auctions" icon="pending_actions" label="Fila de Aprovação" />
          <SidebarLink to="/auctions" icon="gavel" label="Todos os Leilões" />
          <SidebarLink to="/admin/buyer-reports" icon="flag" label="Report. Compradores" />
          <SidebarLink to="/admin/auction-reports" icon="report" label="Report. Leilões" active />
        </nav>
      </aside>

      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Reportes de Leilões</h1>
          <p className="text-sm text-gray-500">Disputas de pagamento reportadas pelos participantes do leilão.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-gray-300 block mb-3">report</span>
            <p className="text-gray-500 font-medium">Nenhum reporte de leilão enviado ainda.</p>
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
                  {pending.map((r) => <AuctionReportCard key={r.id} report={r} />)}
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
                  {resolved.map((r) => <AuctionReportCard key={r.id} report={r} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
