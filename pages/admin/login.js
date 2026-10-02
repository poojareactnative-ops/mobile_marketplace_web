"use client"

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Store,
  ChevronLeft,
  KeyRound,
} from 'lucide-react'
import apiClient from '../../src/lib/api/client'
import { useAuthStore } from '../../src/store/auth.store'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleAdminLogin(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your admin credentials.')
      setSubmitting(false)
      return
    }

    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
      })

      const responseData = res.data?.data || res.data
      const user = responseData.user
      const shop = responseData.shop
      const tokens = responseData.tokens

      // STRICT SUPER ADMIN ROLE VERIFICATION
      const isSuperAdmin = user?.role === 'SUPER_ADMIN'

      if (!isSuperAdmin) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_access_token')
          localStorage.removeItem('auth_refresh_token')
        }
        setError(
          'Access Denied: Only Super Admins (Platform Owners) are permitted to sign in to this governance console. Super Sellers and Customers should use their respective portals.'
        )
        setSubmitting(false)
        return
      }

      useAuthStore
        .getState()
        .setAuth(user, shop, tokens?.accessToken || responseData.accessToken, tokens?.refreshToken || responseData.refreshToken)

      const redirect = router.query.redirect
      if (redirect && typeof redirect === 'string' && redirect.startsWith('/admin')) {
        router.push(redirect)
      } else {
        router.push('/admin')
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          'Authentication failed. Please check your admin credentials.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-xl shadow-indigo-500/20 text-white">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
            <KeyRound className="h-3 w-3" />
            <span>Platform Governance Console</span>
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Admin Sign In
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Secure root access for platform operators, store verification & dispute oversight.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Administrator Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hyperlocal.com"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-10 text-xs text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              <span>{submitting ? 'Authenticating Admin...' : 'Authenticate & Open Console'}</span>
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-5 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Are you a local mobile store or repair technician?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Go to Super Seller Portal</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-300"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Return to Public Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
