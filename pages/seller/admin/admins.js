import Link from 'next/link'
import { ArrowLeft, PlusCircle, ShieldCheck, Star, Users } from 'lucide-react'

import DashboardLayout from '../../../components/DashboardLayout'

const admins = [
  { name: 'Riya Sharma', city: 'Bengaluru', assigned: '136 customers', rating: '4.9', status: 'On duty' },
  { name: 'Aman Verma', city: 'Pune', assigned: '94 customers', rating: '4.8', status: 'Busy' },
  { name: 'Neha Patil', city: 'Nagpur', assigned: '118 customers', rating: '5.0', status: 'On duty' },
]

export default function AdminTeamPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller/admin" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Super seller</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Admin team</h1>
            </div>
          </div>

          <Link href="/seller/admin/admins/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4" />
            Create admin
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Admins" value="08" tone="violet" />
          <MiniStat label="Assigned customers" value="1,248" tone="emerald" />
          <MiniStat label="Avg. rating" value="4.8" tone="amber" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {admins.map((admin) => (
            <div key={admin.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 font-bold text-white">
                  {admin.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{admin.status}</span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">{admin.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{admin.city}</p>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> Customers</span>
                  <span className="font-semibold text-slate-800">{admin.assigned}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" /> Rating</span>
                  <span className="font-semibold text-slate-800">{admin.rating}</span>
                </div>
              </div>
            </div>
          ))}
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
        <span className={`rounded-xl p-2 ${colors[tone]}`}><ShieldCheck className="h-4 w-4" /></span>
      </div>
    </div>
  )
}
