import Link from 'next/link'
import { ArrowLeft, PlusCircle, Phone, MapPin, UserCog, Pencil, Trash2 } from 'lucide-react'

import DashboardLayout from '../../../components/DashboardLayout'

const customers = [
  { name: 'Asha Kulkarni', phone: '+91 98765 43210', area: 'Koramangala', device: 'Samsung Galaxy M32', status: 'Active' },
  { name: 'Rohit Kumar', phone: '+91 98210 55443', area: 'Kharadi', device: 'OnePlus 9R', status: 'Repairing' },
  { name: 'Priya Nair', phone: '+91 99887 76543', area: 'Indiranagar', device: 'iPhone 11', status: 'New' },
  { name: 'Sanjay Patil', phone: '+91 98111 77889', area: 'Banjara Hills', device: 'Vivo V20', status: 'Follow-up' },
]

export default function AdminCustomersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller/admin" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Admin</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Customers</h1>
            </div>
          </div>

          <Link href="/seller/admin/customers/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4" />
            Add customer
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Total customers" value="1,248" tone="violet" />
          <MiniStat label="Active this week" value="356" tone="emerald" />
          <MiniStat label="Repair customers" value="214" tone="amber" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Device</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers.map((customer) => (
                  <tr key={customer.name} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700">
                          {customer.name.split(' ').map((n) => n[0]).slice(0,2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{customer.name}</p>
                          <p className="text-xs text-slate-500">Customer ID: C-1024</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{customer.area}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{customer.device}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{customer.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-violet-200 hover:text-violet-700">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function MiniStat({ label, value, tone }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <span className={`rounded-xl p-2 ${colors[tone]}`}><UserCog className="h-4 w-4" /></span>
      </div>
    </div>
  )
}
