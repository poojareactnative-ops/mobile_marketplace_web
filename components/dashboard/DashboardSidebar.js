import Link from 'next/link'
import { ChevronRight, Store } from 'lucide-react'

export default function DashboardSidebar({
  shopName,
  initials,
  roleLabel,
  navItems,
  pathname,
  role,
}) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        {/* Seller Info */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{shopName}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{roleLabel}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">Shop Active</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </p>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                    )}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-indigo-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{item.name}</span>
                    <ChevronRight
                      className={`h-4 w-4 transition-all ${
                        isActive
                          ? 'translate-x-0 text-indigo-500 opacity-100'
                          : '-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                      }`}
                    />
                  </Link>

                  {item.children && (
                    <div className="mt-1 space-y-1 pl-12">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                              childActive
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
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

        {/* Sidebar Bottom Promo */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Store className="h-4 w-4" />
            </div>
            <p className="mt-3 text-sm font-bold">Grow your business</p>
            <p className="mt-1 text-xs leading-5 text-indigo-100">
              Add more products and reach nearby customers.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href={role === 'ADMIN' || role === 'PLATFORM_ADMIN' ? '/admin/shops' : '/seller/products/new'}
                className="flex items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
              >
                {role === 'ADMIN' || role === 'PLATFORM_ADMIN' ? 'Manage Shops' : 'Add Product'}
              </Link>
              {role === 'ADMIN' || role === 'PLATFORM_ADMIN' ? (
                <Link
                  href="/admin/users"
                  className="flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
                >
                  User Accounts
                </Link>
              ) : (
                <Link
                  href="/seller/profile"
                  className="flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
                >
                  Shop Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
