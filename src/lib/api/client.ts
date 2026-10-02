import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Helper functions for token management
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_access_token')
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_refresh_token')
}

export const setAuthTokens = (accessToken: string, refreshToken?: string | null) => {
  if (typeof window === 'undefined') return
  if (accessToken) {
    localStorage.setItem('auth_access_token', accessToken)
  }
  if (refreshToken) {
    localStorage.setItem('auth_refresh_token', refreshToken)
  }
}

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_access_token')
  localStorage.removeItem('auth_refresh_token')
}

// Request interceptor to attach bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor with automatic token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Avoid refresh loops for auth routes
    const requestUrl = originalRequest?.url || ''
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password')

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearAuthTokens()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post(
          `${API_BASE}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const responseData = refreshResponse.data
        const newAccessToken =
          responseData?.data?.accessToken ||
          responseData?.accessToken ||
          responseData?.data?.tokens?.accessToken ||
          responseData?.tokens?.accessToken

        const newRefreshToken =
          responseData?.data?.refreshToken ||
          responseData?.refreshToken ||
          responseData?.data?.tokens?.refreshToken ||
          responseData?.tokens?.refreshToken ||
          refreshToken

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint')
        }

        setAuthTokens(newAccessToken, newRefreshToken)
        processQueue(null, newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return apiClient(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        clearAuthTokens()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
