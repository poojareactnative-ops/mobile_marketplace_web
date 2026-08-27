import Link from 'next/link'
import { ArrowLeft, PlusCircle, Package, Pencil, Trash2, Tag } from 'lucide-react'

import DashboardLayout from '../../../components/DashboardLayout'

const accessories = [
  { name: 'USB-C Cable', category: 'Cable', price: '₹299', stock: '42', offer: '10% OFF' },
  { name: 'Tempered Glass', category: 'Protection', price: '₹199', stock: '18', offer: 'Buy 2 save 15%' },
  { name: 'Power Bank', category: 'Battery', price: '₹1,299', stock: '09', offer: 'Free shipping' },
  { name: 'Wireless Earbuds', category: 'Audio', price: '₹1,899', stock: '12', offer: 'New launch' },
]

export default function AdminProductsPage() {
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
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Accessories</h1>
            </div>
          </div>

          <Link href="/seller/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <PlusCircle className="h-4 w-4" />
            Add product
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat label="Products" value="412" tone="violet" />
          <MiniStat label="Low stock" value="18" tone="amber" />
          <MiniStat label="Offers" value="08" tone="emerald" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Offer</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {accessories.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{item.price}</td>
                    <td className="px-4 py-3 text-slate-600">{item.stock}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{item.offer}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-violet-200 hover:text-violet-700">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-rose-200 hover:text-rose-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <span className={`rounded-xl p-2 ${colors[tone]}`}><Tag className="h-4 w-4" /></span>
      </div>
    </div>
  )
}
