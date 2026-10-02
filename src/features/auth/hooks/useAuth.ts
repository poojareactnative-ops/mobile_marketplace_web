import { useEffect } from 'react'
import { useAuthStore } from '../../../store/auth.store'
import { SuperSellerRegistrationPayload } from '../../../lib/api/auth.service'
import { getAccessToken } from '../../../lib/api/client'

export function useAuth() {
  const {
    user,
    shop,
    accessToken,
    refreshToken,
    isLoading,
    isInitialized,
    setAuth,
    logout,
    fetchMe,
    login,
    registerSuperSeller,
    registerSeller,
    forgotPassword,
    resetPassword,
  } = useAuthStore()

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      if (!user) {
        fetchMe()
      }
    } else {
      // If no token exists, immediately ensure state is not loading
      if (!isInitialized || isLoading) {
        useAuthStore.setState({ isLoading: false, isInitialized: true })
      }
    }
  }, [user, isInitialized, isLoading, fetchMe])

  return {
    user,
    shop,
    accessToken,
    refreshToken,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login: (email: string, password: string) => login({ email, password }),
    registerSuperSeller: (data: SuperSellerRegistrationPayload) => registerSuperSeller(data),
    registerSeller: (data: SuperSellerRegistrationPayload) => registerSeller(data),
    register: (data: SuperSellerRegistrationPayload) => registerSuperSeller(data),
    logout,
    refreshUser: fetchMe,
    forgotPassword,
    resetPassword,
  }
}

export default useAuth
