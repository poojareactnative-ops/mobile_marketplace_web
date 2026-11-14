import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware for Platform-Wide Route Protection
 * Enforces Authentication (AuthN) and Role-Based Access Control (AuthZ)
 */
export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  
  // 1. Static assets and public health paths bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/public')
  ) {
    return NextResponse.next();
  }

  // 2. Extract and decode session cookie
  const sessionCookie = request.cookies.get('smartfix_session_user')?.value;
  let user = null;
  if (sessionCookie) {
    try {
      user = JSON.parse(decodeURIComponent(sessionCookie));
    } catch (e) {
      user = null;
    }
  }

  const isSuperAdminLogin = pathname === '/super-admin/login';
  const isAuthRoute = pathname === '/login' || pathname === '/register' || isSuperAdminLogin;
  const isSuperAdminProtected = pathname.startsWith('/super-admin') && !isSuperAdminLogin;

  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/seller') ||
    isSuperAdminProtected;

  // 3. If ALREADY authenticated and visiting auth route
  if (user && isAuthRoute) {
    if (user.role === 'SUPER_ADMIN') {
      const superAdminUrl = request.nextUrl.clone();
      superAdminUrl.pathname = '/super-admin';
      superAdminUrl.search = '';
      return NextResponse.redirect(superAdminUrl);
    }
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  // 4. If NOT authenticated and visiting Super Admin protected route -> Redirect to dedicated /super-admin/login
  if (!user && isSuperAdminProtected) {
    const superLoginUrl = request.nextUrl.clone();
    superLoginUrl.pathname = '/super-admin/login';
    superLoginUrl.searchParams.set('redirect', pathname + (search || ''));
    return NextResponse.redirect(superLoginUrl);
  }

  // 4b. If NOT authenticated and visiting general protected route -> Redirect to /login
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname + (search || ''));
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-Based Authorization Checks (AuthZ) for authenticated users
  if (user) {
    // SUPER_ADMIN workbench: only SUPER_ADMIN permitted
    if (isSuperAdminProtected && user.role !== 'SUPER_ADMIN') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }

    // ADMIN repair shop workbench: ADMIN and SUPER_ADMIN permitted
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }

    // SELLER referral workbench: SELLER and SUPER_ADMIN permitted
    if (pathname.startsWith('/seller') && user.role !== 'SELLER' && user.role !== 'SUPER_ADMIN') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*',
    '/super-admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
