import Link from 'next/link'

export default function DashboardMobileNav({ navItems, pathname, queryTab }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      <nav className={`grid gap-1 ${navItems.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = item.tabKey
            ? item.tabKey === 'requests'
              ? (pathname === '/admin' || pathname === '/admin/requests') && (queryTab === 'requests' || !queryTab)
              : item.tabKey === 'plans'
              ? (pathname === '/admin' && queryTab === 'plans') || pathname === '/admin/plans'
              : item.tabKey === 'users'
              ? pathname === '/admin/users' || pathname.startsWith('/admin/users/')
              : false
            : pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="truncate max-w-[70px] text-center">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
