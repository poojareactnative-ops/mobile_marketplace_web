import Link from 'next/link'

export default function ForgotPasswordPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-12"><section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><Link href="/seller/login" className="text-sm font-semibold text-indigo-600">← Seller login</Link><h1 className="mt-4 text-3xl font-black text-slate-900">Reset your password</h1><p className="mt-3 text-slate-600">Enter your registered email and we’ll send password reset instructions.</p><form className="mt-6"><input type="email" required placeholder="Email address" className="w-full rounded-xl border border-slate-200 px-4 py-3" /><button className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">Send reset link</button></form></section></main>
}
