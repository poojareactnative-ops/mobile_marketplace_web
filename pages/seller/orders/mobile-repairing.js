"use client"

import DashboardLayout from '../../../components/DashboardLayout'

const SAMPLE_JOBS = [
  { id: 'r1', service: 'Battery Replacement', customer: 'Suresh', phone: '9988776655', status: 'In Progress' },
  { id: 'r2', service: 'Screen Repair', customer: 'Priya', phone: '9811223344', status: 'Completed' },
]

export default function MobileRepairingOrders() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mobile Repairing Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Repair jobs and service requests.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white p-4">
          <ul className="divide-y divide-slate-100">
            {SAMPLE_JOBS.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-3 py-4">
                <div>
                  <div className="font-semibold text-slate-900">{o.service}</div>
                  <div className="text-xs text-slate-500">{o.customer} • {o.phone}</div>
                </div>

                <div className="text-sm text-slate-600">{o.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
