import Link from 'next/link'
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
} from 'lucide-react'

import DashboardLayout from '../../../../components/DashboardLayout'

const serviceAreas = ['Koramangala', 'HSR Layout', 'Indiranagar', 'Jayanagar', 'Whitefield']

export default function AddCustomerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/seller/admin"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">Admin</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Create customer</h1>
            </div>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <Save className="h-4 w-4" />
            Save customer
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                  <UserPlus className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Customer profile</p>
                  <h2 className="text-xl font-bold text-slate-900">Basic information</h2>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified lead
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full name" placeholder="Asha Kulkarni" />
              <Field
                label="Phone number"
                placeholder="+91 98765 43210"
                icon={<Phone className="h-4 w-4" />}
              />
              <Field label="Email address" placeholder="asha@example.com" />
              <Field label="City" placeholder="Bengaluru" />
              <Field label="Local area" placeholder="Koramangala" className="md:col-span-2" />
              <Field label="Preferred service" placeholder="Mobile repair" className="md:col-span-2" />
              <Field label="Device brand" placeholder="Samsung" />
              <Field label="Device model" placeholder="Galaxy M32" />
              <Field label="Customer type" placeholder="Regular / New / VIP" />
              <Field label="Last visit" placeholder="12 Aug 2026" />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
              <textarea
                rows={5}
                placeholder="Customer needs quick battery replacement and screen inspection..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <h3 className="text-lg font-bold text-slate-900">Service area</h3>
                </div>
              </div>

              <div className="space-y-3">
                {serviceAreas.map((area) => (
                  <label
                    key={area}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
                  >
                    <span>{area}</span>
                    <input
                      type="checkbox"
                      defaultChecked={area === 'Koramangala'}
                      className="h-4 w-4 accent-violet-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Smartphone className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Device</p>
                  <h3 className="text-lg font-bold text-slate-900">Repair summary</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <SummaryCard title="Screen damage" value="Front glass replacement" />
                <SummaryCard title="Battery health" value="Needs service check" />
                <SummaryCard title="Preferred visit" value="Saturday, 11 AM - 2 PM" />
              </div>
            </div>

            <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-2 text-violet-600 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm text-violet-700">AI recommendation</p>
                  <h3 className="text-base font-bold text-slate-900">Offer screen + battery package</h3>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-3">
                <div>
                  <p className="text-xs text-slate-500">Suggested package</p>
                  <p className="text-lg font-black text-slate-900">₹2,499</p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Best value
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, placeholder, className = '', icon = null }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          type="text"
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100 ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  )
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 font-semibold text-slate-800">{value}</p>
    </div>
  )
}
