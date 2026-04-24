import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { auctionApi } from '@/api/auctionApi'
import { adminApi } from '@/api/adminApi'

function SidebarLink({
  to,
  icon,
  label,
  active = false,
}: {
  to: string
  icon: string
  label: string
  active?: boolean
}) {
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

export function AdminDashboardPage() {
  const { data: pending } = useQuery({
    queryKey: ['admin-auctions-pending', 0, 1],
    queryFn: () => adminApi.listPending(0, 1),
  })

  const { data: active } = useQuery({
    queryKey: ['auctions', 'ACTIVE', 0],
    queryFn: () => auctionApi.list({ status: 'ACTIVE', size: 1 }),
  })

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 p-4 bg-white/60 backdrop-blur-sm border-r border-outline-variant/20">
        <div className="px-4 mb-8 mt-4">
          <h2 className="text-lg font-black text-primary">Admin Central</h2>
          <p className="text-xs text-on-surface-variant font-medium">Painel de Controle</p>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink to="/admin" icon="dashboard" label="Visão Geral" active />
          <SidebarLink to="/admin/auctions" icon="pending_actions" label="Fila de Aprovação" />
          <SidebarLink to="/auctions" icon="gavel" label="Todos os Leilões" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Painel Admin
          </h1>
          <p className="text-on-surface-variant font-medium">
            Gerencie o ecossistema de leilões BidToys com precisão.
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Pending */}
          <Link
            to="/admin/auctions"
            className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm ring-1 ring-outline-variant/10 relative overflow-hidden group hover:-translate-y-1 transition-all"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span
                className="material-symbols-outlined text-8xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                pending_actions
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-secondary tracking-wider uppercase mb-2">Pendente</p>
              <h3 className="text-base font-medium text-on-surface-variant mb-1">
                Leilões aguardando aprovação
              </h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-6xl font-black text-on-surface">
                  {pending?.totalElements ?? '—'}
                </span>
                <span className="text-on-surface-variant font-medium">solicitações</span>
              </div>
              <span className="inline-flex items-center text-primary font-bold">
                Revisar fila agora
                <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform text-base">
                  arrow_forward
                </span>
              </span>
            </div>
          </Link>

          {/* Active */}
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm ring-1 ring-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span
                className="material-symbols-outlined text-8xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold mb-4">
                <span className="w-2 h-2 bg-on-tertiary-container rounded-full animate-pulse mr-2" />
                AO VIVO
              </div>
              <h3 className="text-base font-medium text-on-surface-variant mb-1">
                Leilões ativos agora
              </h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-6xl font-black text-on-surface">
                  {active?.totalElements ?? '—'}
                </span>
                <span className="text-on-surface-variant font-medium">em andamento</span>
              </div>
              <Link to="/auctions" className="inline-flex items-center text-primary font-bold">
                Ver todos os leilões
                <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform text-base">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="bg-surface-container-low p-8 rounded-2xl mb-10">
          <h2 className="text-xl font-bold mb-6 text-on-surface">Ações rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/admin/auctions"
              className="bg-surface-container-lowest hover:bg-surface-container-high px-6 py-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 text-on-surface font-semibold group"
            >
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                inventory_2
              </span>
              Fila de aprovação
            </Link>
            <Link
              to="/auctions"
              className="bg-surface-container-lowest hover:bg-surface-container-high px-6 py-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 text-on-surface font-semibold group"
            >
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                visibility
              </span>
              Ver todos os leilões
            </Link>
            <Link
              to="/auctions/new"
              className="bg-surface-container-lowest hover:bg-surface-container-high px-6 py-4 rounded-2xl shadow-sm transition-all flex items-center gap-3 text-on-surface font-semibold group"
            >
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                add_circle
              </span>
              Novo leilão
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
