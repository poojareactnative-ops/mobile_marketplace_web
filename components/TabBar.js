'use client'

import Link from 'next/link'
import {
  Home,
  Store,
  MessageSquare,
  UserPlus,
  ShoppingCart,
} from 'lucide-react'

export default function TabBar() {
  // `usePathname` from App Router isn't available in Pages router.
  // Use a safe runtime fallback to `window.location.pathname` so TabBar
  // doesn't crash when rendered under the pages/ router.
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  // Hide TabBar on seller dashboard and related seller routes
  if (pathname && pathname.startsWith('/seller')) return null

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/shops',
      label: 'Shops',
      icon: Store,
    },
    {
      href: '/register/super-seller',
      label: 'Register',
      icon: UserPlus,
    },
  ]

  return (
    <nav className="fixed right-5 top-1/2 z-50 -translate-y-1/2">
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/60 bg-white/80 p-2 shadow-[0_12px_40px_rgba(15,23,42,0.15)] backdrop-blur-xl">

        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`group flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Icon
                size={21}
                strokeWidth={2}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-1 h-px w-7 bg-slate-200" />

        {/* Cart */}

      </div>
    </nav>
  )
}