import Link from 'next/link'
import { ArrowLeft, PlusCircle, Wrench, DollarSign, CheckCircle2 } from 'lucide-react'

import DashboardLayout from '../../../components/DashboardLayout'

const repairRequests = [
  { customer: 'Saurabh T.', device: 'Samsung S21', issue: 'Screen cracked', status: 'In progress', cost: '₹2,200', priority: 'High' },
  { customer: 'Kavita M.', device: 'iPhone 11', issue: 'Battery drain', status: 'Waiting for parts', cost: '₹1,450', priority: 'Medium' },
  { customer: 'Rahul S.', device: 'OnePlus 9R', issue: 'Charging port issue', status: 'Ready', cost: '₹1,980', priority: 'Low' },
  { customer: 'Priya D.', device: 'Vivo V20', issue: 'Speaker not working', status: 'Diagnosing', cost: '₹1,100', priority: 'Medium' },
]

export default function AdminRepairRequestsPage() {
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
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Repair requests</h1>
            </div>
          </div>

          <Link href="/seller/admin/repair-request/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4" />
            New repair request
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Open requests" value="32" tone="amber" />
          <MiniStat label="In progress" value="18" tone="violet" />
          <MiniStat label="Completed" value="96" tone="emerald" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Device</th>
                  <th className="px-4 py-3 font-semibold">Issue</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {repairRequests.map((request) => (
                  <tr key={request.customer} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-800">{request.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{request.device}</td>
                    <td className="px-4 py-3 text-slate-600">{request.issue}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${request.priority === 'High' ? 'bg-rose-50 text-rose-700' : request.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{request.status}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{request.cost}</td>
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
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <span className={`rounded-xl p-2 ${colors[tone]}`}><Wrench className="h-4 w-4" /></span>
      </div>
    </div>
  )
}
