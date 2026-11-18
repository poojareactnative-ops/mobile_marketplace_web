'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, ArrowRight, Lock, Clock } from 'lucide-react';

export default function RoleGuard({ allowedRoles = [], children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, loading, refreshSession } = useAuth();

  const isSuperAdminOnly = allowedRoles.length === 1 && allowedRoles.includes('SUPER_ADMIN');
  
  // Public auth pages must never be guarded by RoleGuard
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/super-admin/login' ||
    Boolean(pathname && (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/super-admin/login')));

  // Clean redirect target: never redirect back to a login page
  const cleanRedirectPath = pathname && !pathname.includes('/login') && !pathname.includes('/register') 
    ? encodeURIComponent(pathname) 
    : '';

  const targetLoginUrl = isSuperAdminOnly
    ? (cleanRedirectPath ? `/super-admin/login?redirect=${cleanRedirectPath}` : '/super-admin/login')
    : (cleanRedirectPath ? `/login?redirect=${cleanRedirectPath}` : '/login');

  useEffect(() => {
    if (!loading && !isAuthPage && (!isAuthenticated || !user)) {
      // Auto-redirect to appropriate login with target path
      router.push(targetLoginUrl);
    }
  }, [loading, isAuthPage, isAuthenticated, user, pathname, router, targetLoginUrl]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-9 h-9 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-500">Verifying security credentials...</span>
      </div>
    );
  }

  // 1. Check Authentication (Who you are)
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-lg w-full mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className={`w-12 h-12 rounded-2xl ${isSuperAdminOnly ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'} flex items-center justify-center mx-auto`}>
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isSuperAdminOnly 
            ? 'Super Admin authorization required. Please authenticate via the restricted governance vault.'
            : 'You must be signed in to access this workbench. Please sign in with your account to proceed.'}
        </p>
        <Link
          href={targetLoginUrl}
          className={`inline-flex items-center space-x-2 px-5 py-2.5 ${isSuperAdminOnly ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'} font-black rounded-xl text-xs shadow-lg transition`}
        >
          <LogIn className="w-4 h-4" />
          <span>{isSuperAdminOnly ? 'Access Super Admin Vault' : 'Sign In to Continue'}</span>
        </Link>
      </div>
    );
  }

  // 1.5 Super Admin Approval Guard for Workshop Admins
  if (role === 'ADMIN' && user?.status === 'PENDING') {
    return (
      <div className="max-w-lg w-full mx-auto my-12 p-8 bg-slate-900 border border-amber-500/40 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-white">Application Pending Super Admin Approval</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your Repair Shop Admin account (<strong className="text-white">{user?.shopName || user?.name}</strong>) has been registered and is currently under review by the platform Super Admin. You will gain full workbench access once accepted.
        </p>
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-400 text-left">
          <strong className="text-white">Governance Status:</strong> Awaiting platform root acceptance. Super Admin will verify your repair center details.
        </div>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={async () => {
              if (refreshSession) await refreshSession();
              window.location.reload();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Refresh Status
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (role === 'ADMIN' && (user?.status === 'REJECTED' || user?.status === 'SUSPENDED')) {
    return (
      <div className="max-w-lg w-full mx-auto my-12 p-8 bg-slate-900 border border-rose-900/60 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white">Application Rejected by Super Admin</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your Repair Shop Admin registration was rejected by the platform Super Admin. If you have questions or require re-consideration, please contact governance support at <span className="text-purple-400 font-mono">superadmin@smartfix.com</span>.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // 2. Check Authorization (What you are permitted to do)
  const isAuthorized = allowedRoles.length === 0 || allowedRoles.includes(role);

  if (!isAuthorized) {
    return (
      <div className="max-w-lg w-full mx-auto my-12 p-8 bg-slate-900 border border-rose-900/60 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white">Access Denied &bull; Unauthorized</h2>
        <div className="text-xs text-slate-400 leading-relaxed space-y-1">
          <p>
            Your current account role is <strong className="text-rose-400 font-bold">{role}</strong>.
          </p>
          <p>
            This section requires one of the following roles: <strong className="text-white font-bold">{allowedRoles.join(', ')}</strong>.
          </p>
        </div>

        {/* Business Rule Reminder */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400 text-left">
          <strong className="text-white">Business Rule Enforced:</strong>
          {role === 'SELLER' && ' Sellers earn 2% referral commissions on completed jobs but cannot conduct repairs or alter final repair bills.'}
          {role === 'ADMIN' && ' Repair Shop Owners manage their workshop but do not access platform Super Admin controls.'}
          {role === 'CUSTOMER' && ' Customers can only track their assigned repair tickets and browse public accessories.'}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
          >
            Go to Your Dashboard
          </Link>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow transition flex items-center space-x-1"
          >
            <span>Switch Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
