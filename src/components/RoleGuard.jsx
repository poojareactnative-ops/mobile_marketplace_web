'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, ArrowRight, Lock } from 'lucide-react';

export default function RoleGuard({ allowedRoles = [], children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      // Auto-redirect to login with target path
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, user, pathname, router]);

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
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You must be signed in to access this workbench. Please sign in with your account to proceed.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(pathname)}`}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Continue</span>
        </Link>
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
