import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import DashboardLayout from '../../components/DashboardLayout'
import { ShoppingBag, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

function formatINR(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function MobileAccessories() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['seller-accessory-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/seller/orders')
      return res.data?.data || []
    },
  })

  const orders = ordersData || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <ShoppingBag className="h-4 w-4" />
            Store Orders
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Mobile Accessories Orders</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customer orders for mobile accessories, cables, chargers, and cases from your store.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-base font-bold text-slate-900">No accessory orders yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              When customers purchase items from your storefront, they will be listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-100">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-3 hover:bg-slate-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">ORDER #{o.id.slice(0, 8)}</span>
                      <span className="font-bold text-slate-900">{formatINR(o.totalPaise)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Customer: <span className="font-semibold text-slate-700">{o.customerUser?.name || 'Walk-in Customer'}</span> • Placed: {new Date(o.placedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>

                  <span
                    className={`self-start sm:self-auto rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      o.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : o.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
