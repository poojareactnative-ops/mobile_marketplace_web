import Link from 'next/link'
import { Store, User } from 'lucide-react'
import LogoutButton from '../Auth/LogoutButton'

export default function DashboardHeader({ dashboardHref, roleLabel }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={dashboardHref} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20">
            <Store className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900">Hyperlocal Mobile</h1>
            <p className="text-[11px] text-slate-400">{roleLabel}</p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/seller/profile"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <User className="h-4 w-4 transition group-hover:scale-105" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
