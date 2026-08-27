import Link from 'next/link'
import { ArrowLeft, PlusCircle, Tag, Trash2, Pencil, Sparkles } from 'lucide-react'

import DashboardLayout from '../../../components/DashboardLayout'

const offers = [
  { title: 'Weekend Screen Care', type: 'Repair', discount: '20% OFF', status: 'Active', valid: 'Ends in 4 days' },
  { title: 'Accessory Combo', type: 'Product', discount: '15% OFF', status: 'Active', valid: 'Ends in 6 days' },
  { title: 'Local Pickup Offer', type: 'Service', discount: 'Free Inspection', status: 'Draft', valid: 'Review needed' },
]

export default function AdminOffersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller/admin" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Admin</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Offers</h1>
            </div>
          </div>

          <Link href="/seller/admin/offers/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4" />
            Create offer
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Active offers" value="03" tone="violet" />
          <MiniStat label="Drafts" value="02" tone="amber" />
          <MiniStat label="Total saved" value="₹18.4k" tone="emerald" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <div key={offer.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-700">{offer.type}</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">{offer.status}</span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{offer.title}</h3>
                  <p className="text-sm text-slate-500">{offer.valid}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Discount</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{offer.discount}</p>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-violet-200 hover:text-violet-700">
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function MiniStat({ label, value, tone }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <span className={`rounded-xl p-2 ${colors[tone]}`}><Sparkles className="h-4 w-4" /></span>
      </div>
    </div>
  )
}
