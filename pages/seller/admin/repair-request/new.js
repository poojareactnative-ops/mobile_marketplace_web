import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardList,
  Wrench,
  Smartphone,
  DollarSign,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Save,
} from 'lucide-react'

import DashboardLayout from '../../../../components/DashboardLayout'

export default function NewRepairRequestPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/seller/admin" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Admin</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">New mobile repair request</h1>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <Save className="h-4 w-4" />
            Save request
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Repair ticket</p>
                <h2 className="text-xl font-bold text-slate-900">Customer request details</h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Customer name" placeholder="Rohit Kumar" />
              <Field label="Phone number" placeholder="+91 98210 55443" />
              <Field label="City" placeholder="Pune" />
              <Field label="Local area" placeholder="Kharadi" />
              <Field label="Device brand" placeholder="OnePlus" />
              <Field label="Device model" placeholder="OnePlus 9R" />
              <Field label="Repair type" placeholder="Screen repair" />
              <Field label="Request status" placeholder="New / In progress / Awaiting parts" />
              <Field label="Preferred date" placeholder="28 Aug 2026" className="md:col-span-2" />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Customer problem</label>
                <textarea
                  rows={4}
                  placeholder="Front glass shattered, touchscreen partially unresponsive after dropping device."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Service notes</label>
                <textarea
                  rows={4}
                  placeholder="Customer reported device was dropped 2 days ago. Wants urgent repair and quote before approval."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Problem summary</p>
                  <h3 className="text-lg font-bold text-slate-900">Repair diagnosis</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800">Primary issue</p>
                  <p className="mt-1">Cracked display + touch not working</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800">Repair urgency</p>
                  <p className="mt-1">High priority</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-800">Diagnostics</p>
                  <p className="mt-1">Need AMOLED display replacement and touch calibration</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pricing</p>
                  <h3 className="text-lg font-bold text-slate-900">Cost estimate</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span>Parts cost</span>
                  <span className="font-semibold">₹1,850</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span>Service fee</span>
                  <span className="font-semibold">₹350</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-3 py-2 text-sm text-violet-700">
                  <span>Total estimate</span>
                  <span className="font-bold">₹2,200</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Booking</p>
                  <h3 className="text-lg font-bold text-slate-900">Follow-up</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Booking confirmed for 28 Aug</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-600" />
                  <span>Service area: Kharadi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-violet-600" />
                  <span>Pickup service available</span>
                </div>
              </div>
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
