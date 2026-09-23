import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../../../../components/DashboardLayout'
import apiClient from '../../../../../src/lib/api/client'
import { Loader2 } from 'lucide-react'

export default function CustomerProblemsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get('/seller/repair-jobs')
      .then((res) => {
        setItems(res.data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
      })
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Repair Problems</h1>
            <p className="text-sm text-slate-500">Live repair jobs and problems from database.</p>
          </div>

          <div>
            <Link
              href="/seller/admin/repairing/customers/new"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              + Submit Problem
            </Link>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-slate-400">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
              <p className="mt-2 text-xs">Loading repair tickets...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No repair problems submitted yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="font-bold text-slate-900">{it.problemDescription || it.problem || '—'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {it.customerName} • {it.customerPhone} • {it.brand} {it.model}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {it.status}
                    </span>
                    <Link
                      href={`/seller/super-seller/repairing/solutions/${it.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Review →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
