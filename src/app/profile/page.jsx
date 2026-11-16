'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function GenericProfilePage() {
  const router = useRouter();
  const { user, role, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login?redirect=/profile');
      return;
    }

    if (role === 'SELLER') {
      router.replace('/seller/profile');
    } else if (role === 'ADMIN') {
      router.replace('/admin');
    } else if (role === 'SUPER_ADMIN') {
      router.replace('/super-admin');
    } else {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, role, user, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-semibold text-slate-500">Loading your profile...</span>
    </div>
  );
}
