import { useEffect, useState } from 'react'
import DashboardLayout from '../../../../../../components/DashboardLayout'
import repairingService from '../../../../../../../services/repairingService'

export default function CustomerProblemsList() {
  const [items, setItems] = useState([])

  useEffect(() => {
    setItems(repairingService.getProblems())
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customer Repair Problems</h1>
            <p className="text-sm text-slate-500">List of problems submitted by local customers.</p>
          </div>

          <div>
            <a href="/seller/admin/repairing/customers/new" className="rounded-xl bg-indigo-600 px-4 py-2 text-white">+ Submit Problem</a>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          {items.length === 0 ? (
            <div className="p-6 text-slate-500">No repair problems submitted yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-semibold">{it.problem || '—'}</div>
                    <div className="text-xs text-slate-500">{it.customerName} • {it.customerPhone} • {it.brand} {it.model}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-600">{it.status}</div>
                    <a href={`/seller/admin/repairing/customers/${it.id}`} className="text-indigo-600">View</a>
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
