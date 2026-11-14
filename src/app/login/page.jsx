'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench, ArrowRight, Lock, Mail, AlertCircle, ShieldAlert,
  Store, UserCheck, ShieldCheck, Sparkles, Eye, EyeOff, ArrowLeft,
  KeyRound, CheckCircle2
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'superadmin@smartfix.com' || cleanEmail === 'superadmin') {
      setError('Super Admin account detected: Please sign in via the Protected Super Admin Portal.');
      setTimeout(() => {
        router.push('/super-admin/login');
      }, 1200);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await login(email.trim(), password);
      router.push(redirectTarget);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {redirectTarget !== '/dashboard' && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Please sign in to access: <strong className="text-white font-mono">{redirectTarget}</strong></span>
        </div>
      )}
      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Email / Password Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. pooja.reactnative@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition shadow-inner"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-300">Password</label>
            <span className="text-[11px] text-slate-500">Secured via Supabase</span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 text-slate-500 hover:text-white transition"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-xl shadow-amber-500/20 transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
        >
          <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Helpful Hint for Sellers */}
      <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-2xl text-[11px] text-slate-400 flex items-start gap-2.5">
        <Store className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong className="text-slate-200">Affiliated Seller?</strong> Sign in with the credentials created for you by your partner Repair Shop Admin.
        </span>
      </div>

      {/* Registration link */}
      <div className="pt-3 text-center text-xs text-slate-400 border-t border-slate-800">
        Don&apos;t have an account yet?{' '}
        <Link
          href={`/register${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
          className="font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 ml-1"
        >
          <span>Register New Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supabase Live Connection</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT COLUMN: BRAND STORY & QUICK ACCESS */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">

            <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SmartFix Hub Platform Access</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Welcome Back to Your{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-400 bg-clip-text text-transparent">
                  Repair Workspace
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
                Log in to access your role-based dashboard, track live device tickets, manage customer referrals, and settle 2% commissions seamlessly.
              </p>
            </div>

            {/* Quick Role Badges */}
            <div className="space-y-3 pt-2 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Repair Shop Admin</div>
                  <div className="text-[11px] text-slate-400">Diagnosis, parts billing, work order dispatch &amp; seller payouts</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Affiliated Accessory Seller</div>
                  <div className="text-[11px] text-slate-400">Refer walk-in device repairs &amp; track 2% commission balance</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Customer &amp; Device Owner</div>
                  <div className="text-[11px] text-slate-400">View real-time diagnostic progress &amp; itemized repair invoice</div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LOGIN CARD */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

              <div className="mb-6 space-y-1">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>Secure Sign-In</span>
                </div>
                <h2 className="text-2xl font-black text-white">Sign In to Account</h2>
                <p className="text-xs text-slate-400">
                  Enter your verified email and password to continue
                </p>
              </div>

              <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading sign in form...</div>}>
                <LoginForm />
              </Suspense>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500 text-center flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>SmartFix Hub &bull; Hyperlocal Mobile Repair &amp; 2% Referral Platform &bull; Powered by Next.js &amp; Supabase</span>
        <span className="hidden sm:inline">&bull;</span>
        <Link href="/super-admin/login" className="text-slate-600 hover:text-purple-400 text-[11px] transition">
          Restricted Super Admin Portal
        </Link>
      </footer>

    </div>
  );
}
