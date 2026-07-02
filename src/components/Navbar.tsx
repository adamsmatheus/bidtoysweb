import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { notificationApi } from '@/api/notificationApi'
import { useNotificationStore } from '@/store/notificationStore'

export function Navbar() {
  const { name, userId, isAdmin, isAuthenticated } = useAuthStore()
  const logout = useLogout()
  const auth = isAuthenticated()
  const location = useLocation()
  const [myAuctionsOpen, setMyAuctionsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMyAuctionsOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMyAuctionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  const { setNotifications, clearAll } = useNotificationStore()

  useNotificationSocket(auth ? userId : null)

  // Carrega notificações do servidor ao autenticar
  useEffect(() => {
    if (!auth || !userId) {
      clearAll()
      return
    }
    notificationApi.list().then(setNotifications).catch(() => {})
  }, [userId, auth])

  return (
    <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex justify-between items-center h-[80px] md:h-[148px] px-4 md:px-6 max-w-screen-2xl mx-auto">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/">
            <img
              src="/logo.jpg"
              alt="BidToys"
              className="h-[60px] md:h-[140px] w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/auctions"
              className={({ isActive }) =>
                isActive
                  ? 'text-sm font-semibold text-primary border-b-2 border-primary pb-1'
                  : 'text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors'
              }
            >
              Leilões
            </NavLink>

            {auth && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMyAuctionsOpen((v) => !v)}
                  className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                    ['/my-auctions', '/my-buyers'].includes(location.pathname)
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Meus Leilões
                  <span className={`material-symbols-outlined text-base transition-transform duration-150 ${myAuctionsOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {myAuctionsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-lg ring-1 ring-gray-100 overflow-hidden z-50">
                    <Link
                      to="/my-auctions"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-gray-400">gavel</span>
                      Meus Leilões
                    </Link>
                    <div className="border-t border-gray-100" />
                    <Link
                      to="/my-buyers"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-gray-400">group</span>
                      Compradores
                    </Link>
                  </div>
                )}
              </div>
            )}

            {auth && (
              <NavLink
                to="/my-wins"
                className={({ isActive }) =>
                  isActive
                    ? 'text-sm font-semibold text-primary border-b-2 border-primary pb-1'
                    : 'text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors'
                }
              >
                Meus Arremates
              </NavLink>
            )}

            {auth && isAdmin() && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? 'text-sm font-semibold text-primary border-b-2 border-primary pb-1'
                    : 'text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors'
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        {/* Trailing actions — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {auth && <NotificationDropdown />}

          {auth ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                {name ?? 'Perfil'}
              </NavLink>
              <button
                onClick={logout}
                className="text-sm font-semibold text-on-surface-variant hover:text-error transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Entrar
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: notification + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {auth && <NotificationDropdown />}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-2xl text-on-surface">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-6 pb-4">
          <nav className="flex flex-col gap-1 py-2">
            <NavLink
              to="/auctions"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-gray-50'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">storefront</span>
              Leilões
            </NavLink>

            {auth && (
              <>
                <NavLink
                  to="/my-auctions"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-xl">gavel</span>
                  Meus Leilões
                </NavLink>

                <NavLink
                  to="/my-buyers"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-xl">group</span>
                  Compradores
                </NavLink>

                <NavLink
                  to="/my-wins"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-xl">emoji_events</span>
                  Meus Arremates
                </NavLink>
              </>
            )}

            {auth && isAdmin() && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-gray-50'
                  }`
                }
              >
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="border-t border-gray-100 pt-3 mt-1">
            {auth ? (
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? 'text-primary bg-primary/5' : 'text-on-surface-variant hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-xl">person</span>
                  {name ?? 'Perfil'}
                </NavLink>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-error hover:bg-red-50 transition-colors w-full text-left"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex gap-2 px-3">
                <Link to="/login" className="btn btn-secondary btn-sm flex-1 text-center">
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm flex-1 text-center">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
