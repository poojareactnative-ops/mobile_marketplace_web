"use client"

import Link from 'next/link'
import { ShoppingBag, ClipboardList, Tag, MessageCircle } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-auto px-1">
      <nav className="space-y-3">
        <Link href="/seller/dashboard" className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-medium shadow-sm">
          <ShoppingBag className="h-4 w-4 text-indigo-600" />
          <span>Products</span>
        </Link>

        <Link href="/seller/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white/60">
          <ClipboardList className="h-4 w-4 text-slate-600" />
          <span>Orders</span>
        </Link>

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
