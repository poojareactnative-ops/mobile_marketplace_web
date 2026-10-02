export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PLATFORM_ADMIN'
  | 'SUPER_SELLER'
  | 'SELLER_ADMIN'
  | 'CUSTOMER'
  | string

export interface RouteRule {
  pathPrefix: string
  exact?: boolean
  allowedRoles?: UserRole[]
  unauthorizedRedirect?: string
  loginRedirect: string
  allowPendingApproval?: boolean
  description?: string
}

export const ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN']
export const SELLER_ROLES: UserRole[] = ['SUPER_SELLER', 'SELLER_ADMIN', 'SUPER_ADMIN']
export const SUPER_SELLER_ONLY_ROLES: UserRole[] = ['SUPER_SELLER', 'SUPER_ADMIN']

/**
 * Returns the destination dashboard path for a given role
 */
export function getDashboardRedirect(role?: string): string {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'PLATFORM_ADMIN') {
    return '/admin'
  }
  if (role === 'CUSTOMER') {
    return '/products'
  }
  return '/seller/dashboard'
}

/**
 * Public routes that can be viewed by anyone (guests, customers, sellers, admins)
 */
export const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/shops',
  '/categories',
  '/offers',
  '/repairs',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/seller/forgot-password',
  '/seller/reset-password',
  '/reset-password',
  '/404',
  '/_error',
]

/**
 * Authentication routes intended for unauthenticated visitors.
 * Authenticated users visiting these will be redirected to their role's dashboard.
 */
export const AUTH_ONLY_ROUTES = [
  '/login',
  '/register',
  '/register/super-seller',
  '/admin/login',
  '/seller/login',
  '/seller/register',
]

/**
 * Protected Route Rules evaluated in priority order.
 */
export const PROTECTED_ROUTE_RULES: RouteRule[] = [
  // 1. Super Seller Exclusive (Team / Store Admin Management)
  {
    pathPrefix: '/seller/team',
    allowedRoles: SUPER_SELLER_ONLY_ROLES,
    loginRedirect: '/login',
    unauthorizedRedirect: '/seller/dashboard',
    allowPendingApproval: false,
    description: 'Shop Owner / Super Seller only: create and govern shop admins',
  },
  {
    pathPrefix: '/seller/admins',
    allowedRoles: SUPER_SELLER_ONLY_ROLES,
    loginRedirect: '/login',
    unauthorizedRedirect: '/seller/dashboard',
    allowPendingApproval: false,
    description: 'Shop Owner / Super Seller only: manage shop admins',
  },
  {
    pathPrefix: '/seller/super-seller',
    allowedRoles: SUPER_SELLER_ONLY_ROLES,
    loginRedirect: '/login',
    unauthorizedRedirect: '/seller/dashboard',
    allowPendingApproval: false,
    description: 'Super Seller tier diagnostics & solutions',
  },

  // 2. Platform Admin Console (/admin/*)
  {
    pathPrefix: '/admin',
    allowedRoles: ADMIN_ROLES,
    loginRedirect: '/admin/login',
    unauthorizedRedirect: '/seller/dashboard',
    allowPendingApproval: false,
    description: 'Platform Owner / Super Admin governance console',
  },

  // 3. General Seller Portal (/seller/*)
  {
    pathPrefix: '/seller',
    allowedRoles: SELLER_ROLES,
    loginRedirect: '/login',
    unauthorizedRedirect: '/products',
    allowPendingApproval: true, // Pending sellers can view their dashboard & profile with pending banner
    description: 'Seller store operations and management',
  },
]

/**
 * Helper to test if a given pathname matches any public route
 */
export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (
    pathname.startsWith('/products/') ||
    pathname.startsWith('/shops/') ||
    pathname.startsWith('/offers/')
  ) {
    return true
  }
  return false
}

/**
 * Helper to test if a given pathname is an auth-only route (like /login or /admin/login)
 */
export function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some(
    (authPath) => pathname === authPath || pathname.startsWith(`${authPath}?`)
  )
}

/**
 * Finds the first matching protected route rule for a pathname, if any.
 */
export function getRouteProtectionRule(pathname: string): RouteRule | null {
  // Check if path is public or auth-only exception first
  if (isAuthOnlyPath(pathname) || isPublicPath(pathname)) {
    return null
  }

  for (const rule of PROTECTED_ROUTE_RULES) {
    if (rule.exact ? pathname === rule.pathPrefix : pathname.startsWith(rule.pathPrefix)) {
      return rule
    }
  }

  return null
}
