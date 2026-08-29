import DashboardLayout from '../../components/DashboardLayout'

export default function SellerProfilePage() {
  return <DashboardLayout><div className="mx-auto max-w-3xl"><p className="text-sm font-semibold text-indigo-600">Seller account</p><h1 className="mt-1 text-3xl font-black text-slate-900">Shop profile</h1><div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white">PM</div><h2 className="mt-4 text-xl font-bold text-slate-900">Pooja Mobile</h2><dl className="mt-6 grid gap-4 sm:grid-cols-2"><Entry label="Owner" value="Pooja" /><Entry label="Phone" value="+91 90000 00000" /><Entry label="Status" value="Verified & active" /><Entry label="Category" value="Accessories & repairs" /></dl></div></div></DashboardLayout>
}
function Entry({ label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-2 font-semibold text-slate-800">{value}</dd></div> }
