"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  ShoppingBag,
  Tag,
  MessageCircle,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Users,
  LayoutDashboard,
  Clock,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Phone,
  Store,
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import apiClient from '../../src/lib/api/client'
import useAuth from '../../src/features/auth/hooks/useAuth'

function formatPaise(paise) {
  if (paise == null) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function SellerDashboard() {
  const { user } = useAuth()
  const role = user?.role || 'SUPER_SELLER'
  const isSuperSeller = role === 'SUPER_SELLER' || role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN'
  const isStaff = role === 'SELLER_ADMIN'

  // Default active tab: staff starts on 'repairs', owner starts on 'overview'
  const [activeTab, setActiveTab] = useState(isStaff ? 'repairs' : 'overview')

  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sellerDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/seller/dashboard?period=30d')
      return res.data?.data || res.data
    },
    staleTime: 30000,
  })

  // Queries for role-specific tab content
  const { data: repairJobs = [], isLoading: isLoadingRepairs } = useQuery({
    queryKey: ['seller-dashboard-repairs'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/seller/admin/repair-jobs')
        return Array.isArray(res.data?.data) ? res.data.data : []
      } catch {
        const fallback = await apiClient.get('/seller/repair-jobs')
        return Array.isArray(fallback.data?.data) ? fallback.data.data : []
      }
    },
    enabled: activeTab === 'repairs',
  })

  const { data: localCustomers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['seller-dashboard-customers'],
    queryFn: async () => {
      const res = await apiClient.get('/seller/admin/customers')
      return Array.isArray(res.data?.data) ? res.data.data : []
    },
    enabled: activeTab === 'customers' && isStaff,
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

  // Configure tabs based on user role
  const availableTabs = isStaff
    ? [
        { id: 'repairs', label: 'Repair Queue', icon: Wrench, count: summary?.pendingRepairs },
        { id: 'customers', label: 'Walk-In Customers', icon: Users, count: localCustomers.length || undefined },
        { id: 'inventory', label: 'Products & Stock', icon: Package, count: summary?.activeProducts },
        { id: 'enquiries', label: 'Customer Leads', icon: MessageCircle, count: summary?.newEnquiries },
      ]
    : [
        { id: 'overview', label: 'Store Overview', icon: LayoutDashboard },
        { id: 'repairs', label: 'Repair Center', icon: Wrench, count: summary?.pendingRepairs },
        { id: 'inventory', label: 'Catalog & Stock', icon: Package, count: summary?.activeProducts },
        { id: 'enquiries', label: 'WhatsApp Leads', icon: MessageCircle, count: summary?.newEnquiries },
      ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Store className="h-3.5 w-3.5" />
              <span>
                {isSuperSeller
                  ? 'Super Seller Command Center'
                  : 'Store Staff & Technician Station'}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {user?.name || seller?.name || 'Partner'} 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {isSuperSeller
                ? 'Manage shop performance, product catalogue, team admins, and repair revenue.'
                : 'Manage walk-in customers, repair diagnostic tickets, and inventory updates.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/seller/admin/customers"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>Walk-in Customers</span>
            </Link>

            <Link
              href="/seller/repair-jobs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <Wrench className="h-4 w-4" />
              <span>Repair Tickets</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Role-Based Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
          {availableTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab 1: Overview (Only for Super Seller or when active) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
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
          </div>
        )}

        {/* Tab 2: Repair Queue / Repair Center */}
        {activeTab === 'repairs' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Live Repair Jobs</h2>
                <p className="text-xs text-slate-500">
                  Customer repair jobs submitted for diagnosis, quotation, and repair assembly.
                </p>
              </div>

              <Link
                href="/seller/repair-jobs"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>Full Repair Center</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {isLoadingRepairs ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                  <p className="mt-2 text-xs">Loading repair tickets...</p>
                </div>
              ) : repairJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Wrench className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-bold text-slate-700">No active repair tickets</p>
                  <p className="text-xs text-slate-400 mt-1">Walk-in repair jobs will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                      <tr>
                        <th className="px-5 py-3">Ticket ID</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Device & Problem</th>
                        <th className="px-5 py-3">Estimated Quote</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repairJobs.slice(0, 8).map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5 font-mono font-bold text-indigo-600">
                            #{job.referenceNumber || job.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{job.customerName}</p>
                            <p className="text-[11px] text-slate-400">{job.customerPhone}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-slate-800">
                              {job.brand} {job.model}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {job.problemDescription}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {formatPaise(job.estimatedCostPaise)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                job.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : job.status === 'IN_PROGRESS'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/seller/repair-jobs/${job.id}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                            >
                              <span>Manage</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Walk-In Customers (Staff only) */}
        {activeTab === 'customers' && isStaff && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Walk-In Customers</h2>
                <p className="text-xs text-slate-500">
                  Customers registered directly at your physical counter.
                </p>
              </div>

              <Link
                href="/seller/admin/customers"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>Full Directory</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {isLoadingCustomers ? (
                <div className="p-8 text-center text-slate-400">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                  <p className="mt-2 text-xs">Loading local customers...</p>
                </div>
              ) : localCustomers.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Users className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-bold text-slate-700">No walk-in customers logged yet</p>
                  <Link
                    href="/seller/admin/customers"
                    className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                  >
                    + Log Walk-in Customer
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-bold text-[11px]">
                      <tr>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Phone</th>
                        <th className="px-5 py-3">Orders</th>
                        <th className="px-5 py-3">Repairs</th>
                        <th className="px-5 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {localCustomers.slice(0, 8).map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5 font-bold text-slate-900">{c.name}</td>
                          <td className="px-5 py-3.5 font-mono text-slate-600">{c.phone}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700">
                            {c.totalOrdersCount ?? c.total_orders_count ?? 0}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700">
                            {c.totalRepairsCount ?? c.total_repairs_count ?? 0}
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 truncate max-w-xs">
                            {c.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Products & Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Inventory & Stock</h2>
                <p className="text-xs text-slate-500">Live products and available units.</p>
              </div>

              <Link
                href="/seller/products"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>Manage Products</span>
                <ArrowRight className="h-3.5 w-3.5" />
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
                        <tr key={product.id} className="transition hover:bg-slate-50/70">
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
                                product.stock <= 5 ? 'text-red-600 font-bold' : 'text-slate-700'
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
        )}

        {/* Tab 5: Customer Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Dynamic Customer Enquiries</h2>
                <p className="text-xs text-slate-500">
                  Real-time enquiries received for your promotional offers and catalog products.
                </p>
              </div>

              <Link
                href="/seller/enquiries"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>Manage all enquiries</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentEnquiries.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                  <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-bold text-slate-700">No enquiries received yet</p>
                  <p className="text-xs text-slate-400 mt-1">When buyers inquire about your running offers or products, they will arrive here dynamically.</p>
                </div>
              ) : (
                recentEnquiries.map((enq) => {
                  const rawMsg = enq.message || ''
                  const isOffer = rawMsg.includes('[Offer:')
                  let offerTitle = ''
                  let cleanMessage = rawMsg

                  if (isOffer) {
                    const match = rawMsg.match(/\[Offer:\s*([^\]]+)\]/)
                    if (match && match[1]) {
                      offerTitle = match[1].trim()
                      cleanMessage = rawMsg.replace(match[0], '').trim()
                    }
                  }

                  const productName = enq.product?.name || null
                  const phoneDigits = enq.customerPhone ? String(enq.customerPhone).replace(/\D/g, '').slice(-10) : ''
                  const whatsappPrefill = encodeURIComponent(
                    `Hi ${enq.customerName || 'there'}, thanks for inquiring about ${offerTitle ? `our offer "${offerTitle}"` : productName ? `our product "${productName}"` : 'our store'}. How can we assist you?`
                  )
                  const whatsappLink = phoneDigits ? `https://wa.me/91${phoneDigits}?text=${whatsappPrefill}` : null

                  return (
                    <div
                      key={enq.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-sm">{enq.customerName || 'Customer'}</span>
                          {isOffer ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-200">
                              <Tag className="h-2.5 w-2.5" />
                              Offer Enquiry
                            </span>
                          ) : productName ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                              <Package className="h-2.5 w-2.5" />
                              Product Enquiry
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              Store Enquiry
                            </span>
                          )}
                        </div>

                        {offerTitle && (
                          <div className="rounded-xl bg-violet-50/60 p-2 border border-violet-100/80">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Target Offer</p>
                            <p className="text-xs font-bold text-violet-950 truncate">{offerTitle}</p>
                          </div>
                        )}

                        {productName && !offerTitle && (
                          <div className="rounded-xl bg-blue-50/60 p-2 border border-blue-100/80">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Product</p>
                            <p className="text-xs font-bold text-blue-950 truncate">{productName}</p>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 italic line-clamp-3">"{cleanMessage}"</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {enq.customerPhone ? (
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {enq.customerPhone}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">No phone provided</span>
                        )}

                        <div className="flex items-center gap-1">
                          {whatsappLink && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              title="Chat with customer on WhatsApp"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {enq.customerPhone && (
                            <a
                              href={`tel:${enq.customerPhone}`}
                              title="Call customer directly"
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
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