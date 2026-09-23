import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import DashboardLayout from '../../components/DashboardLayout'
import {
  Users,
  Wrench,
  Package,
  Store,
  CheckCircle2,
  XCircle,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Clock,
  PhoneCall,
} from 'lucide-react'

function formatINR(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function AdminDashboardPage() {
  const queryClient = useQueryClient()

  // 1. Platform Overview Stats
  const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/overview')
      return res.data?.data
    },
  })

  // 2. All Shops with Verification status
  const { data: shopsData, isLoading: isShopsLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/shops')
      return res.data?.data || []
    },
  })

  // Toggle Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ shopId, isVerified }) => {
      return apiClient.patch(`/admin/shops/${shopId}/verify`, { isVerified })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
  })

  const metrics = overviewData?.metrics || {
    totalGmvPaise: 0,
    totalShops: 0,
    verifiedShops: 0,
    totalProducts: 0,
    totalRepairs: 0,
    pendingRepairs: 0,
    totalUsers: 0,
  }

  const shops = shopsData || []
  const recentRepairs = overviewData?.recentRepairs || []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
              <ShieldCheck className="h-4 w-4" />
              Platform Administrator Portal
            </div>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Marketplace Operations & Governance</h1>
            <p className="mt-1 text-sm text-slate-500">
              Platform-wide metrics, shop onboarding, verification, and live repair diagnostics.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/admins/new"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
            >
              <PlusCircle className="h-4 w-4" />
              New Admin User
            </Link>
            <Link
              href="/admin/repairs"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition hover:from-violet-700 hover:to-indigo-700"
            >
              <Wrench className="h-4 w-4" />
              View All Repair Jobs
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Platform GMV</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-black text-slate-900">{formatINR(metrics.totalGmvPaise)}</p>
            <p className="mt-1 text-xs text-slate-500">From all completed accessory orders</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Shops</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Store className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-black text-slate-900">
              {metrics.totalShops} <span className="text-sm font-semibold text-emerald-600">({metrics.verifiedShops} verified)</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Active retail and repair storefronts</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Repair Jobs</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Wrench className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-black text-slate-900">
              {metrics.totalRepairs} <span className="text-sm font-semibold text-amber-600">({metrics.pendingRepairs} pending)</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">System-wide customer repair tickets</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Inventory</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Package className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-black text-slate-900">{metrics.totalProducts} items</p>
            <p className="mt-1 text-xs text-slate-500">Across {metrics.totalUsers} registered users</p>
          </div>
        </div>

        {/* Shop Governance Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Store Verification & Onboarding</h2>
              <p className="text-xs text-slate-500">Review and toggle official verification badges for storefronts.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {shops.length} Stores Listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Shop Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Owner Contact</th>
                  <th className="px-6 py-4">Catalog / Repairs</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.address || 'Bangalore'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        {s.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">{s.ownerUser?.name}</div>
                      <div className="text-xs text-slate-400">{s.ownerUser?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {s._count?.products || 0} products • {s._count?.repairJobs || 0} repairs
                    </td>
                    <td className="px-6 py-4">
                      {s.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => verifyMutation.mutate({ shopId: s.id, isVerified: !s.isVerified })}
                        disabled={verifyMutation.isLoading}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                          s.isVerified
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                        }`}
                      >
                        {s.isVerified ? 'Revoke Verification' : 'Verify Store'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Repair Queue */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Latest Repair Requests Across Network</h2>
              <p className="text-xs text-slate-500">Live feed of device repairs registered at all participating centers.</p>
            </div>
            <Link href="/admin/repairs" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View all repairs →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRepairs.map((r) => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-2">
                <div>
                  <div className="font-bold text-slate-900">{r.customerName || 'Customer'} • {r.brand} {r.model}</div>
                  <div className="text-xs text-slate-500">Store: <span className="font-semibold text-slate-700">{r.shop?.name}</span> • Issue: {r.problemDescription}</div>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
