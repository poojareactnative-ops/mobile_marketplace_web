import { create } from 'zustand'
import {
  authService,
  UserProfile,
  ShopProfile,
  SuperSellerRegistrationPayload,
  LoginPayload,
} from '../lib/api/auth.service'
import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} from '../lib/api/client'

export type { UserProfile, ShopProfile }

interface AuthState {
  user: UserProfile | null
  shop: ShopProfile | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  setAuth: (
    user: UserProfile,
    shop: ShopProfile | null,
    accessToken: string,
    refreshToken?: string | null
  ) => void
  logout: () => Promise<void>
  fetchMe: () => Promise<UserProfile | null>
  login: (credentials: LoginPayload) => Promise<{ user: UserProfile; shop?: ShopProfile | null }>
  registerSuperSeller: (payload: SuperSellerRegistrationPayload) => Promise<any>
  registerSeller: (payload: SuperSellerRegistrationPayload) => Promise<any>
  forgotPassword: (email: string) => Promise<any>
  resetPassword: (token: string, newPassword: string) => Promise<any>
}

const getInitialToken = () => {
  if (typeof window === 'undefined') return null
  return getAccessToken()
}

const initialToken = getInitialToken()

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  shop: null,
  accessToken: initialToken,
  refreshToken: typeof window !== 'undefined' ? getRefreshToken() : null,
  // If there is NO stored token, we are already initialized and not loading!
  isLoading: !!initialToken,
  isInitialized: !initialToken,

  setAuth: (user, shop, accessToken, refreshToken) => {
    setAuthTokens(accessToken, refreshToken)
    set({
      user,
      shop: shop || null,
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isLoading: false,
      isInitialized: true,
    })
  },

  logout: async () => {
    try {
      await authService.logout()
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuthTokens()
      set({
        user: null,
        shop: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isInitialized: true,
      })
    }
  },

  fetchMe: async () => {
    const token = getAccessToken()
    if (!token) {
      set({
        user: null,
        shop: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isInitialized: true,
      })
      return null
    }

    try {
      set({ isLoading: true })
      const { user, shop } = await authService.getMe()
      set({
        user,
        shop: shop || null,
        accessToken: token,
        isLoading: false,
        isInitialized: true,
      })
      return user
    } catch {
      // If fetching me fails, token is invalid or expired
      clearAuthTokens()
      set({
        user: null,
        shop: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isInitialized: true,
      })
      return null
    }
  },

  login: async (credentials: LoginPayload) => {
    set({ isLoading: true })
    try {
      const res = await authService.login(credentials)
      const user =
        res.data?.user || (res.user as UserProfile) || (res.data as unknown as UserProfile)
      const shop = res.data?.shop || res.shop || null

      const accessToken =
        res.data?.tokens?.accessToken ||
        res.data?.accessToken ||
        res.tokens?.accessToken ||
        ''
      const refreshToken =
        res.data?.tokens?.refreshToken ||
        res.data?.refreshToken ||
        res.tokens?.refreshToken ||
        ''

      if (user && accessToken) {
        get().setAuth(user, shop, accessToken, refreshToken)
      } else if (user) {
        set({ user, shop, isLoading: false, isInitialized: true })
      }

      return { user, shop }
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  registerSuperSeller: async (payload: SuperSellerRegistrationPayload) => {
    set({ isLoading: true })
    try {
      const res = await authService.registerSuperSeller(payload)
      const user = res.data?.user || res.user
      const shop = res.data?.shop || res.shop
      const tokens = res.data?.tokens || res.tokens

      if (user && tokens?.accessToken) {
        get().setAuth(user, shop, tokens.accessToken, tokens.refreshToken)
      }
      return res
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  registerSeller: async (payload: SuperSellerRegistrationPayload) => {
    set({ isLoading: true })
    try {
      const res = await authService.registerSeller(payload)
      const user = res.data?.user || res.user
      const shop = res.data?.shop || res.shop
      const tokens = res.data?.tokens || res.tokens

      if (user && tokens?.accessToken) {
        get().setAuth(user, shop, tokens.accessToken, tokens.refreshToken)
      }
      return res
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  forgotPassword: async (email: string) => {
    return await authService.forgotPassword(email)
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await authService.resetPassword({ token, newPassword })
  },
}))

export default useAuthStore
