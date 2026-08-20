"use client"

import Link from 'next/link'
import DashboardLayout from '../../components/DashboardLayout'
import { ShoppingBag, Wrench } from 'lucide-react'

export default function OrdersIndex() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">View orders by category.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/seller/orders/mobile-accessories" className="flex items-center gap-3 rounded-2xl border p-4 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Mobile Accessories</h3>
              <p className="mt-1 text-xs text-slate-500">Orders for accessories and spare parts.</p>
            </div>
          </Link>

          <Link href="/seller/orders/mobile-repairing" className="flex items-center gap-3 rounded-2xl border p-4 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Wrench className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Mobile Repairing</h3>
              <p className="mt-1 text-xs text-slate-500">Service and repair job orders.</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}