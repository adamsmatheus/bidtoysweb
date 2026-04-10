import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'

export function Navbar() {
  const { name, isAdmin, isAuthenticated } = useAuthStore()
  const logout = useLogout()
  const auth = isAuthenticated()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/">
          <img
            src="/palavra.png"
            alt="BidToys"
            className="h-20 w-auto object-contain -my-2"
          />
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <NavLink
            to="/auctions"
            className={({ isActive }) =>
              isActive ? 'text-primary-700 font-medium' : 'text-gray-600 hover:text-gray-900'
            }
          >
            Leilões
          </NavLink>

          {auth && (
            <NavLink
              to="/my-auctions"
              className={({ isActive }) =>
                isActive ? 'text-primary-700 font-medium' : 'text-gray-600 hover:text-gray-900'
              }
            >
              Meus leilões
            </NavLink>
          )}

          {auth && (
            <NavLink
              to="/my-wins"
              className={({ isActive }) =>
                isActive ? 'text-primary-700 font-medium' : 'text-gray-600 hover:text-gray-900'
              }
            >
              Meus arremates
            </NavLink>
          )}

          {auth && isAdmin() && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? 'text-primary-700 font-medium' : 'text-gray-600 hover:text-gray-900'
              }
            >
              Admin
            </NavLink>
          )}

          {auth ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? 'text-primary-700 font-medium' : 'text-gray-600 hover:text-gray-900'
                }
              >
                {name ?? 'Perfil'}
              </NavLink>
              <button onClick={logout} className="btn-secondary btn-sm">
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary btn-sm">
                Entrar
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
