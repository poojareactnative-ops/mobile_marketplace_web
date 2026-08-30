import DashboardLayout from "../../components/DashboardLayout"

const repairs = [['Saurabh T.', 'Screen cracked', 'In progress'], ['Kavita M.', 'Battery drain', 'Waiting for parts'], ['Rahul S.', 'Charging port issue', 'Ready']]

export default function RepairsPage() {
  return <DashboardLayout><div><h1 className="text-3xl font-black text-slate-900">Repair requests</h1><p className="mt-1 text-sm text-slate-500">Manage incoming device repair jobs.</p><ul className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">{repairs.map(([customer, issue, status]) => <li key={customer} className="flex items-center justify-between p-5"><div><p className="font-bold text-slate-800">{customer}</p><p className="text-sm text-slate-500">{issue}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{status}</span></li>)}</ul></div></DashboardLayout>
}
