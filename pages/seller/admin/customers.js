"use client"

import Link from 'next/link'
import DashboardLayout from '../../../components/DashboardLayout'
import { PlusCircle } from 'lucide-react'

const SAMPLE = [
  { id: 'c1', name: 'Ravi', phone: '9988001122' },
  { id: 'c2', name: 'Anita', phone: '9770011223' },
]

export default function Customers() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
    <p className="mt-1 text-sm text-slate-500">
      Manage customer records.
    </p>
  </div>

  <Link
    href="/seller/admin/customers/new"
    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
  >
    <PlusCircle className="h-4 w-4" />
    Add Customer
  </Link>
</div>
        <div className="overflow-hidden rounded-2xl border bg-white">
          <ul className="divide-y divide-slate-100">
            {SAMPLE.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{c.phone}</div>
                </div>
                <div className="text-sm text-slate-600">Customer</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
