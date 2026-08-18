"use client"

import Link from 'next/link'
import { Home, Search, MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-900 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
          <div className="relative text-center">
            <div className="relative mx-auto mb-6 w-fit">
              <div className="text-[90px] font-black leading-none tracking-[-0.05em] text-transparent bg-gradient-to-br from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text sm:text-[120px]">404</div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">Page not found</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-400">We couldn't locate that page — try returning home or visit your dashboard.</p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/" className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700">
                <Home className="h-4 w-4" />
                Back to home
              </Link>

              <Link href="/seller/dashboard" className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                <MapPin className="h-4 w-4 text-indigo-300" />
                Seller dashboard
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} Hyperlocal Mobile</p>
      </div>
    </main>
  )
}
