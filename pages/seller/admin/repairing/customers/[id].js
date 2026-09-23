import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../../../components/DashboardLayout'
import apiClient from '../../../../../src/lib/api/client'
import { Loader2 } from 'lucide-react'

export default function ProblemDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    apiClient
      .get(`/seller/repair-jobs/${id}`)
      .then((r) => {
        setItem(r.data.data)
        setLoading(false)
      })
      .catch(() => {
        setItem(null)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h2 className="text-xl font-bold">Problem Not Found</h2>
          <button onClick={() => router.back()} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-white">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    )
  }

  async function markAcceptable() {
    try {
      const res = await apiClient.patch(`/seller/repair-jobs/${item.id}`, {
        status: 'APPROVED',
        note: 'Admin marked problem acceptable for super-seller repair.',
      })
      setItem(res.data.data)
    } catch {
      alert('Failed to update status')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{item.problemDescription || item.problem || 'Repair Problem'}</h1>
            <p className="text-sm text-slate-500 mt-1">Submitted by {item.customerName} • {item.customerPhone}</p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {item.status}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-bold text-slate-400 uppercase">Device</div>
            <div className="font-semibold text-slate-800 mt-1">{item.brand} {item.model}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-bold text-slate-400 uppercase">Description</div>
            <div className="mt-2 text-slate-700 text-sm leading-relaxed">{item.problemDescription || item.problem}</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200" onClick={() => router.back()}>
              Back
            </button>
            <button className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700" onClick={markAcceptable}>
              Mark Acceptable
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
