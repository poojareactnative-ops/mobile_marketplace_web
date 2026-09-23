import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../../../../components/DashboardLayout'
import apiClient from '../../../../../src/lib/api/client'
import { Loader2, Wrench } from 'lucide-react'

export default function SuperSellerSolutions() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get('/seller/repair-jobs')
      .then((res) => {
        setProblems(res.data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setProblems([])
        setLoading(false)
      })
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="h-6 w-6 text-indigo-600" />
              <span>Repairing - Review Tickets</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review customer repair jobs, quote estimates, and decide sellability.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-slate-400">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
              <p className="mt-2 text-xs">Loading repair tickets...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No repair jobs awaiting review.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {problems.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="font-bold text-slate-900">{p.problemDescription || p.problem}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {p.customerName} • {p.brand} {p.model}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : p.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {p.status}
                    </span>
                    <Link
                      href={`/seller/super-seller/repairing/solutions/${p.id}`}
                      className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition"
                    >
                      Review & Quote →
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
