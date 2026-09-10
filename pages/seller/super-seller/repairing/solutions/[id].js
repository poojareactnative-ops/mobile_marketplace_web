import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../../../components/DashboardLayout'
import repairingService from '../../../../../services/repairingService'

export default function ReviewProblem() {
  const router = useRouter()
  const { id } = router.query
  const [item, setItem] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/repairing/problems/${id}`).then((r) => r.json()).then((d) => setItem(d))
  }, [id])

  if (!item) return (
    <DashboardLayout>
      <div className="p-6">Loading...</div>
    </DashboardLayout>
  )

  function markSoldable() {
    fetch(`/api/repairing/problems/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Sellable' }) })
      .then((r) => r.json())
      .then((d) => setItem(d))
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review: {item.problem}</h1>
            <p className="text-sm text-slate-500">Customer: {item.customerName} • {item.customerPhone}</p>
          </div>

          <div className="text-sm text-slate-600">{item.status}</div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-xs text-slate-500">Device</div>
            <div className="font-medium">{item.brand} {item.model}</div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="text-xs text-slate-500">Description</div>
            <div className="mt-2 text-slate-700">{item.problem}</div>
          </div>

          <div className="flex gap-3">
            <button className="rounded-xl bg-slate-100 px-4 py-2" onClick={() => router.back()}>Back</button>
            <button className="rounded-xl bg-indigo-600 px-4 py-2 text-white" onClick={markSoldable}>Mark Sellable</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
