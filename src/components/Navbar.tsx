import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { NotificationDropdown } from '@/components/NotificationDropdown'

export function Navbar() {
  const { name, userId, isAdmin, isAuthenticated } = useAuthStore()
  const logout = useLogout()
  const auth = isAuthenticated()

  useNotificationSocket(auth ? userId : null)

  return (
    <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex justify-between items-center h-20 px-6 max-w-screen-2xl mx-auto">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/">
            <img
              src="/palavra.png"
              alt="BidToys"
              className="h-16 w-auto object-contain"
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
              <NavLink
                to="/my-auctions"
                className={({ isActive }) =>
                  isActive
                    ? 'text-sm font-semibold text-primary border-b-2 border-primary pb-1'
                    : 'text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors'
                }
              >
                Meus Leilões
              </NavLink>
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

        {/* Trailing actions */}
        <div className="flex items-center gap-3">
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
      </div>
    </header>
  )
}
