import Link from 'next/link'
import { Tag } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

export default function OffersPage() {
  return (
    <DashboardLayout>
      

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
            <Tag className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">Active Offers</p>
            <p className="mt-1 text-xs text-slate-500">Manage your shop offers and promotions here.</p>
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-500">(Mock data) No offers yet.</div>
      </div>
    </DashboardLayout>
  )
}
