
"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useAuth } from '../../features/auth/hooks/useAuth'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [pathname, setPathname] = useState('')
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    setPathname(typeof window !== 'undefined' ? window.location.pathname : '')
  }, [])

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'offers', label: 'Offers' },
    { id: 'products', label: 'Products' },
    { id: 'how', label: 'How it works' },
    { id: 'features', label: 'Features' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' },
  ]

  function handleClickSection(id: string) {
    setOpen(false)

    if (id === 'hero' && isAuthenticated) {
      router.push(dashboardHref)
      return
    }

    if (pathname === '/' || pathname === '') {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      return
    }

    router.push(`/#${id}`)
  }

  const dashboardHref =
    user?.role === 'ADMIN' || user?.role === 'PLATFORM_ADMIN' || user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : '/seller/dashboard'

  const homeHref = isAuthenticated ? dashboardHref : '/'

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/60 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={homeHref} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">HM</div>
              <div>
                <div className="text-sm font-bold text-slate-900">Hyperlocal Mobile</div>
                <div className="text-xs text-slate-400">Accessories & Repairs</div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center md:gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClickSection(item.id)}
                className="text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex md:items-center md:gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={dashboardHref}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Dashboard ({user?.name?.split(' ')[0] || 'Account'})
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5">
                    Login
                  </Link>
                  <Link
                    href="/register/super-seller?mode=register"
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl shadow-sm transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white/95">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClickSection(item.id)}
                className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </button>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="block rounded-md px-3 py-2 text-sm font-semibold text-indigo-600"
                  >
                    Dashboard ({user?.name})
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="text-left block rounded-md px-3 py-2 text-sm font-semibold text-rose-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register/super-seller?mode=register" className="block rounded-md px-3 py-2 text-sm font-semibold text-indigo-600">Register</Link>
                  <Link href="/login" className="block rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Login</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
