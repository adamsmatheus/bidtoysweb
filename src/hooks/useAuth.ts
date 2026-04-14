import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/authApi'
import { userApi } from '@/api/userApi'
import { useNotificationStore } from '@/store/notificationStore'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { LoginRequest, RegisterRequest } from '@/types/auth'

export function useLogin() {
  const { setToken, setName } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (res) => {
      setToken(res.token)
      // Fetch user name after login
      try {
        const user = await userApi.me()
        setName(user.name)
      } catch {
        // name stays null, not critical
      }
      navigate('/')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => navigate('/login'),
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const { clearAll } = useNotificationStore()
  const navigate = useNavigate()

  return () => {
    logout()
    clearAll()
    navigate('/login')
  }
}
