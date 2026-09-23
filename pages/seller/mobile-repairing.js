"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import apiClient from '../../src/lib/api/client'
import { Wrench, Loader2 } from 'lucide-react'

export default function MobileRepairingOrders() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get('/seller/repair-jobs')
      .then((res) => {
        setJobs(res.data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setJobs([])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mobile Repairing Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Live repair jobs and service orders.</p>
        </div>

        <Link
          href="/seller/admin/repairing/customers/new"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
        >
          + Create Repair Job
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
            <p className="mt-2 text-xs">Loading repair orders...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Wrench className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No repair jobs found</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {jobs.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-3 py-4 hover:bg-slate-50/60 transition">
                <div>
                  <div className="font-bold text-slate-900">
                    {o.problemDescription || o.service || 'Diagnostic Repair'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {o.customerName || o.customer} • {o.customerPhone || o.phone} • {o.brand} {o.model}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      o.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : o.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {o.status}
                  </span>

                  <Link
                    href={`/seller/super-seller/repairing/solutions/${o.id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Manage →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
