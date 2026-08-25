'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Tag,
  MessageCircle,
  User,
  ChevronRight,
  Store,
} from 'lucide-react'
import LogoutButton from './Auth/LogoutButton'

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/seller/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Products',
    href: '/seller/products',
    icon: ShoppingBag,
  },
  {
    name: 'Orders',
    href: '/seller/orders',
    icon: ClipboardList
  },
  {
    name: 'Offers',
    href: '/seller/offers',
    icon: Tag,
  },
  {
    name: 'Enquiries',
    href: '/seller/enquiries',
    icon: MessageCircle,
  },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ========================================= */}
      {/* TOPBAR */}
      {/* ========================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            href="/seller/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20">
              <Store className="h-5 w-5" />
            </div>

            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900">
                Hyperlocal Mobile
              </h1>

              <p className="text-[11px] text-slate-400">
                Seller Dashboard
              </p>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Profile */}
            <Link
              href="/seller/profile"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <User className="h-4 w-4 transition group-hover:scale-105" />

              <span className="hidden sm:inline">
                Profile
              </span>
            </Link>

            <LogoutButton />

          </div>
        </div>
      </header>

      {/* ========================================= */}
      {/* MAIN */}
      {/* ========================================= */}

      <div className="mx-auto flex max-w-[1600px]">

        {/* ========================================= */}
        {/* SIDEBAR */}
        {/* ========================================= */}

        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white lg:block">

          <div className="flex h-full flex-col">

            {/* Seller Info */}
            <div className="border-b border-slate-100 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md">
                  PM
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    Pooja Mobile
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    Super Seller
                  </p>
                </div>

              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-semibold text-emerald-700">
                  Shop Active
                </span>
              </div>

            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Menu
              </p>

              <div className="space-y-1.5">

                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon

                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)

                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium
                          transition-all duration-200
                          ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }
                        `}
                      >

                        {/* Active indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                        )}

                        {/* Icon */}
                        <span
                          className={`
                            flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition
                            ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        {/* Label */}
                        <span className="flex-1">
                          {item.name}
                        </span>

                        {/* Arrow */}
                        <ChevronRight
                          className={`
                            h-4 w-4 transition-all
                            ${
                              isActive
                                ? 'translate-x-0 text-indigo-500 opacity-100'
                                : '-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                            }
                          `}
                        />

                      </Link>

                      {/* children links (subsections) */}
                      {item.children && (
                        <div className="mt-1 space-y-1 pl-12">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`)
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${childActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                              >
                                {child.name}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}

              </div>
            </nav>

            {/* Sidebar Bottom */}
            <div className="border-t border-slate-100 p-4">

              <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Store className="h-4 w-4" />
                </div>

                <p className="mt-3 text-sm font-bold">
                  Grow your business
                </p>

                <p className="mt-1 text-xs leading-5 text-indigo-100">
                  Add more products and reach nearby customers.
                </p>

                <Link
                  href="/seller/products/new"
                  className="mt-3 flex items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Add Product
                </Link>

              </div>

            </div>

          </div>
        </aside>

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}

        <main className="min-w-0 flex-1">

          <div className="px-4 py-6 sm:px-6 lg:px-8">

            {children}

          </div>

        </main>

      </div>

      {/* ========================================= */}
      {/* MOBILE BOTTOM NAVIGATION */}
      {/* ========================================= */}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl lg:hidden">

        <nav className="grid grid-cols-5 gap-1">

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition
                  ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'stroke-[2.5]' : ''
                  }`}
                />

                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}