'use client'

import React from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { UserRole } from '../../config/routes.config'
import { RouteGuardLoading } from './RouteGuard'

interface WithAuthOptions {
  allowedRoles?: UserRole[]
  loginRedirect?: string
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { allowedRoles, loginRedirect = '/login' } = options

  return function AuthenticatedComponent(props: P) {
    const router = useRouter()
    const { user, isAuthenticated, isLoading, isInitialized } = useAuth()

    React.useEffect(() => {
      if (isLoading && !isInitialized) return

      if (!isAuthenticated) {
        const asPath = router.asPath || ''
        router.replace(`${loginRedirect}?redirect=${encodeURIComponent(asPath)}`)
        return
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.replace(user.role === 'ADMIN' ? '/admin' : '/seller/dashboard')
      }
    }, [isAuthenticated, isLoading, isInitialized, user, router])

    if ((isLoading && !isInitialized) || !isAuthenticated) {
      return <RouteGuardLoading />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <RouteGuardLoading />
    }

    return <Component {...props} />
  }
}

export default withAuth
