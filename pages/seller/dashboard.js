"use client"

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  ShoppingBag,
  Tag,
  MessageCircle,
  PlusCircle,
  Pencil,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import apiClient from '../../src/lib/api/client'

function formatPaise(paise) {
  if (paise == null) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function SellerDashboard() {
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sellerDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/seller/dashboard?period=30d')
      return res.data.data
    },
    staleTime: 30000,
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading dashboard metrics...
          </p>
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !dashboardData) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <h2 className="text-lg font-bold text-rose-800">
            Unable to load dashboard
          </h2>
          <p className="mt-1 text-sm text-rose-600">
            Please make sure you are logged in with an active seller account.
          </p>
          <Link
            href="/seller/login"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md"
          >
            Go to Login
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const { seller, shop, summary, revenueSeries, recentProducts = [], recentEnquiries = [] } = dashboardData

  // Calculate chart max for normalized bar heights
  const maxRevenue = Math.max(...(revenueSeries?.map((s) => s.revenuePaise) || [1]), 1)

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
              Welcome back, {seller?.name || 'Pooja'} 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your shop, products, offers and customer enquiries.
            </p>
          </div>

          <Link
            href="/seller/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4" />
            Manage Products
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Products"
            value={summary?.activeProducts ?? 0}
            description="Active products listed"
            icon={<Package className="h-5 w-5" />}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <DashboardCard
            title="Orders"
            value={summary?.orders ?? 0}
            description="Total shop orders"
            icon={<ShoppingBag className="h-5 w-5" />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <DashboardCard
            title="Active Offers"
            value={summary?.activeOffers ?? 0}
            description="Running customer deals"
            icon={<Tag className="h-5 w-5" />}
            iconClass="bg-rose-50 text-rose-600"
          />

          <DashboardCard
            title="New Enquiries"
            value={summary?.newEnquiries ?? 0}
            description="Need your response"
            icon={<MessageCircle className="h-5 w-5" />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Quick Stats & Shop Status */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Revenue Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Store Performance (Past 30 Days)
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {formatPaise(summary?.revenuePaise)}
                </h2>

                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {summary?.revenueChangePercent ?? 12.5}% change this period
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            {/* Dynamic Revenue Bars */}
            <div className="mt-6 flex h-32 items-end gap-1.5 pt-4">
              {revenueSeries && revenueSeries.length > 0 ? (
                revenueSeries.map((item, index) => {
                  const heightPercent =
                    maxRevenue > 0
                      ? Math.max(8, Math.round((item.revenuePaise / maxRevenue) * 100))
                      : 8
                  return (
                    <div
                      key={index}
                      title={`${item.date}: ${formatPaise(item.revenuePaise)}`}
                      className="group relative flex-1 rounded-t-md bg-indigo-200 transition-all hover:bg-indigo-600"
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-10">
                        {formatPaise(item.revenuePaise)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-slate-400">No revenue data for this period.</p>
              )}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Shop Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Shop Status</p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {shop?.name || 'Your Shop'}
                </h2>
              </div>

              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  shop?.isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    shop?.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
                {shop?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <StatusRow
                label="Profile Completion"
                value={`${shop?.profileCompletionPercent || 100}%`}
                success
              />

              <StatusRow
                label="Verification"
                value={shop?.isVerified ? 'Verified' : 'Pending'}
                success={shop?.isVerified}
              />

              <StatusRow
                label="Active Products"
                value={`${summary?.activeProducts ?? 0} listed`}
                success
              />

              <StatusRow
                label="Low Stock Alert"
                value={
                  summary?.lowStockProducts > 0
                    ? `${summary.lowStockProducts} items`
                    : 'Healthy'
                }
                warning={summary?.lowStockProducts > 0}
                success={summary?.lowStockProducts === 0}
              />
            </div>

            <Link
              href="/seller/profile"
              className="mt-6 block w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Manage Shop Profile
            </Link>
          </div>
        </div>

        {/* Products Table & Recent Enquiries Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Products Header & Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Inventory
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Live inventory from your shop database.
                </p>
              </div>

              <Link
                href="/seller/products"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View all inventory →
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Product
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Price
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Stock
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          No products created yet.{' '}
                          <Link href="/seller/products" className="text-indigo-600 font-bold">
                            Add your first product
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      recentProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                                <Package className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 leading-tight">
                                  {product.name}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {product.brand || 'No brand'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 font-bold text-slate-900">
                            {formatPaise(product.pricePaise)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`font-semibold ${
                                product.stock <= 5
                                  ? 'text-red-600 font-bold'
                                  : 'text-slate-700'
                              }`}
                            >
                              {product.stock} units
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {product.stock <= 5 ? (
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                Low Stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Enquiries Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Customer Enquiries
              </h2>
              <Link
                href="/seller/enquiries"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                View all →
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              {recentEnquiries.length === 0 ? (
                <p className="p-6 text-center text-xs text-slate-400">
                  No enquiries received yet.
                </p>
              ) : (
                recentEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {enq.customerName}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          enq.status === 'NEW'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600 line-clamp-2">
                      "{enq.message}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function DashboardCard({ title, value, description, icon, iconClass }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
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

function StatusRow({ label, value, success = false, warning = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          warning
            ? 'bg-amber-50 text-amber-600'
            : success
            ? 'bg-emerald-50 text-emerald-600'
            : 'text-slate-600'
        }`}
      >
        {value}
      </span>
    </div>
  )
}