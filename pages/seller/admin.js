import Link from 'next/link'
import {
  Users,
  Wrench,
  Package,
  Tag,
  PlusCircle,
  PhoneCall,
  TrendingUp,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

import DashboardLayout from '../../components/DashboardLayout'

const stats = [
  { label: 'Customers', value: '1,248', change: '+18% this month', icon: Users, tone: 'bg-violet-50 text-violet-600' },
  { label: 'Repair Jobs', value: '246', change: '32 pending', icon: Wrench, tone: 'bg-amber-50 text-amber-600' },
  { label: 'Products', value: '412', change: '+14% added', icon: Package, tone: 'bg-emerald-50 text-emerald-600' },
  { label: 'Offers', value: '08', change: '3 active now', icon: Tag, tone: 'bg-sky-50 text-sky-600' },
]

const recentCustomers = [
  { name: 'Asha Kulkarni', area: 'Koramangala', status: 'Active', phone: '+91 98765 43210' },
  { name: 'Rohit Kumar', area: 'Kharadi', status: 'Repairing', phone: '+91 98210 55443' },
  { name: 'Priya Nair', area: 'Indiranagar', status: 'New', phone: '+91 99887 76543' },
]

const repairQueue = [
  { customer: 'Saurabh T.', issue: 'Screen cracked', status: 'In progress', amount: '₹2,200' },
  { customer: 'Kavita M.', issue: 'Battery drain', status: 'Waiting for parts', amount: '₹1,450' },
  { customer: 'Rahul S.', issue: 'Charging port issue', status: 'Ready', amount: '₹1,980' },
]

const products = [
  { name: 'USB-C Cable', price: '₹299', stock: '42 in stock' },
  { name: 'Tempered Glass', price: '₹199', stock: '18 in stock' },
  { name: 'Power Bank', price: '₹1,299', stock: '09 in stock' },
]

export default function AdminDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Admin dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">Operations overview</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/seller/admin/customers/new" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700">
              <PlusCircle className="h-4 w-4" />
              Add customer
            </Link>
            <Link href="/seller/admin/repair-request/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
              <PhoneCall className="h-4 w-4" />
              New repair request
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, change, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <h2 className="mt-3 text-3xl font-black text-slate-900">{value}</h2>
                </div>
                <span className={`rounded-xl p-3 ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-xs font-medium text-emerald-600">{change}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Service queue</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Repair requests</h2>
              </div>
              <Link href="/seller/admin/repairs" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {repairQueue.map(({ customer, issue, status, amount }) => (
                <div key={customer} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{customer}</p>
                    <p className="text-sm text-slate-500">{issue}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{status}</span>
                    <span className="text-sm font-bold text-slate-800">{amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Coverage</p>
                <h2 className="text-xl font-bold text-slate-900">Local area reach</h2>
              </div>
            </div>

            <div className="space-y-3">
              {['Koramangala', 'Kharadi', 'Indiranagar', 'Jayanagar'].map((area, index) => (
                <div key={area} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{area}</span>
                  <span className="text-xs font-semibold text-emerald-600">{[78, 64, 88, 72][index]}% active</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Customer records</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Recent customers</h2>
              </div>
              <Link href="/seller/admin/customers" className="text-sm font-semibold text-violet-600">Manage</Link>
            </div>

            <div className="space-y-3">
              {recentCustomers.map(({ name, area, status, phone }) => (
                <div key={name} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{name}</p>
                    <p className="text-sm text-slate-500">{area} • {phone}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Product catalog</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Accessories</h2>
              </div>
              <Link href="/seller/admin/products" className="text-sm font-semibold text-violet-600">View all</Link>
            </div>

            <div className="space-y-3">
              {products.map(({ name, price, stock }) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-800">{name}</p>
                    <p className="text-sm text-slate-500">{stock}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Performance</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Admin summary</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard title="Repair completion" value="89%" note="Up 8% from last week" tone="emerald" />
            <SummaryCard title="Accessory sales" value="₹24.8k" note="Strong local demand" tone="violet" />
            <SummaryCard title="Customer retention" value="76%" note="Repeat bookings" tone="amber" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function SummaryCard({ title, value, note, tone }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className={`rounded-xl p-2 ${colors[tone]}`}>
          <CheckCircle2 className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-4 text-3xl font-black text-slate-900">{value}</h3>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  )
}
