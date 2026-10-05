"use client"

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../components/DashboardLayout'
import apiClient from '../../src/lib/api/client'
import {
  Wrench,
  Loader2,
  Search,
  Plus,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Smartphone,
  RefreshCw,
  SlidersHorizontal,
  X,
  IndianRupee,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

function formatPaise(paise) {
  if (paise == null || isNaN(paise)) return null
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

function formatDate(dateString) {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

function getCleanPhone(phone) {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '').slice(-10)
}

const STATUS_MAP = {
  SUBMITTED: {
    label: 'Submitted',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badge: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20',
    dot: 'bg-orange-500',
    icon: AlertTriangle,
  },
  QUOTED: {
    label: 'Quoted',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
    dot: 'bg-purple-500',
    icon: IndianRupee,
  },
  APPROVED: {
    label: 'Approved',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
    dot: 'bg-indigo-500',
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    dot: 'bg-blue-500 animate-pulse',
    icon: Wrench,
  },
  READY: {
    label: 'Ready for Pickup',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-500/20',
    dot: 'bg-cyan-500',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20',
    dot: 'bg-slate-400',
    icon: X,
  },
  NOT_REPAIRABLE: {
    label: 'Not Repairable',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    dot: 'bg-rose-500',
    icon: AlertCircle,
  },
}

export default function MobileRepairingOrders({ hideLayout = false }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Filters & State
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'

  const fetchJobs = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      // First attempt admin repair jobs endpoint, fall back to seller repair jobs
      let list = []
      try {
        const res = await apiClient.get('/seller/admin/repair-jobs')
        list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
      } catch {
        const fallback = await apiClient.get('/seller/repair-jobs')
        list = Array.isArray(fallback.data?.data) ? fallback.data.data : Array.isArray(fallback.data) ? fallback.data : []
      }
      setJobs(list)
    } catch (err) {
      console.error('Error fetching repair jobs:', err)
      setError('Unable to load repair tickets. Please check your network and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    const total = jobs.length
    const review = jobs.filter((j) => ['SUBMITTED', 'UNDER_REVIEW', 'QUOTED'].includes(j.status)).length
    const active = jobs.filter((j) => ['APPROVED', 'IN_PROGRESS'].includes(j.status)).length
    const readyOrDone = jobs.filter((j) => ['READY', 'COMPLETED'].includes(j.status)).length
    const totalRevenuePaise = jobs
      .filter((j) => j.status !== 'CANCELLED' && j.status !== 'NOT_REPAIRABLE')
      .reduce((sum, j) => sum + (j.finalCostPaise || j.estimatedCostPaise || 0), 0)

    return { total, review, active, readyOrDone, totalRevenuePaise }
  }, [jobs])

  // Filter & Search Logic
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Tab Status Filter
        if (activeTab === 'REVIEW') {
          if (!['SUBMITTED', 'UNDER_REVIEW', 'QUOTED'].includes(job.status)) return false
        } else if (activeTab === 'ACTIVE') {
          if (!['APPROVED', 'IN_PROGRESS'].includes(job.status)) return false
        } else if (activeTab === 'READY') {
          if (job.status !== 'READY') return false
        } else if (activeTab === 'COMPLETED') {
          if (job.status !== 'COMPLETED') return false
        } else if (activeTab === 'CANCELLED') {
          if (!['CANCELLED', 'NOT_REPAIRABLE'].includes(job.status)) return false
        }

        // Text Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const name = (job.customerName || job.customer || '').toLowerCase()
          const phone = (job.customerPhone || job.phone || '').toLowerCase()
          const brand = (job.brand || '').toLowerCase()
          const model = (job.model || '').toLowerCase()
          const issue = (job.problemDescription || job.service || '').toLowerCase()
          const id = (job.id || job.ticketId || '').toLowerCase()

          return (
            name.includes(q) ||
            phone.includes(q) ||
            brand.includes(q) ||
            model.includes(q) ||
            issue.includes(q) ||
            id.includes(q)
          )
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        } else if (sortBy === 'OLDEST') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        } else if (sortBy === 'COST_HIGH') {
          const costA = a.finalCostPaise || a.estimatedCostPaise || 0
          const costB = b.finalCostPaise || b.estimatedCostPaise || 0
          return costB - costA
        } else if (sortBy === 'COST_LOW') {
          const costA = a.finalCostPaise || a.estimatedCostPaise || 0
          const costB = b.finalCostPaise || b.estimatedCostPaise || 0
          return costA - costB
        }
        return 0
      })
  }, [jobs, activeTab, searchQuery, sortBy])

  const content = (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            Repair Center & Diagnostics
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Mobile Repair Jobs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track customer devices, diagnostic assessments, quotes, and repair milestones in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing || loading}
            title="Refresh list"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <Link
            href="/seller/admin/repairing/customers/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg hover:shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            <span>Create Repair Job</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Total Jobs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Jobs
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">All registered tickets</p>
        </div>

        {/* Needs Review / Diagnostic */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white p-4 shadow-sm transition hover:border-amber-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Under Review
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.review}</p>
          <p className="mt-0.5 text-[11px] text-amber-700/80">Pending estimate or check</p>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white p-4 shadow-sm transition hover:border-blue-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              In Progress
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Wrench className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-blue-900">{stats.active}</p>
          <p className="mt-0.5 text-[11px] text-blue-700/80">Currently on workbench</p>
        </div>

        {/* Ready / Completed */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white p-4 shadow-sm transition hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Completed / Ready
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-900">{stats.readyOrDone}</p>
          <p className="mt-0.5 text-[11px] text-emerald-700/80">Ready or customer picked</p>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="border-b border-slate-100 p-4 sm:p-5 space-y-4">
          {/* Top Row: Search & Controls */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer, phone, device, problem, ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort & View Mode */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-600">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="COST_HIGH">Highest Estimate</option>
                  <option value="COST_LOW">Lowest Estimate</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-50/70 p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  title="Card view"
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                    viewMode === 'cards'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table view"
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'ALL', label: 'All Jobs', count: jobs.length },
              { id: 'REVIEW', label: 'Under Review', count: stats.review },
              { id: 'ACTIVE', label: 'In Progress', count: stats.active },
              { id: 'READY', label: 'Ready for Pickup', count: jobs.filter((j) => j.status === 'READY').length },
              { id: 'COMPLETED', label: 'Completed', count: jobs.filter((j) => j.status === 'COMPLETED').length },
              { id: 'CANCELLED', label: 'Cancelled', count: jobs.filter((j) => ['CANCELLED', 'NOT_REPAIRABLE'].includes(j.status)).length },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Section: Loading, Error, Empty, Cards, or Table */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-200" />
                  </div>
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-10 w-full rounded bg-slate-200" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-8 w-24 rounded-lg bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
              <h3 className="mt-3 text-base font-bold text-rose-900">Failed to load repair jobs</h3>
              <p className="mt-1 text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => fetchJobs()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Wrench className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {jobs.length === 0
                  ? 'No repair jobs registered yet'
                  : 'No repair jobs match your filter'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {jobs.length === 0
                  ? 'Start by creating your first customer device repair ticket. You can track status, provide estimates, and message the customer.'
                  : 'Try clearing your search terms or selecting a different status filter tab above.'}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                {jobs.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab('ALL')
                      setSearchQuery('')
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/seller/admin/repairing/customers/new"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  + Create Repair Job
                </Link>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Ticket / Date</th>
                    <th className="px-4 py-3">Device & Problem</th>
                    <th className="px-4 py-3">Customer Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Estimate / Final</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {filteredJobs.map((job) => {
                    const statusObj = STATUS_MAP[job.status] || {
                      label: job.status,
                      badge: 'bg-slate-100 text-slate-700 border-slate-200',
                      dot: 'bg-slate-400',
                      icon: Clock,
                    }
                    const StatusIcon = statusObj.icon
                    const cleanPhone = getCleanPhone(job.customerPhone || job.phone)
                    const costFormatted = formatPaise(job.finalCostPaise || job.estimatedCostPaise)

                    return (
                      <tr key={job.id} className="hover:bg-slate-50/70 transition">
                        {/* Ticket & Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900">
                            #{String(job.ticketId || job.id).slice(0, 8).toUpperCase()}
                          </span>
                          <div className="mt-0.5 text-[11px] text-slate-400">
                            {formatDate(job.createdAt)}
                          </div>
                        </td>

                        {/* Device & Problem */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Smartphone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>
                              {job.brand || job.model ? `${job.brand || ''} ${job.model || ''}`.trim() : 'Device Repair'}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-slate-500" title={job.problemDescription || job.service}>
                            {job.problemDescription || job.service || 'Diagnostic Inspection'}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {job.customerName || job.customer || 'Walk-in Customer'}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">{job.customerPhone || job.phone || '—'}</span>
                            {cleanPhone && (
                              <div className="flex items-center gap-1">
                                <a
                                  href={`tel:${cleanPhone}`}
                                  title="Call Customer"
                                  className="rounded-md bg-slate-100 p-1 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                >
                                  <Phone className="h-3 w-3" />
                                </a>
                                <a
                                  href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                    `Hello ${job.customerName || 'Customer'}, regarding your repair ticket for ${job.brand || ''} ${job.model || ''}...`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp Customer"
                                  className="rounded-md bg-emerald-50 p-1 text-emerald-600 hover:bg-emerald-100 transition"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusObj.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
                            {statusObj.label}
                          </span>
                        </td>

                        {/* Cost */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                          {costFormatted ? (
                            <span className="text-emerald-700 font-bold">{costFormatted}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">Pending Quote</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/seller/repair-jobs/${job.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-sm"
                          >
                            <span>Manage</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => {
                const statusObj = STATUS_MAP[job.status] || {
                  label: job.status,
                  badge: 'bg-slate-100 text-slate-700 border-slate-200',
                  dot: 'bg-slate-400',
                  icon: Clock,
                }
                const StatusIcon = statusObj.icon
                const cleanPhone = getCleanPhone(job.customerPhone || job.phone)
                const costFormatted = formatPaise(job.finalCostPaise || job.estimatedCostPaise)

                return (
                  <div
                    key={job.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                            #{String(job.ticketId || job.id).slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusObj.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
                          {statusObj.label}
                        </span>
                      </div>

                      {/* Device & Problem info */}
                      <div className="mt-3.5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <span className="truncate">
                            {job.brand || job.model
                              ? `${job.brand || ''} ${job.model || ''}`.trim()
                              : 'Diagnostic Device'}
                          </span>
                        </div>

                        <div className="mt-2 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Reported Issue
                          </p>
                          <p className="mt-0.5 text-xs text-slate-700 line-clamp-2 leading-relaxed">
                            {job.problemDescription || job.service || 'Standard diagnostics & inspection requested.'}
                          </p>
                        </div>
                      </div>

                      {/* Customer Row */}
                      <div className="mt-3.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Customer
                          </p>
                          <p className="font-bold text-slate-900 truncate">
                            {job.customerName || job.customer || 'Walk-in Customer'}
                          </p>
                          <p className="text-[11px] text-slate-500">{job.customerPhone || job.phone || 'No phone'}</p>
                        </div>

                        {cleanPhone && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${cleanPhone}`}
                              title="Call Customer"
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                                `Hello ${job.customerName || 'Customer'}, regarding your repair ticket for ${job.brand || ''} ${job.model || ''}...`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp Message"
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer of Card */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">
                          {job.finalCostPaise ? 'Final Cost' : 'Estimated Cost'}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          {costFormatted || <span className="text-slate-400 text-xs font-normal">Pending Quote</span>}
                        </span>
                      </div>

                      <Link
                        href={`/seller/repair-jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-sm"
                      >
                        <span>Manage</span>
                        <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (hideLayout) {
    return content
  }

  return <DashboardLayout>{content}</DashboardLayout>
}
