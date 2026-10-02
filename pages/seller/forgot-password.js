import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Mail, ArrowLeft, KeyRound, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import authService from '../../src/lib/api/auth.service'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authService.forgotPassword(email.trim())
      setSuccessData(res.data || { message: 'Password reset link sent.' })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          'Failed to send password reset request. Please check the email format.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <section className="relative z-10 mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Seller Sign In</span>
        </Link>

        <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
          <KeyRound className="h-7 w-7" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Enter your registered email address. We will generate a secure 15-minute reset token.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
            {error}
          </div>
        )}

        {successData ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Reset Token Generated</h4>
                <p className="mt-1 text-xs leading-5 text-emerald-200">
                  {successData.message ||
                    'Password reset token generated successfully. Valid for 15 minutes.'}
                </p>
              </div>
            </div>

            {successData.resetToken && (
              <div className="mt-4 pt-3 border-t border-emerald-500/20">
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Reset Token
                </p>
                <div className="bg-black/40 rounded-xl p-2.5 font-mono text-[11px] text-slate-300 break-all select-all border border-white/5">
                  {successData.resetToken}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const tokenParam = successData.resetToken
                    ? `?token=${encodeURIComponent(successData.resetToken)}`
                    : ''
                  router.push(`/seller/reset-password${tokenParam}`)
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                <span>Continue to Set New Password</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessData(null)
                  setEmail('')
                }}
                className="text-center text-xs text-slate-400 hover:text-white transition py-2"
              >
                Try another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold text-slate-300">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@marketplace.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-white/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating token...</span>
                </>
              ) : (
                <>
                  <span>Request Reset Token</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
