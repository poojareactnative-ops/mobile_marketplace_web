import { create } from 'zustand'
import apiClient from '../lib/api/client'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  status: string
}

export interface ShopProfile {
  id: string
  name: string
  type: string
  isActive: boolean
  isVerified: boolean
}

interface AuthState {
  user: UserProfile | null
  shop: ShopProfile | null
  accessToken: string | null
  isLoading: boolean
  setAuth: (user: UserProfile, shop: ShopProfile | null, accessToken: string) => void
  logout: () => void
  fetchMe: () => Promise<UserProfile | null>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  shop: null,
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('auth_access_token') : null,
  isLoading: true,

  setAuth: (user, shop, accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_access_token', accessToken)
    }
    set({ user, shop, accessToken, isLoading: false })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_access_token')
    }
    set({ user: null, shop: null, accessToken: null, isLoading: false })
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true })
      const res = await apiClient.get('/auth/me')
      const { user, shop } = res.data.data
      set({ user, shop, isLoading: false })
      return user
    } catch {
      set({ user: null, shop: null, isLoading: false })
      return null
    }
  },
}))

export default useAuthStore
