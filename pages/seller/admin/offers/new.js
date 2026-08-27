import Link from 'next/link'
import { ArrowLeft, PlusCircle, Tag, CalendarRange, Save } from 'lucide-react'

import DashboardLayout from '../../../../components/DashboardLayout'

export default function NewAdminOfferPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/seller/admin/offers" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Admin</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Create offer</h1>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <Save className="h-4 w-4" />
            Save offer
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Offer title" placeholder="Weekend Screen Care" />
              <Field label="Offer type" placeholder="Repair / Product / Service" />
              <Field label="Discount" placeholder="20% OFF" />
              <Field label="Status" placeholder="Active" />
              <Field label="Valid from" placeholder="25 Aug 2026" className="md:col-span-1" />
              <Field label="Valid to" placeholder="30 Aug 2026" className="md:col-span-1" />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Offer details</label>
              <textarea
                rows={5}
                placeholder="Offer applies to screen replacement and battery service for local customers during the weekend campaign."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Campaign</p>
                <h3 className="text-lg font-bold text-slate-900">Offer preview</h3>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]">Repair offer</span>
                <Tag className="h-4 w-4" />
              </div>
              <h4 className="mt-4 text-2xl font-black">20% OFF</h4>
              <p className="mt-2 text-sm text-violet-100">Weekend Screen Care for local customers</p>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>Start</span><span className="font-semibold">25 Aug</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>End</span><span className="font-semibold">30 Aug</span></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>Applies to</span><span className="font-semibold">Screen repairs</span></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
      />
    </div>
  )
}
