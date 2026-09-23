import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import DashboardLayout from '../../components/DashboardLayout'
import { Wrench, Search, Clock, CheckCircle2, AlertCircle, PhoneCall, Store, Filter } from 'lucide-react'

export default function AdminRepairsPage() {
  const [selectedStatus, setSelectedStatus] = useState('')

  const { data: repairsData, isLoading } = useQuery({
    queryKey: ['admin-repairs', selectedStatus],
    queryFn: async () => {
      const param = selectedStatus ? `?status=${selectedStatus}` : ''
      const res = await apiClient.get(`/admin/repairs${param}`)
      return res.data?.data || []
    },
  })

  const repairs = repairsData || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
              <Wrench className="h-4 w-4" />
              Platform Service Operations
            </div>
            <h1 className="mt-1 text-3xl font-black text-slate-900">All Network Repair Jobs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live oversight of all repair requests across all registered repair centers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['', 'SUBMITTED', 'IN_PROGRESS', 'READY', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  selectedStatus === status
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {status ? status.replace('_', ' ') : 'All Statuses'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : repairs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No repair jobs found</h3>
            <p className="mt-1 text-sm text-slate-500">There are no tickets matching the selected status.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-100">
              {repairs.map((r) => (
                <li key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 gap-4 hover:bg-slate-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">#{r.id.slice(0, 8)}</span>
                      <span className="font-bold text-slate-900">{r.customerName || 'Customer'}</span>
                      {r.customerPhone ? (
                        <span className="text-xs text-slate-500">• {r.customerPhone}</span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {r.brand} {r.model} — <span className="font-normal text-slate-600">{r.problemDescription}</span>
                    </p>

                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Store className="h-3.5 w-3.5 text-slate-400" />
                        {r.shop?.name || 'Local Store'}
                      </span>
                      <span>
                        Created: {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        r.status === 'READY' || r.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
