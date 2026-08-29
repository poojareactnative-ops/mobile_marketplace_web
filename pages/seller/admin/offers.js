"use client"

import DashboardLayout from '../../../components/DashboardLayout'

const SAMPLE = [
  { id: 'o1', title: '10% off screen protectors' },
  { id: 'o2', title: 'Free installation with battery' },
]

export default function OffersAdmin() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage promotional offers.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <ul className="divide-y divide-slate-100">
            {SAMPLE.map((s) => (
              <li key={s.id} className="px-4 py-3">{s.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
