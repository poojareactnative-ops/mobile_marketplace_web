import { CheckCircle2 } from 'lucide-react'
import DetailRow from '../DetailRow'

export default function SellerSuccessView({ form, onRegisterAnother, onLogin }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900">Registration Submitted!</h1>
        <p className="mt-3 leading-6 text-slate-500">
          Your Super Seller registration has been successfully submitted. Our team will review your
          shop details shortly.
        </p>

        <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Shop Details
          </p>
          <div className="mt-4 space-y-3 text-sm">
            <DetailRow label="Shop" value={form.name} />
            <DetailRow label="Phone" value={form.phone} />
            <DetailRow label="Address" value={form.address} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onRegisterAnother}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            Register Another Shop
          </button>
          <button
            onClick={onLogin}
            className="rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Seller Login
          </button>
        </div>
      </div>
    </div>
  )
}
