import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

export default function EnquiriesPage() {
  return (
    <DashboardLayout>
     

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold">Customer Enquiries</p>
            <p className="mt-1 text-xs text-slate-500">View and respond to customer enquiries.</p>
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-500">(Mock data) No enquiries yet.</div>
      </div>
    </DashboardLayout>
  )
}
