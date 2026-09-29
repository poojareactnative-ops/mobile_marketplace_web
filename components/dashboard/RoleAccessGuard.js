import Link from 'next/link'
import { Store, ShieldCheck, Loader2 } from 'lucide-react'

export function DashboardLoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-2 text-sm text-slate-500">Checking authentication...</p>
      </div>
    </div>
  )
}

export function UnauthenticatedState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Store className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Registered Users Only</h2>
        <p className="mt-2 text-sm text-slate-500">
          Please log in with your registered account to access the dashboard.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export function AdminOnlyGuard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Platform Admin Access Only</h2>
        <p className="mt-2 text-sm text-slate-500">
          This console is reserved for Platform Administrators. Super Sellers should access the Seller Dashboard.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
          >
            Go to Seller Dashboard
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Log in as Admin
          </Link>
        </div>
      </div>
    </div>
  )
}

export function CustomerBlockedGuard({ user }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Store className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Super Seller & Admin Area</h2>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
          >
            Browse Products & Accessories
          </Link>
          <Link
            href="/register/super-seller"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Register as Super Seller
          </Link>
        </div>
      </div>
    </div>
  )
}
