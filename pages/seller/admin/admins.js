"use client"

import DashboardLayout from '../../../components/DashboardLayout'
import Link from 'next/link'

const SAMPLE = [
  { id: 'ad1', name: 'Asha Verma', email: 'asha@company.com' },
  { id: 'ad2', name: 'Rohit Sharma', email: 'rohit@company.com' },
]

export default function AdminsList() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admins</h1>
          <p className="mt-1 text-sm text-slate-500">Manage platform administrators.</p>
        </div>

        <div className="flex items-center justify-end">
          <Link href="/admin/admins/new" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white">New Admin</Link>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <ul className="divide-y divide-slate-100">
            {SAMPLE.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{a.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{a.email}</div>
                </div>
                <div className="text-sm text-slate-600">Admin</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
