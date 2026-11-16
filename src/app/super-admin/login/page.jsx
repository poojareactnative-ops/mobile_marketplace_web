'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  ShieldAlert, ShieldCheck, Lock, Mail, Key, ArrowRight,
  Eye, EyeOff, ArrowLeft, Terminal, AlertTriangle, CheckCircle2,
  Sparkles, RefreshCw, Cpu
} from 'lucide-react';

function SuperAdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectTarget = (rawRedirect && !rawRedirect.includes('/login')) ? rawRedirect : '/super-admin';
  const { user, role, isAuthenticated, loading, superAdminLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // If already authenticated as Super Admin, proceed directly to workbench
  React.useEffect(() => {
    if (!loading && isAuthenticated && role === 'SUPER_ADMIN') {
      router.replace(redirectTarget);
    }
  }, [loading, isAuthenticated, role, router, redirectTarget]);

  // Quick fill helper for platform test
  const handleQuickFill = () => {
    setEmail('superadmin@smartfix.com');
    setPassword('SuperAdmin@123');
    setSecurityKey('MASTER-9922');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Super Admin email required');
      return;
    }
    if (!password) {
      setError('Super Admin password required');
      return;
    }
    if (!securityKey.trim()) {
      setError('Master Platform Security Key (2FA Passcode) is mandatory');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await superAdminLogin(email.trim(), password, securityKey.trim());
      router.push(redirectTarget);
    } catch (err) {
      setFailedAttempts((prev) => prev + 1);
      setError(err.message || 'Super Admin authorization failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* Security Level Notification */}
      <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-center justify-between text-xs text-purple-300">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Security Protocol: <strong>TLS-RSA-AES256</strong></span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
          ROOT ACCESS
        </span>
      </div>

      {failedAttempts > 0 && failedAttempts < 5 && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Audit notice: {failedAttempts} unauthorized attempt(s) recorded in security logs.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/90 border border-rose-800 text-rose-300 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 shadow-xl animate-in fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {/* Super Admin Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Platform Identity Email</span>
            <span className="text-[10px] text-purple-400 font-mono">ROLE: SUPER_ADMIN</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@smartfix.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-medium transition shadow-inner font-mono"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Master Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-medium transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 text-slate-500 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Master Security Key (2FA Passcode Protection) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Master Platform Security Key (2FA Passcode)</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">Required</span>
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              required
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
              placeholder="e.g. MASTER-9922"
              className="w-full pl-3.5 pr-10 py-2.5 bg-purple-950/20 border border-purple-500/50 rounded-xl text-xs text-purple-200 placeholder-purple-400/40 focus:outline-none focus:border-purple-400 font-mono font-bold tracking-wider transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-2.5 text-slate-500 hover:text-white transition"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Authorized Platform Keys: <code className="text-purple-400">MASTER-9922</code> or <code className="text-purple-400">9922</code>
          </p>
        </div>

        {/* Authorize Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-xl shadow-purple-900/30 transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Authenticating Cryptographic Key...</span>
            </>
          ) : (
            <>
              <span>Authorize Super Admin Session</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Fill Demo Helper for Testing */}
      <div className="pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={handleQuickFill}
          className="w-full py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/20 hover:border-purple-500/40 text-[11px] text-purple-300 font-semibold flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Auto-Fill Authorized Super Admin Credentials</span>
        </button>
      </div>

    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">

      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="px-6 py-4 border-b border-purple-950/60 bg-slate-950/70 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Public Portal</span>
          </Link>
          <div className="flex items-center space-x-2 text-[11px] text-purple-400">
            <Cpu className="w-3.5 h-3.5 animate-pulse text-purple-400" />
            <span>Restricted Governance Intranet</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT COLUMN: SECURITY GOVERNANCE BRIEF */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-purple-950/60 border border-purple-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-300 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Platform Governance Vault</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Super Admin{' '}
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-500 bg-clip-text text-transparent">
                  Access Portal
                </span>
              </h1>
              <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                Dedicated gateway for platform owners and lead auditors. Authenticate with your master identity, password, and the platform security key to oversee live transactions, 2% referral commissions, and store authorizations.
              </p>
            </div>

            {/* Security safeguards list */}
            <div className="space-y-2.5 pt-2 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs text-slate-300">Multi-Factor Master Key Authorization</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs text-slate-300">Isolated from Public User &amp; Seller Login</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs text-slate-300">Real-time Session Verification &amp; Role Guarding</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN VAULT CARD */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/95 border border-purple-500/40 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full pointer-events-none" />

              <div className="mb-6 space-y-1">
                <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Lock className="w-4 h-4" />
                  <span>Restricted Access</span>
                </div>
                <h2 className="text-2xl font-black text-white">Super Admin Sign-In</h2>
                <p className="text-xs text-slate-400">
                  Enter master credentials and 2FA security key
                </p>
              </div>

              <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading vault...</div>}>
                <SuperAdminLoginForm />
              </Suspense>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-xs text-slate-500 text-center">
        SmartFix Platform Security &bull; Master Administration Intranet &bull; Strictly Confidential
      </footer>

    </div>
  );
}

