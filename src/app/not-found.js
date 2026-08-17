import Link from 'next/link'
import '../app/globals.css'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-black text-slate-900">404</h1>
        <p className="mt-4 text-lg text-slate-600">This page could not be found.</p>
        <p className="mt-2 text-sm text-slate-400">Try returning to the homepage or visit your dashboard.</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Go home</Link>
          <Link href="/seller/dashboard" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Seller dashboard</Link>
        </div>
      </div>
    </div>
  )
}
