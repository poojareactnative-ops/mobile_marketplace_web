import Link from 'next/link'

export default function DashboardMobileNav({ navItems, pathname }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      <nav className="grid grid-cols-5 gap-1">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="truncate max-w-[55px] text-center">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
