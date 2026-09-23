import { Package, Boxes, AlertTriangle, TrendingUp } from 'lucide-react'

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconClass = 'bg-indigo-50 text-indigo-600',
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="hidden rounded-lg bg-slate-50 p-1.5 text-slate-300 transition group-hover:text-indigo-400 sm:block">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{description}</p>
    </div>
  )
}

export default function ProductStatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        title="Total Products"
        value={stats.total}
        icon={Package}
        description="All active catalog"
      />
      <StatCard
        title="In Stock"
        value={stats.inStock}
        icon={Boxes}
        description="Healthy inventory"
        iconClass="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        title="Low Stock"
        value={stats.lowStock}
        icon={AlertTriangle}
        description="Needs attention"
        iconClass="bg-amber-50 text-amber-600"
      />
      <StatCard
        title="Out of Stock"
        value={stats.outOfStock}
        icon={TrendingUp}
        description="Restock required"
        iconClass="bg-red-50 text-red-600"
      />
    </div>
  )
}
