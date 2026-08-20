"use client"

import DashboardLayout from '../../../components/DashboardLayout'

const SAMPLE_ORDERS = [
  { id: 'a1', name: 'Screen Protector x2', customer: 'Asha', phone: '9876543210', status: 'Pending' },
  { id: 'a2', name: 'USB-C Cable', customer: 'Ravi', phone: '9123456780', status: 'Shipped' },
]

export default function MobileAccessoriesOrders() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mobile Accessories Orders</h1>
          <p className="mt-1 text-sm text-slate-500">List of accessory orders placed by customers.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white p-4">
          <ul className="divide-y divide-slate-100">
            {SAMPLE_ORDERS.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-3 py-4">
                <div>
                  <div className="font-semibold text-slate-900">{o.name}</div>
                  <div className="text-xs text-slate-500">{o.customer} • {o.phone}</div>
                </div>

                <div className="text-sm text-slate-600">{o.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  )
}
