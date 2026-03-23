import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import type { JwtPayload } from '@/types/auth'
import type { UserRole } from '@/types/user'

interface AuthState {
  token: string | null
  userId: string | null
  email: string | null
  role: UserRole | null
  name: string | null
  setToken: (token: string) => void
  setName: (name: string) => void
  logout: () => void
  isAdmin: () => boolean
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      email: null,
      role: null,
      name: null,

      setToken: (token: string) => {
        try {
          const payload = jwtDecode<JwtPayload>(token)
          set({
            token,
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
          })
        } catch {
          console.error('Invalid JWT token')
        }
      },

      setName: (name: string) => set({ name }),

      logout: () =>
        set({ token: null, userId: null, email: null, role: null, name: null }),

      isAdmin: () => get().role === 'ADMIN',

      isAuthenticated: () => {
        const token = get().token
        if (!token) return false
        try {
          const payload = jwtDecode<JwtPayload>(token)
          return payload.exp * 1000 > Date.now()
        } catch {
          return false
        }
      },
    }),
    { name: 'auth' }
  )
)
