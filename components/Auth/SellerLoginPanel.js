import Link from 'next/link'
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, ShieldAlert } from 'lucide-react'

export default function SellerLoginPanel({
  loginForm,
  handleLoginChange,
  showPassword,
  setShowPassword,
  onSubmit,
  onRegister,
  loginSubmitted,
  loginError,
}) {
  return (
    <>
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
        <LogIn className="h-7 w-7" />
      </div>

      <h2 className="text-2xl font-bold">Welcome back</h2>
      <p className="mt-3 leading-7 text-indigo-100">
        Login to manage your shop, products, orders and customer enquiries.
      </p>

      {loginError && (
        <div className="mt-4 rounded-xl border border-rose-300/40 bg-rose-500/20 p-3 text-xs font-semibold text-rose-100">
          {loginError}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold text-indigo-100">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-200" />
            <input
              type="email"
              name="email"
              value={loginForm.email}
              onChange={handleLoginChange}
              placeholder="seller@example.com"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-indigo-200/60 backdrop-blur transition focus:border-white/30 focus:bg-white/15"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-indigo-100">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-200" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-10 pr-11 text-sm text-white outline-none placeholder:text-indigo-200/60 backdrop-blur transition focus:border-white/30 focus:bg-white/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-200 transition hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <a
            href="/seller/forgot-password"
            className="text-xs font-medium text-indigo-100 transition hover:text-white hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loginSubmitted}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50 disabled:opacity-75"
        >
          <LogIn className="h-4 w-4" />
          {loginSubmitted ? 'Logging in...' : 'Login'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-center text-xs text-indigo-100">Don't have a seller account?</p>
        <button
          type="button"
          onClick={onRegister}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <UserPlus className="h-4 w-4" />
          Create Account
        </button>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-200 hover:text-white transition"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-300" />
            <span>Platform Admin Sign In →</span>
          </Link>
        </div>
      </div>
    </>
  )
}
