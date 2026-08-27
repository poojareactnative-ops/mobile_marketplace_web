import Link from 'next/link'
import { ArrowLeft, PlusCircle, Image, DollarSign, Boxes, Save } from 'lucide-react'

import DashboardLayout from '../../../../components/DashboardLayout'

export default function NewAdminProductPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/seller/admin/products" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-600">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Admin</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Add product</h1>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700">
            <Save className="h-4 w-4" />
            Save product
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Product name" placeholder="USB-C Fast Charger" />
              <Field label="Category" placeholder="Accessories" />
              <Field label="Brand" placeholder="Anker" />
              <Field label="SKU" placeholder="ACC-USBC-01" />
              <Field label="Price" placeholder="₹799" />
              <Field label="Selling price" placeholder="₹699" />
              <Field label="Stock" placeholder="45" />
              <Field label="Status" placeholder="In stock" />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                rows={5}
                placeholder="High-speed USB-C charging cable with braided finish and universal compatibility."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                  <Image className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Media</p>
                  <h3 className="text-lg font-bold text-slate-900">Product image</h3>
                </div>
              </div>

              <div className="flex min-h-[180px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                <div>
                  <Image className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-600">Upload product image</p>
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
                  <h3 className="text-lg font-bold text-slate-900">Offer summary</h3>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>Base price</span><span className="font-semibold">₹799</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"><span>Disc. offer</span><span className="font-semibold">10% OFF</span></div>
                <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-3 py-2 text-violet-700"><span>Final price</span><span className="font-bold">₹699</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
      />
    </div>
  )
}
