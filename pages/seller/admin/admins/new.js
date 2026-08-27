import Link from 'next/link'
import { ArrowLeft, UserPlus, Mail, MapPin, ShieldCheck, Save } from 'lucide-react'

import DashboardLayout from '../../../../components/DashboardLayout'

export default function NewAdminAccountPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/seller/admin/admins" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Super Seller</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Create admin</h1>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <Save className="h-4 w-4" />
            Save admin
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Admin account</p>
                <h2 className="text-xl font-bold text-slate-900">Profile details</h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full name" placeholder="Riya Sharma" />
              <Field label="Phone" placeholder="+91 98765 43210" />
              <Field label="Email" placeholder="riya@example.com" />
              <Field label="Role" placeholder="Regional Admin" />
              <Field label="Assigned city" placeholder="Bengaluru" className="md:col-span-2" />
              <Field label="Assigned local areas" placeholder="Koramangala, HSR Layout, Indiranagar" className="md:col-span-2" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Permissions</p>
                <h3 className="text-lg font-bold text-slate-900">Access rights</h3>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <PermissionRow label="Manage customers" checked />
              <PermissionRow label="Create repair requests" checked />
              <PermissionRow label="Manage products" checked />
              <PermissionRow label="Manage offers" checked />
              <PermissionRow label="View enquiries" checked />
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

function PermissionRow({ label, checked }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={checked} className="h-4 w-4 accent-violet-600" />
    </label>
  )
}
