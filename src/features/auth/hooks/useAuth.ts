import { useEffect } from 'react'
import apiClient from '../../../lib/api/client'
import { useAuthStore } from '../../../store/auth.store'

export function useAuth() {
  const { user, shop, accessToken, isLoading, setAuth, logout, fetchMe } = useAuthStore()

  useEffect(() => {
    if (accessToken && !user) {
      fetchMe()
    }
  }, [accessToken, user, fetchMe])

  async function login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password })
    const { user: u, shop: s, tokens } = res.data.data
    setAuth(u, s, tokens.accessToken)
    return { user: u, shop: s }
  }

  async function register(data: {
    name: string
    email: string
    password: string
    phone?: string
    role?: string
    shopName?: string
  }) {
    const res = await apiClient.post('/auth/register', data)
    const { user: u, shop: s, tokens } = res.data.data
    setAuth(u, s, tokens.accessToken)
    return { user: u, shop: s }
  }

  return {
    user,
    shop,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser: fetchMe,
  }
}

export default useAuth
