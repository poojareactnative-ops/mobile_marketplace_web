import Link from 'next/link'
import {
  Package,
  ShoppingBag,
  Tag,
  MessageCircle,
  PlusCircle,
  Pencil,
  Trash2,
  TrendingUp,
} from 'lucide-react'

import DashboardLayout from '../../components/DashboardLayout'

const SAMPLE_PRODUCTS = [
  {
    id: 'p1',
    name: 'Tempered Glass',
    price: '₹199',
    stock: 42,
  },
  {
    id: 'p2',
    name: 'USB-C Cable (1m)',
    price: '₹299',
    stock: 12,
  },
  {
    id: 'p3',
    name: 'Wireless Earbuds',
    price: '₹1299',
    stock: 4,
  },
]

export default function SellerDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Seller Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, Pooja 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your shop, products, offers and customer enquiries.
            </p>
          </div>

          <Link
            href="/seller/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            title="Products"
            value={SAMPLE_PRODUCTS.length}
            description="Active products"
            icon={<Package className="h-5 w-5" />}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <DashboardCard
            title="Orders"
            value="12"
            description="+18% this month"
            icon={<ShoppingBag className="h-5 w-5" />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <DashboardCard
            title="Active Offers"
            value="3"
            description="Running offers"
            icon={<Tag className="h-5 w-5" />}
            iconClass="bg-rose-50 text-rose-600"
          />

          <DashboardCard
            title="New Enquiries"
            value="5"
            description="Need your response"
            icon={<MessageCircle className="h-5 w-5" />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Store Performance
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  ₹24,850
                </h2>

                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  12.5% increase this month
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Simple chart */}
            <div className="mt-6 flex h-32 items-end gap-2">
              {[35, 55, 42, 70, 58, 82, 68, 92, 76, 100, 88, 96].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-lg bg-indigo-100 transition hover:bg-indigo-500"
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
          </div>

          {/* Shop Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Shop Status
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Pooja Mobile
                </h2>
              </div>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <StatusRow
                label="Profile"
                value="Complete"
                success
              />

              <StatusRow
                label="Verification"
                value="Verified"
                success
              />

              <StatusRow
                label="Products"
                value={`${SAMPLE_PRODUCTS.length} listed`}
                success
              />

              <StatusRow
                label="Offers"
                value="3 active"
                success
              />
            </div>

            <Link
              href="/seller/profile"
              className="mt-6 block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Manage Shop
            </Link>
          </div>
        </div>

        {/* Products Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Products
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your mobile accessories and inventory.
            </p>
          </div>

          <Link
            href="/seller/products"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            View all products →
          </Link>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">

              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {SAMPLE_PRODUCTS.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-slate-50/70"
                  >

                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Package className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            ID: {product.id}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">
                        {product.price}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      <span
                        className={
                          product.stock <= 5
                            ? 'font-semibold text-red-600'
                            : product.stock <= 15
                              ? 'font-semibold text-amber-600'
                              : 'font-semibold text-slate-700'
                        }
                      >
                        {product.stock}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
                        units
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {product.stock <= 5 ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        <Link
                          href={`/seller/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Empty footer */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
            <Link
              href="/seller/products"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage all products →
            </Link>
          </div>

        </div>

      </div>
    </DashboardLayout>
  )
}

/* ================================================= */
/* DASHBOARD CARD */
/* ================================================= */

function DashboardCard({
  title,
  value,
  description,
  icon,
  iconClass,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 transition group-hover:scale-105 ${iconClass}`}
        >
          {icon}
        </div>

      </div>
    </div>
  )
}

/* ================================================= */
/* STATUS ROW */
/* ================================================= */

function StatusRow({
  label,
  value,
  success = false,
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={
          success
            ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600'
            : 'text-xs font-semibold text-slate-600'
        }
      >
        {value}
      </span>

    </div>
  )
}