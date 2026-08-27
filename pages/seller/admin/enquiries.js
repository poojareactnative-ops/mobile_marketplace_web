import Link from 'next/link'
import { ArrowLeft, MessageSquareText, Clock3, CheckCircle2 } from 'lucide-react'

import DashboardLayout from '../../../components/DashboardLayout'

const enquiries = [
  { customer: 'Asha Kulkarni', issue: 'Need battery replacement for Samsung M32', status: 'New', time: '2 hours ago' },
  { customer: 'Rahul S.', issue: 'Ask for screen repair price for OnePlus 9R', status: 'Follow-up', time: 'Yesterday' },
  { customer: 'Priya Nair', issue: 'Interested in tempered glass and charger combo', status: 'Resolved', time: '3 days ago' },
  { customer: 'Vikram Singh', issue: 'Request for urgent charging port repair', status: 'In progress', time: '1 week ago' },
]

export default function AdminEnquiriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/seller/admin" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Admin</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Enquiries</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="New" value="12" tone="violet" />
          <MiniStat label="In progress" value="08" tone="amber" />
          <MiniStat label="Resolved" value="36" tone="emerald" />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Issue</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enquiries.map((item) => (
                  <tr key={item.customer} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-800">{item.customer}</td>
                    <td className="px-4 py-3 text-slate-600">{item.issue}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'New' ? 'bg-violet-50 text-violet-700' : item.status === 'In progress' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.time}</td>
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
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <span className={`rounded-xl p-2 ${colors[tone]}`}><MessageSquareText className="h-4 w-4" /></span>
      </div>
    </div>
  )
}
