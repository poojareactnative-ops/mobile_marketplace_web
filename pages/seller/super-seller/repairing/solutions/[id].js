import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../../../components/DashboardLayout'
import apiClient from '../../../../../src/lib/api/client'
import {
  Wrench,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldAlert,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

export default function ReviewProblem() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState(null)
  const [status, setStatus] = useState('')
  const [estimateRupees, setEstimateRupees] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!id) return
    apiClient
      .get(`/seller/repair-jobs/${id}`)
      .then((res) => {
        const job = res.data.data
        setItem(job)
        setStatus(job.status)
        if (job.estimatedCostPaise) {
          setEstimateRupees((job.estimatedCostPaise / 100).toString())
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load job', err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-slate-500">Loading ticket details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Repair Job Not Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </DashboardLayout>
    )
  }

  async function handleStatusUpdate(newStatus, isSellable = undefined) {
    setSaving(true)
    const costPaise =
      estimateRupees && !isNaN(parseFloat(estimateRupees))
        ? Math.round(parseFloat(estimateRupees) * 100)
        : undefined

    try {
      const res = await apiClient.patch(`/seller/repair-jobs/${item.id}`, {
        status: newStatus,
        estimatedCostPaise: costPaise,
        isSellable,
        note: note || `Updated status to ${newStatus}`,
      })
      setItem(res.data.data)
      setStatus(newStatus)
      setNote('')
      setToast(`Updated status to ${newStatus}`)
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to list
            </button>
            <h1 className="text-2xl font-bold text-slate-900">
              Repair Ticket #{item.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-slate-500">
              Customer: {item.customerName} ({item.customerPhone})
            </p>
          </div>

          <span
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
              item.status === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700'
                : item.status === 'APPROVED'
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {item.status}
          </span>
        </div>

        {toast && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700">
            {toast}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Details */}
          <div className="space-y-6 md:col-span-2">
            {/* Problem & Device info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Diagnostic Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Device</span>
                  <p className="mt-1 font-bold text-slate-800">{item.brand} {item.model}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Sellability Status</span>
                  <p className="mt-1 font-bold text-slate-800">
                    {item.isSellable ? '✅ Sellable / Approved' : '⏳ Pending Super Seller Review'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Problem Description</span>
                <p className="mt-1 text-sm text-slate-800 leading-relaxed">
                  {item.problemDescription || item.problem}
                </p>
              </div>
            </div>

            {/* Audit Trail Updates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>Status & Audit History</span>
              </h2>

              <div className="space-y-4">
                {item.updates && item.updates.length > 0 ? (
                  item.updates.map((u, i) => (
                    <div key={u.id || i} className="flex items-start gap-3 border-l-2 border-indigo-200 pl-4 py-1">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-600">{u.status}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(u.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{u.note || 'No notes provided'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No updates logged yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Action / Review Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Update Job & Estimate</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Estimated Repair Cost (₹)
                </label>
                <input
                  type="number"
                  value={estimateRupees}
                  onChange={(e) => setEstimateRupees(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Progress Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. OEM parts arrived; beginning screen replacement..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleStatusUpdate('APPROVED', true)}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-75"
                >
                  Mark Sellable & Approve
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  className="w-full rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-75"
                >
                  Mark In Progress
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-75"
                >
                  Mark Repair Completed
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleStatusUpdate('NOT_REPAIRABLE')}
                  className="w-full rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition disabled:opacity-75"
                >
                  Reject / Not Repairable
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
