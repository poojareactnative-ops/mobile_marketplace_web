import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

export default function OrdersPage() {
  return (
    <DashboardLayout>
      

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
    </DashboardLayout>
  )
}
