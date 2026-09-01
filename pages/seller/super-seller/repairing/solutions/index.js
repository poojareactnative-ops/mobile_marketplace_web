import { useEffect, useState } from 'react'
import DashboardLayout from '../../../../../components/DashboardLayout'
import repairingService from '../../../../../services/repairingService'

export default function SuperSellerSolutions() {
  const [problems, setProblems] = useState([])

  useEffect(() => {
    // For demo, super seller can view all submitted problems to mark them
    setProblems(repairingService.getProblems())
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Repairing - Submitted Problems</h1>
            <p className="text-sm text-slate-500">Problems submitted by admins for review.</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
          {problems.length === 0 ? (
            <div className="p-6 text-slate-500">No problems submitted yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {problems.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-semibold">{p.problem}</div>
                    <div className="text-xs text-slate-500">{p.customerName} • {p.brand} {p.model}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-600">{p.status}</div>
                    <a href={`/seller/super-seller/repairing/solutions/${p.id}`} className="text-indigo-600">Review</a>
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
