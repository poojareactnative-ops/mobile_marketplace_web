import apiClient, { clearAuthTokens, setAuthTokens } from './client'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  role: 'SUPER_ADMIN' | 'SUPER_SELLER' | 'SELLER_ADMIN' | 'CUSTOMER' | string
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'REJECTED' | string
  shopId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ShopProfile {
  id: string
  name: string
  type?: string
  address?: string
  latitude?: number
  longitude?: number
  whatsappNumber?: string | null
  businessDocUrl?: string | null
  openingHours?: string | null
  planType?: string | null
  isActive?: boolean
  isVerified?: boolean
  status?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface SuperSellerRegistrationPayload {
  name: string
  email: string
  password: string
  phone: string
  shopName: string
  shopType?: string
  address: string
  latitude?: number
  longitude?: number
  whatsappNumber?: string
  businessDocUrl?: string
  openingHours?: string
  planType?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponseData {
  user: UserProfile
  shop?: ShopProfile | null
  tokens?: AuthTokens
  accessToken?: string
  refreshToken?: string
}

export interface ForgotPasswordResponse {
  success: boolean
  data?: {
    message: string
    resetToken?: string
  }
  message?: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  data?: {
    message: string
  }
  message?: string
}

export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  data?: T
  tokens?: AuthTokens
  user?: UserProfile
  shop?: ShopProfile
}

export const authService = {
  /**
   * Super Seller Registration & Onboarding Request
   * POST /auth/register-super-seller
   * Falls back to /auth/register-seller if endpoint differs
   */
  async registerSuperSeller(payload: SuperSellerRegistrationPayload): Promise<ApiResponse> {
    try {
      const res = await apiClient.post<ApiResponse>('/auth/register-super-seller', {
        ...payload,
        shopType: payload.shopType || 'SUPER_SELLER',
      })
      return res.data
    } catch (err: any) {
      // If 404 on /register-super-seller, attempt fallback to /register-seller
      if (err.response?.status === 404) {
        const res = await apiClient.post<ApiResponse>('/auth/register-seller', {
          ...payload,
          shopType: payload.shopType || 'SUPER_SELLER',
        })
        return res.data
      }
      throw err
    }
  },

  /**
   * Register Seller / Store Owner Onboarding Request
   * POST /auth/register-seller
   */
  async registerSeller(payload: SuperSellerRegistrationPayload): Promise<ApiResponse> {
    const res = await apiClient.post<ApiResponse>('/auth/register-seller', {
      ...payload,
      shopType: payload.shopType || 'SUPER_SELLER',
    })
    return res.data
  },

  /**
   * Log in with Email and Password
   * POST /auth/login
   */
  async login(credentials: LoginPayload): Promise<ApiResponse<LoginResponseData>> {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', credentials)
    const data = res.data

    // Extract tokens from multiple common shapes
    const accessToken =
      data.data?.tokens?.accessToken ||
      data.data?.accessToken ||
      data.tokens?.accessToken

    const refreshToken =
      data.data?.tokens?.refreshToken ||
      data.data?.refreshToken ||
      data.tokens?.refreshToken

    if (accessToken) {
      setAuthTokens(accessToken, refreshToken)
    }

    return data
  },

  /**
   * Refresh Access Token
   * POST /auth/refresh
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    const res = await apiClient.post('/auth/refresh', { refreshToken })
    const data = res.data

    const accessToken =
      data?.data?.accessToken ||
      data?.accessToken ||
      data?.data?.tokens?.accessToken ||
      data?.tokens?.accessToken

    const newRefreshToken =
      data?.data?.refreshToken ||
      data?.refreshToken ||
      data?.data?.tokens?.refreshToken ||
      data?.tokens?.refreshToken ||
      refreshToken

    if (accessToken) {
      setAuthTokens(accessToken, newRefreshToken)
    }

    return { accessToken, refreshToken: newRefreshToken }
  },

  /**
   * Get Current Authenticated User Profile & Shop
   * GET /auth/me
   */
  async getMe(): Promise<{ user: UserProfile; shop?: ShopProfile | null }> {
    const res = await apiClient.get<ApiResponse<{ user: UserProfile; shop?: ShopProfile | null }>>(
      '/auth/me'
    )
    const data = res.data

    const user = data.data?.user || (data.user as UserProfile) || (data.data as unknown as UserProfile)
    const shop = data.data?.shop || data.shop || null

    return { user, shop }
  },

  /**
   * User Logout
   * POST /auth/logout
   */
  async logout(): Promise<ApiResponse> {
    try {
      const res = await apiClient.post<ApiResponse>('/auth/logout')
      return res.data
    } finally {
      clearAuthTokens()
    }
  },

  /**
   * Forgot Password Request
   * POST /auth/forgot-password
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email: email.trim(),
    })
    return res.data
  },

  /**
   * Reset Password with Token
   * POST /auth/reset-password
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const res = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', {
      token: payload.token.trim(),
      newPassword: payload.newPassword,
    })
    return res.data
  },
}

export default authService
