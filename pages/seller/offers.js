import Link from 'next/link'
import { Tag } from 'lucide-react'

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Offers</h1>
          <Link href="/seller/dashboard" className="text-sm text-indigo-600">Back to dashboard</Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <Tag className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">Active Offers</p>
              <p className="mt-1 text-xs text-slate-500">Manage your shop offers and promotions here.</p>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500">(Mock data) No offers yet.</div>
        </div>
      </main>
    </div>
  )
}
