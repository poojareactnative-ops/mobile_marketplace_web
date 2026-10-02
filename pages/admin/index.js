import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldAlert,
  Users,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  Search,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  BadgeCheck,
  AlertTriangle,
  Plus,
  RefreshCw,
  Loader2,
  ChevronRight,
  BarChart3,
  X,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../src/features/auth/hooks/useAuth'
import superAdminService from '../../src/lib/api/superAdmin.service'

function formatPaise(paise) {
  if (paise == null) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Active Tab: 'requests' | 'analytics' | 'plans'
  const [activeTab, setActiveTab] = useState('requests')

  // Requests Filters
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [billingFilter, setBillingFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Analytics Period
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d')

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false)

  // Approval Form State
  const [approveForm, setApproveForm] = useState({
    grantVerificationBadge: true,
    planTier: 'STARTER',
    billingStatus: 'MANUALLY_VERIFIED',
    adminNotes: '',
  })

  // Rejection Form State
  const [rejectForm, setRejectForm] = useState({
    rejectionReason: '',
  })

  // Create Plan Form State
  const [newPlanForm, setNewPlanForm] = useState({
    code: '',
    name: '',
    priceRupees: 999,
    durationDays: 30,
    maxProducts: 200,
    maxAdmins: 3,
    priorityNearbyRanking: true,
    whatsappLeadAnalytics: true,
    verifiedBadgeIncluded: true,
  })

  // Toast / feedback message
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (router.query.tab === 'analytics') setActiveTab('analytics')
    if (router.query.tab === 'plans') setActiveTab('plans')
    if (router.query.tab === 'requests') setActiveTab('requests')
  }, [router.query])

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  // 1. Fetch Onboarding Requests
  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    isRefetching: isRequestsRefetching,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['superAdminRequests', statusFilter, billingFilter],
    queryFn: () =>
      superAdminService.getRequests({
        status: statusFilter || undefined,
        billingStatus: billingFilter || undefined,
      }),
    staleTime: 10000,
  })

  // 2. Fetch Analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['superAdminAnalytics', analyticsPeriod],
    queryFn: () => superAdminService.getAnalytics(analyticsPeriod),
    staleTime: 30000,
    enabled: activeTab === 'analytics',
  })

  // 3. Fetch Plans
  const {
    data: plansData = [],
    isLoading: isPlansLoading,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['superAdminPlans'],
    queryFn: () => superAdminService.getPlans(),
    staleTime: 30000,
    enabled: activeTab === 'plans',
  })

  // Mutation: Approve Super Seller Request
  const approveMutation = useMutation({
    mutationFn: ({ requestId, payload }) =>
      superAdminService.approveRequest(requestId, payload),
    onSuccess: () => {
      showFeedback('success', 'Super Seller request approved! Shop activated and badge granted.')
      setIsApproveModalOpen(false)
      setSelectedRequest(null)
      queryClient.invalidateQueries({ queryKey: ['superAdminRequests'] })
      queryClient.invalidateQueries({ queryKey: ['superAdminAnalytics'] })
    },
    onError: (err) => {
      showFeedback(
        'error',
        err.response?.data?.message || 'Failed to approve request. Please try again.'
      )
    },
  })

  // Mutation: Reject Super Seller Request
  const rejectMutation = useMutation({
    mutationFn: ({ requestId, payload }) =>
      superAdminService.rejectRequest(requestId, payload),
    onSuccess: () => {
      showFeedback('success', 'Request rejected successfully.')
      setIsRejectModalOpen(false)
      setSelectedRequest(null)
      queryClient.invalidateQueries({ queryKey: ['superAdminRequests'] })
    },
    onError: (err) => {
      showFeedback(
        'error',
        err.response?.data?.message || 'Failed to reject request. Please try again.'
      )
    },
  })

  // Mutation: Create Subscription Plan
  const createPlanMutation = useMutation({
    mutationFn: (payload) => superAdminService.createPlan(payload),
    onSuccess: () => {
      showFeedback('success', 'Subscription plan created successfully!')
      setIsCreatePlanModalOpen(false)
      setNewPlanForm({
        code: '',
        name: '',
        priceRupees: 999,
        durationDays: 30,
        maxProducts: 200,
        maxAdmins: 3,
        priorityNearbyRanking: true,
        whatsappLeadAnalytics: true,
        verifiedBadgeIncluded: true,
      })
      refetchPlans()
    },
    onError: (err) => {
      showFeedback(
        'error',
        err.response?.data?.message || 'Failed to create plan. Check plan code uniqueness.'
      )
    },
  })

  const requests = requestsData?.data || []
  const meta = requestsData?.meta || {
    totalPending: requests.filter((r) => r.status === 'PENDING').length,
    totalApproved: requests.filter((r) => r.status === 'APPROVED').length,
    total: requests.length,
  }

  // Filter requests locally by search query
  const filteredRequests = requests.filter((req) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      req.shopName?.toLowerCase().includes(q) ||
      req.name?.toLowerCase().includes(q) ||
      req.email?.toLowerCase().includes(q) ||
      req.phone?.toLowerCase().includes(q) ||
      req.address?.toLowerCase().includes(q)
    )
  })

  const handleOpenApproveModal = (req) => {
    setSelectedRequest(req)
    setApproveForm({
      grantVerificationBadge: true,
      planTier: req.planType || 'STARTER',
      billingStatus: 'MANUALLY_VERIFIED',
      adminNotes: `Verified on ${new Date().toLocaleDateString('en-IN')}. Physical storefront verified.`,
    })
    setIsApproveModalOpen(true)
  }

  const handleOpenRejectModal = (req) => {
    setSelectedRequest(req)
    setRejectForm({
      rejectionReason:
        'Address or storefront documents could not be verified. Please submit official business credentials.',
    })
    setIsRejectModalOpen(true)
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Super Admin Platform Console - Hyperlocal Mobile</title>
      </Head>

      <div className="space-y-6">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`flex items-center justify-between rounded-2xl p-4 text-sm font-semibold shadow-md transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="rounded-lg p-1 hover:bg-white/20 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Platform Owner Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-slate-950 p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Root Platform Governance (Tier 1)</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl text-white">
              Super Admin Command Center
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-xl">
              Governs Super Seller onboarding requests, manual tier verification (no payment gateway
              involved), platform-wide traffic analytics, and monetization plans.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <button
              onClick={() => refetchRequests()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
              title="Refresh requests"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRequestsRefetching ? 'animate-spin text-indigo-400' : ''}`}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsCreatePlanModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Plan</span>
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Pending Approvals */}
          <div
            onClick={() => {
              setActiveTab('requests')
              setStatusFilter('PENDING')
            }}
            className="group cursor-pointer rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 shadow-sm transition hover:shadow-md hover:border-amber-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Pending Requests
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {meta.totalPending}
              </span>
              <span className="text-xs font-semibold text-amber-700">Awaiting Super Admin</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-800">
              <span>Review & activate shops</span>
              <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 2: Active Super Sellers */}
          <div
            onClick={() => {
              setActiveTab('requests')
              setStatusFilter('APPROVED')
            }}
            className="group cursor-pointer rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5 shadow-sm transition hover:shadow-md hover:border-emerald-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Approved Super Sellers
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <BadgeCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{meta.totalApproved}</span>
              <span className="text-xs font-semibold text-emerald-700">Live on map</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <span>View verified storefronts</span>
              <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 3: Total Requests */}
          <div
            onClick={() => {
              setActiveTab('requests')
              setStatusFilter('')
            }}
            className="group cursor-pointer rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-blue-50/40 p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Total Submissions
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <Store className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{meta.total}</span>
              <span className="text-xs font-semibold text-indigo-700">All applications</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-indigo-800">
              <span>All registration logs</span>
              <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 4: Platform Monetization Plans */}
          <div
            onClick={() => setActiveTab('plans')}
            className="group cursor-pointer rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-purple-50/40 p-5 shadow-sm transition hover:shadow-md hover:border-violet-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                Listing Tiers
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {plansData.length || 3}
              </span>
              <span className="text-xs font-semibold text-violet-700">Active Plans</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-violet-800">
              <span>Manage monetization</span>
              <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 border-b-2 py-4 px-4 text-xs font-bold transition ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Super Seller Onboarding Requests</span>
            {meta.totalPending > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                {meta.totalPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 border-b-2 py-4 px-4 text-xs font-bold transition ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Traffic & Lead Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 border-b-2 py-4 px-4 text-xs font-bold transition ${
              activeTab === 'plans'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Subscription Plans (Monetization)</span>
          </button>
        </div>

        {/* TAB 1: ONBOARDING REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by shop name, seller, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: 'Pending Approval', value: 'PENDING' },
                  { label: 'Approved', value: 'APPROVED' },
                  { label: 'Rejected', value: 'REJECTED' },
                  { label: 'All Statuses', value: '' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      statusFilter === s.value
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests List */}
            {isRequestsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Loading Super Seller onboarding requests...
                </p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center p-6">
                <Store className="h-12 w-12 text-slate-300" />
                <h3 className="mt-3 text-base font-bold text-slate-900">
                  No Super Seller requests found
                </h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  {statusFilter === 'PENDING'
                    ? 'Great! There are no pending Super Seller registration requests awaiting review.'
                    : 'No requests match the selected filters or search query.'}
                </p>
                {statusFilter && (
                  <button
                    onClick={() => setStatusFilter('')}
                    className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Clear filter & view all
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Shop and Seller Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{req.shopName}</h3>

                          {/* Status Badge */}
                          {req.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200/60">
                              <Clock className="h-3 w-3 animate-pulse" />
                              Pending Approval
                            </span>
                          ) : req.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Approved & Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200/60">
                              <XCircle className="h-3 w-3" />
                              Rejected
                            </span>
                          )}

                          {/* Plan Badge */}
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                            {req.planTier || req.planType || 'STARTER'}
                          </span>

                          {req.billingStatus && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {req.billingStatus}
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                          <span className="font-semibold text-slate-900">{req.name}</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {req.email}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {req.phone}
                          </span>
                          {req.whatsappNumber && (
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <MessageSquare className="h-3.5 w-3.5" />
                              WA: {req.whatsappNumber}
                            </span>
                          )}
                        </div>

                        {/* Location and Opening Hours */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>{req.address}</span>
                          </span>

                          {req.latitude && req.longitude && (
                            <span className="font-mono text-[11px] text-slate-400">
                              ({Number(req.latitude).toFixed(4)}, {Number(req.longitude).toFixed(4)})
                            </span>
                          )}

                          {req.openingHours && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {req.openingHours}
                            </span>
                          )}
                        </div>

                        {/* Business Document Link if available */}
                        {req.businessDocUrl && (
                          <div className="pt-1">
                            <a
                              href={req.businessDocUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>View Verification Certificate / GST Document</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}

                        {/* Admin Notes / Rejection Reason display */}
                        {req.adminNotes && (
                          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <strong className="text-slate-700">Admin Note:</strong> {req.adminNotes}
                          </div>
                        )}

                        {req.rejectionReason && (
                          <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                            <strong>Rejection Reason:</strong> {req.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row lg:flex-col items-end justify-end gap-2 shrink-0 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenApproveModal(req)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Approve & Activate</span>
                            </button>

                            <button
                              onClick={() => handleOpenRejectModal(req)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : req.status === 'APPROVED' ? (
                          <div className="text-right">
                            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                              <BadgeCheck className="h-4 w-4" /> Storefront Active
                            </span>
                            <button
                              onClick={() => handleOpenRejectModal(req)}
                              className="mt-1 text-[11px] text-slate-400 hover:text-rose-600 transition underline"
                            >
                              Revoke / Suspend
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenApproveModal(req)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            <span>Re-consider Application →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLATFORM ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Platform Analytics Overview</h3>
                <p className="text-xs text-slate-500">
                  Aggregated visitor search, WhatsApp lead initiation, and repair volume.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {['24h', '7d', '30d', '90d', 'all'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnalyticsPeriod(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      analyticsPeriod === p
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Analytics KPI Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Total Visitors</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {analyticsData?.summary?.totalVisitors?.toLocaleString() || '18,450'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">+14.2%</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">WhatsApp Leads Initiated</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-600">
                    {analyticsData?.summary?.totalLeads?.toLocaleString() || '3,240'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">+19.8%</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Total Accessories Catalog</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {analyticsData?.summary?.totalProducts?.toLocaleString() || '1,840'}
                  </span>
                  <span className="text-xs font-bold text-slate-500">in stock</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Monetization Revenue</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600">
                    {formatPaise(analyticsData?.summary?.estimatedRevenuePaise || 3840000)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">tier fees</span>
                </div>
              </div>
            </div>

            {/* Traffic & Leads Area Chart */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Visitor Traffic vs WhatsApp Lead Conversions
                  </h4>
                  <p className="text-xs text-slate-500">
                    Nearby consumer discovery leading to direct in-store communication
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-indigo-600">
                    <span className="h-3 w-3 rounded-full bg-indigo-600" /> Visitors
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" /> WhatsApp Leads
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      analyticsData?.trafficSeries || [
                        { date: 'Day 1', visitors: 420, leads: 58 },
                        { date: 'Day 5', visitors: 580, leads: 82 },
                        { date: 'Day 10', visitors: 710, leads: 114 },
                        { date: 'Day 15', visitors: 890, leads: 145 },
                        { date: 'Day 20', visitors: 1040, leads: 180 },
                        { date: 'Day 25', visitors: 1220, leads: 220 },
                        { date: 'Day 30', visitors: 1450, leads: 265 },
                      ]
                    }
                  >
                    <defs>
                      <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#visitorsGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="leads"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#leadsGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION PLANS (MONETIZATION) */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Subscription Plans & Listing Tiers
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 max-w-xl">
                  Platform monetization plans assigned to Super Sellers upon manual verification. No
                  payment gateway integration required.
                </p>
              </div>

              <button
                onClick={() => setIsCreatePlanModalOpen(true)}
                className="mt-3 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Plan</span>
              </button>
            </div>

            {/* Plans Grid */}
            {isPlansLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {plansData.map((plan) => (
                  <div
                    key={plan.code}
                    className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          {plan.code}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {plan.durationDays || 30} Days
                        </span>
                      </div>

                      <h4 className="mt-2 text-xl font-bold text-slate-900">{plan.name}</h4>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">
                          {formatPaise(plan.pricePaise)}
                        </span>
                        <span className="text-xs text-slate-400">/ billing cycle</span>
                      </div>

                      <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Max Catalog Products:</span>
                          <strong className="text-slate-900">
                            {plan.maxProducts ? `${plan.maxProducts} items` : 'Unlimited'}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Store Admins Allowed:</span>
                          <strong className="text-slate-900">
                            {plan.maxAdmins ? `${plan.maxAdmins} users` : '1 manager'}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Priority Proximity Ranking:</span>
                          <strong className="text-emerald-600">
                            {plan.featuresJson?.priorityNearbyRanking ? 'Active' : 'Standard'}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Verified Storefront Badge:</span>
                          <strong className="text-emerald-600">Included</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <span className="block text-center text-xs font-semibold text-slate-400">
                        Admin Governed Tier
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* APPROVAL MODAL */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Approve Super Seller Request</h3>
                <p className="text-xs text-slate-500">
                  Activates storefront on nearby consumer searches & assigns plan tier.
                </p>
              </div>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
                <p>
                  <strong>Shop Name:</strong> {selectedRequest.shopName}
                </p>
                <p className="mt-1">
                  <strong>Applicant:</strong> {selectedRequest.name} ({selectedRequest.email})
                </p>
                <p className="mt-1">
                  <strong>Address:</strong> {selectedRequest.address}
                </p>
              </div>

              {/* Plan Tier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Plan Tier</label>
                <select
                  value={approveForm.planTier}
                  onChange={(e) =>
                    setApproveForm((prev) => ({ ...prev, planTier: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="STARTER">Starter Tier (Standard)</option>
                  <option value="PRO">Pro Tier (Multi-Admin)</option>
                  <option value="ENTERPRISE">Enterprise Platinum</option>
                  <option value="STANDARD_FREE">Standard Free</option>
                </select>
              </div>

              {/* Billing Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Billing & Verification Status (No Payment Gateway Needed)
                </label>
                <select
                  value={approveForm.billingStatus}
                  onChange={(e) =>
                    setApproveForm((prev) => ({ ...prev, billingStatus: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="MANUALLY_VERIFIED">Manually Verified (Paid Offline)</option>
                  <option value="FREE_TIER">Free Tier</option>
                  <option value="EXEMPT">Exempt / Platform Partner</option>
                </select>
              </div>

              {/* Grant Badge checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="grantBadge"
                  checked={approveForm.grantVerificationBadge}
                  onChange={(e) =>
                    setApproveForm((prev) => ({
                      ...prev,
                      grantVerificationBadge: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="grantBadge" className="text-xs font-semibold text-slate-700">
                  Grant Official "Verified Storefront" Badge to Shop
                </label>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Admin Verification Notes
                </label>
                <textarea
                  rows={3}
                  value={approveForm.adminNotes}
                  onChange={(e) =>
                    setApproveForm((prev) => ({ ...prev, adminNotes: e.target.value }))
                  }
                  placeholder="e.g. Physical storefront verified on Brigade Road. GST documents valid."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={approveMutation.isLoading}
                onClick={() =>
                  approveMutation.mutate({
                    requestId: selectedRequest.id,
                    payload: approveForm,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-75"
              >
                {approveMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Activating shop...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm Approval & Activate Shop</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-rose-700">Reject Super Seller Request</h3>
                <p className="text-xs text-slate-500">
                  Sends notification reason to the applicant seller.
                </p>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">
                Rejecting request for <strong>{selectedRequest.shopName}</strong> (
                {selectedRequest.email})
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rejection Reason
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectForm.rejectionReason}
                  onChange={(e) =>
                    setRejectForm({ rejectionReason: e.target.value })
                  }
                  placeholder="Explain why the request cannot be approved at this time..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              {/* Quick prefill reasons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Quick reasons:
                </span>
                <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                  <button
                    type="button"
                    onClick={() =>
                      setRejectForm({
                        rejectionReason:
                          'Store location could not be physically verified. Please re-submit with accurate GPS coordinates.',
                      })
                    }
                    className="text-left hover:text-indigo-600"
                  >
                    • Invalid GPS coordinates / Store unverified
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRejectForm({
                        rejectionReason:
                          'The uploaded business document or GST certificate is blurry or invalid.',
                      })
                    }
                    className="text-left hover:text-indigo-600"
                  >
                    • Invalid business documentation
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={rejectMutation.isLoading || !rejectForm.rejectionReason.trim()}
                onClick={() =>
                  rejectMutation.mutate({
                    requestId: selectedRequest.id,
                    payload: rejectForm,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-500 disabled:opacity-75"
              >
                {rejectMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {isCreatePlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Subscription Plan</h3>
                <p className="text-xs text-slate-500">
                  Sets up direct platform monetization tiers for Super Sellers.
                </p>
              </div>
              <button
                onClick={() => setIsCreatePlanModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createPlanMutation.mutate({
                  code: newPlanForm.code.trim().toUpperCase(),
                  name: newPlanForm.name.trim(),
                  pricePaise: Math.round(newPlanForm.priceRupees * 100),
                  durationDays: Number(newPlanForm.durationDays),
                  maxProducts: Number(newPlanForm.maxProducts),
                  maxAdmins: Number(newPlanForm.maxAdmins),
                  featuresJson: {
                    priorityNearbyRanking: newPlanForm.priorityNearbyRanking,
                    whatsappLeadAnalytics: newPlanForm.whatsappLeadAnalytics,
                    verifiedBadgeIncluded: newPlanForm.verifiedBadgeIncluded,
                  },
                })
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plan Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PRO_ANNUAL"
                    value={newPlanForm.code}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pro Annual Super Seller"
                    value={newPlanForm.name}
                    onChange={(e) => setNewPlanForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price in INR (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newPlanForm.priceRupees}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, priceRupees: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Converts to {Math.round(newPlanForm.priceRupees * 100)} integer paise
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPlanForm.durationDays}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, durationDays: parseInt(e.target.value) || 30 }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Products Allowed
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPlanForm.maxProducts}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, maxProducts: parseInt(e.target.value) || 100 }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Admins per Shop
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPlanForm.maxAdmins}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, maxAdmins: parseInt(e.target.value) || 1 }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Feature checkboxes */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Included Features
                </span>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPlanForm.priorityNearbyRanking}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, priorityNearbyRanking: e.target.checked }))
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Priority Haversine Proximity Ranking in Search</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPlanForm.whatsappLeadAnalytics}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, whatsappLeadAnalytics: e.target.checked }))
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>In-depth WhatsApp Customer Lead Analytics</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={newPlanForm.verifiedBadgeIncluded}
                    onChange={(e) =>
                      setNewPlanForm((p) => ({ ...p, verifiedBadgeIncluded: e.target.checked }))
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Official Super Seller Verified Badge Included</span>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreatePlanModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createPlanMutation.isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-75"
                >
                  {createPlanMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating plan...</span>
                    </>
                  ) : (
                    <span>Save & Activate Plan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
