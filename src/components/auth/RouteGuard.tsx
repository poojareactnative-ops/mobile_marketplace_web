'use client'

import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ShieldAlert,
  Store,
  Clock,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { getAccessToken } from '../../lib/api/client'
import {
  getRouteProtectionRule,
  isAuthOnlyPath,
  isPublicPath,
  ADMIN_ROLES,
  getDashboardRedirect,
} from '../../config/routes.config'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-xl animate-pulse" />
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
      <p className="mt-4 text-sm font-semibold tracking-wide text-slate-300">
        Verifying secure credentials...
      </p>
      <p className="mt-1 text-xs text-slate-500">Hyperlocal Mobile Platform</p>
    </div>
  )
}

export function PendingApprovalBanner({ user, shop }: { user: any; shop: any }) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-300/60 bg-amber-50/90 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-amber-900">
              Registration Status: Pending Super Admin Approval
            </h4>
            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              Under Review
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Welcome, <strong>{user?.name}</strong>! Your Super Seller shop request for{' '}
            <strong>{shop?.name || 'your store'}</strong> has been submitted. Platform
            Super Admins are currently reviewing your location and business details. You can view
            your profile while approval is being processed.
          </p>
        </div>
      </div>
    </div>
  )
}

function AccessDeniedView({
  title,
  message,
  primaryAction,
  secondaryAction,
  icon: Icon = ShieldAlert,
  badgeText = 'Restricted Route',
}: {
  title: string
  message: string
  primaryAction: { label: string; href: string }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  icon?: any
  badgeText?: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <Icon className="h-8 w-8" />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
          <Lock className="h-3 w-3" />
          <span>{badgeText}</span>
        </div>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-xs leading-5 text-slate-400">{message}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href={primaryAction.href}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <span>{primaryAction.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const { user, shop, isAuthenticated, isLoading, logout } = useAuth()

  const pathname = router.pathname || ''
  const asPath = router.asPath || ''

  // Evaluate route classifications
  const isPublic = useMemo(() => isPublicPath(pathname), [pathname])
  const isAuthOnly = useMemo(() => isAuthOnlyPath(pathname), [pathname])
  const protectionRule = useMemo(() => getRouteProtectionRule(pathname), [pathname])

  // Has a token currently stored in browser
  const hasToken = typeof window !== 'undefined' ? !!getAccessToken() : false

  useEffect(() => {
    // 0. Restrict authenticated users from landing page (/)
    if (pathname === '/' && isAuthenticated && user) {
      router.replace(getDashboardRedirect(user.role))
      return
    }

    // 1. If public route (except / for authenticated user), do nothing
    if (isPublic) return

    // 2. Auth-only route (/login, /admin/login, /register/super-seller):
    if (isAuthOnly) {
      if (isAuthenticated && user) {
        // Logged-in user should not see login page; send to their dashboard
        const redirect = router.query.redirect as string
        if (redirect && typeof redirect === 'string' && redirect.startsWith('/')) {
          router.replace(redirect)
          return
        }

        router.replace(getDashboardRedirect(user.role))
      }
      return
    }

    // 3. Protected route:
    if (protectionRule) {
      // If definitely not authenticated and not loading, redirect to login
      if (!hasToken && !isAuthenticated && !isLoading) {
        const loginUrl = `${protectionRule.loginRedirect}?redirect=${encodeURIComponent(asPath)}`
        router.replace(loginUrl)
      }
    }
  }, [
    pathname,
    asPath,
    isPublic,
    isAuthOnly,
    protectionRule,
    isAuthenticated,
    user,
    isLoading,
    hasToken,
    router,
  ])

  // Restrict authenticated users from landing page
  if (pathname === '/' && (isAuthenticated && user)) {
    return <RouteGuardLoading />
  }

  // FAST PATH 1: Public routes always render immediately (except / when logged in)
  if (isPublic && !(pathname === '/' && (hasToken || isAuthenticated))) {
    return <>{children}</>
  }

  // FAST PATH 2: Auth-only route (like /login) when no token exists -> render immediately!
  if (isAuthOnly && !hasToken) {
    return <>{children}</>
  }

  // If user has a token on an auth-only route and is currently verifying it -> show brief loading
  if (isAuthOnly && hasToken && isLoading) {
    return <RouteGuardLoading />
  }

  // If user has a token on an auth-only route and is already authenticated -> show brief loading while redirecting
  if (isAuthOnly && isAuthenticated) {
    return <RouteGuardLoading />
  }

  // If visiting a protected route without any token -> show brief loading while redirecting to login
  if (protectionRule && !hasToken && !isAuthenticated) {
    return <RouteGuardLoading />
  }

  // If visiting a protected route with a token still verifying -> show loading
  if (protectionRule && hasToken && isLoading) {
    return <RouteGuardLoading />
  }

  // If on a protected route and verification failed / not authenticated
  if (protectionRule && !isAuthenticated) {
    return <RouteGuardLoading />
  }

  // If on a protected route and role authorization fails
  if (protectionRule && isAuthenticated && user) {
    const hasRole = protectionRule.allowedRoles?.includes(user.role)

    if (!hasRole) {
      if (protectionRule.pathPrefix === '/admin') {
        return (
          <AccessDeniedView
            title="Platform Admin Console"
            message={`Your account (${user.email}) has the role "${user.role}". Platform governance is restricted to Super Admins.`}
            primaryAction={{
              label: 'Go to Seller Dashboard',
              href: '/seller/dashboard',
            }}
            secondaryAction={{
              label: 'Sign in with an Admin Account',
              href: `/admin/login?redirect=${encodeURIComponent(asPath)}`,
            }}
            badgeText="Admin Privileges Required"
          />
        )
      }

      if (
        protectionRule.pathPrefix === '/seller/team' ||
        protectionRule.pathPrefix === '/seller/admins'
      ) {
        return (
          <AccessDeniedView
            title="Super Seller Exclusive"
            message="Only the primary shop owner (Super Seller) can create and manage Admins."
            primaryAction={{
              label: 'Return to Dashboard',
              href: '/seller/dashboard',
            }}
            badgeText="Shop Owner Tier Required"
          />
        )
      }

      if (protectionRule.pathPrefix === '/seller' && user.role === 'CUSTOMER') {
        return (
          <AccessDeniedView
            title="Seller Store Portal"
            message="You are signed in with a Customer profile. To list inventory, accept repair jobs, and manage a store, register as a Super Seller."
            primaryAction={{
              label: 'Browse Public Catalog',
              href: '/products',
            }}
            secondaryAction={{
              label: 'Register as Super Seller',
              href: '/register/super-seller',
            }}
            icon={Store}
            badgeText="Seller Account Required"
          />
        )
      }

      return (
        <AccessDeniedView
          title="Access Denied"
          message={`You do not have the required permissions to view this page (${pathname}).`}
          primaryAction={{
            label: 'Go to Home',
            href: '/',
          }}
          secondaryAction={{
            label: 'Log out',
            onClick: () => logout(),
          }}
        />
      )
    }
  }

  return (
    <>
      {/* Show Pending Approval Banner on seller pages if status is PENDING_APPROVAL */}
      {protectionRule &&
        protectionRule.pathPrefix.startsWith('/seller') &&
        user?.status === 'PENDING_APPROVAL' && (
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <PendingApprovalBanner user={user} shop={shop} />
          </div>
        )}
      {children}
    </>
  )
}
