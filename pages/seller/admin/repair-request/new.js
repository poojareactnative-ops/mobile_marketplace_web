import { useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../../../components/DashboardLayout'

export default function NewRepairRequestPage() {
  const router = useRouter(); const [customer, setCustomer] = useState(''); const [issue, setIssue] = useState('')
  return <DashboardLayout><div className="mx-auto max-w-2xl"><h1 className="text-3xl font-black text-slate-900">New repair request</h1><form onSubmit={(e) => { e.preventDefault(); router.push('/admin/repairs') }} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><label className="block text-sm font-semibold text-slate-700">Customer name<input required value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><label className="mt-5 block text-sm font-semibold text-slate-700">Repair issue<textarea required value={issue} onChange={(e) => setIssue(e.target.value)} rows="4" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label><button className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white">Create request</button></form></div></DashboardLayout>
}
