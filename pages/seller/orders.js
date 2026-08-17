import Link from 'next/link'
import { ClipboardList } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders</h1>
          <Link href="/seller/dashboard" className="text-sm text-indigo-600">Back to dashboard</Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">Recent Orders</p>
              <p className="mt-1 text-xs text-slate-500">List of recent customer orders will appear here.</p>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500">(Mock data) No orders yet.</div>
        </div>
      </main>
    </div>
  )
}
