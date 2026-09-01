"use client"

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, ClipboardList, Tag, MessageCircle, ChevronDown } from 'lucide-react'

export default function Sidebar() {
  const [ordersOpen, setOrdersOpen] = useState(true)

  return (
    <aside className="sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-auto px-1">
      <nav className="space-y-3">
        <Link href="/seller/dashboard" className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-medium shadow-sm">
          <ShoppingBag className="h-4 w-4 text-indigo-600" />
          <span>Products</span>
        </Link>

        <div className="rounded-lg px-3 py-2">
          <button onClick={() => setOrdersOpen((s) => !s)} className="flex w-full items-center justify-between gap-3 text-sm text-slate-700 hover:bg-white/60">
            <span className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-slate-600" />
              <span>Orders</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${ordersOpen ? 'rotate-180' : ''}`} />
          </button>

          {ordersOpen && (
            <nav className="mt-2 space-y-1 pl-8">
              <Link href="/seller/mobile-accessories" className="block rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">Mobile Accessories</Link>
              <Link href="/seller/mobile-repairing" className="block rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">Mobile Repairing</Link>
              <Link href="/seller/admin/repairing/customers" className="block rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">Admin: Repair Problems</Link>
              <Link href="/seller/super-seller/repairing/solutions" className="block rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">Super Seller: Review</Link>
            </nav>
          )}
        </div>

        <Link href="/seller/offers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white/60">
          <Tag className="h-4 w-4 text-slate-600" />
          <span>Offers</span>
        </Link>

        <Link href="/seller/enquiries" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white/60">
          <MessageCircle className="h-4 w-4 text-slate-600" />
          <span>Enquiries</span>
        </Link>
      </nav>
    </aside>
  )
}
