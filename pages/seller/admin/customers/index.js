import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Wrench,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

import DashboardLayout from '../../../../../components/DashboardLayout'
import customersService from '../../../../../src/lib/api/customers.service'

function formatPaise(paise) {
  if (paise == null) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function LocalCustomersPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // New Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  // New Repair Job Form State
  const [repairForm, setRepairForm] = useState({
    customerName: '',
    customerPhone: '',
    brand: '',
    model: '',
    problemDescription: '',
    estimatedCostRupees: 599,
  })

  // Toast feedback
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  // 1. Fetch Local Customers
  const {
    data: customers = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['localCustomers', searchQuery],
    queryFn: () => customersService.getLocalCustomers({ search: searchQuery || undefined }),
    staleTime: 10000,
  })

  // 2. Mutation: Create Walk-in Customer
  const createCustomerMutation = useMutation({
    mutationFn: (payload) => customersService.createLocalCustomer(payload),
    onSuccess: (newCust) => {
      showFeedback('success', `Customer ${newCust?.name || ''} logged successfully!`)
      setIsAddModalOpen(false)
      setCustomerForm({ name: '', phone: '', email: '', address: '', notes: '' })
      queryClient.invalidateQueries({ queryKey: ['localCustomers'] })
    },
    onError: (err) => {
      showFeedback(
        'error',
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to log customer.'
      )
    },
  })

  // 3. Mutation: Update Customer
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, payload }) => customersService.updateLocalCustomer(id, payload),
    onSuccess: () => {
      showFeedback('success', 'Customer profile updated successfully!')
      setIsEditModalOpen(false)
      setSelectedCustomer(null)
      queryClient.invalidateQueries({ queryKey: ['localCustomers'] })
    },
    onError: (err) => {
      showFeedback('error', err.response?.data?.message || 'Failed to update customer.')
    },
  })

  // 4. Mutation: Delete Customer
  const deleteCustomerMutation = useMutation({
    mutationFn: (id) => customersService.deleteLocalCustomer(id),
    onSuccess: () => {
      showFeedback('success', 'Customer deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['localCustomers'] })
    },
    onError: (err) => {
      showFeedback('error', err.response?.data?.message || 'Failed to delete customer.')
    },
  })

  // 5. Mutation: Book Repair Job for Customer
  const createRepairMutation = useMutation({
    mutationFn: (payload) => customersService.createCustomerRepairJob(payload),
    onSuccess: (res) => {
      showFeedback(
        'success',
        `Repair ticket ${res?.referenceNumber || res?.ticketId || ''} created successfully!`
      )
      setIsRepairModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['localCustomers'] })
      queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] })
    },
    onError: (err) => {
      showFeedback(
        'error',
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create repair ticket.'
      )
    },
  })

  // Filter customers locally by search query
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q)
    )
  })

  const totalRepairsCount = customers.reduce(
    (acc, c) => acc + (c.total_repairs_count || c.totalRepairsCount || 0),
    0
  )
  const totalOrdersCount = customers.reduce(
    (acc, c) => acc + (c.total_orders_count || c.totalOrdersCount || 0),
    0
  )

  const handleOpenRepairModal = (cust) => {
    setSelectedCustomer(cust)
    setRepairForm({
      customerName: cust.name,
      customerPhone: cust.phone,
      brand: '',
      model: '',
      problemDescription: cust.notes || '',
      estimatedCostRupees: 599,
    })
    setIsRepairModalOpen(true)
  }

  const handleOpenEditModal = (cust) => {
    setSelectedCustomer(cust)
    setCustomerForm({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      notes: cust.notes || '',
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteCustomer = (cust) => {
    if (confirm(`Are you sure you want to delete customer record for "${cust.name}"?`)) {
      deleteCustomerMutation.mutate(cust.id)
    }
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Local Customers Management - Hyperlocal Mobile</title>
      </Head>

      <div className="space-y-6">
        {/* Feedback message */}
        {feedback && (
          <div
            className={`flex items-center justify-between rounded-2xl p-4 text-sm font-semibold shadow-md transition-all ${
              feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
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

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Users className="h-3.5 w-3.5" />
              <span>Store Front-Desk Operations (Tier 3)</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl text-white">
              Local Walk-in Customers
            </h1>
            <p className="mt-1 text-xs text-slate-400 max-w-xl">
              Register walk-in customers, track device repair histories, and log mobile accessory
              purchases directly under your shop.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setCustomerForm({ name: '', phone: '', email: '', address: '', notes: '' })
                setIsAddModalOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Log Walk-in Customer</span>
            </button>
          </div>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Walk-in Customers
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{customers.length}</span>
              <span className="text-xs font-semibold text-slate-400">stored in local directory</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Repairs Processed
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totalRepairsCount}</span>
              <span className="text-xs font-semibold text-amber-600">service tickets</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total In-Store Orders
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{totalOrdersCount}</span>
              <span className="text-xs font-semibold text-emerald-600">purchases logged</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, mobile number, notes or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {filteredCustomers.length} of {customers.length} Customers
          </span>
        </div>

        {/* Customer Cards / Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Loading local store customers...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center p-6">
            <Users className="h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No customers logged yet</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Log walk-in customers who visit your store for screen repairs, phone battery issues, or
              mobile accessory inquiries.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>Log First Walk-In Customer</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map((cust) => {
              const repairs = cust.total_repairs_count || cust.totalRepairsCount || 0
              const orders = cust.total_orders_count || cust.totalOrdersCount || 0
              const cleanPhone = cust.phone.replace(/[^0-9]/g, '')

              return (
                <div
                  key={cust.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left: Customer Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{cust.name}</h3>

                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700">
                          {cust.phone}
                        </span>

                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200/60">
                          {repairs} Repairs
                        </span>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/60">
                          {orders} Orders
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        {cust.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{cust.email}</span>
                          </span>
                        )}

                        {cust.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{cust.address}</span>
                          </span>
                        )}

                        {cust.created_at && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              Logged on{' '}
                              {new Date(cust.created_at).toLocaleDateString('en-IN', {
                                dateStyle: 'medium',
                              })}
                            </span>
                          </span>
                        )}
                      </div>

                      {cust.notes && (
                        <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Service Note:</strong> {cust.notes}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0">
                      {/* WhatsApp shortcut */}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=Hello%20${encodeURIComponent(
                            cust.name
                          )},%20regarding%20your%20inquiry%20at%20our%20shop...`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200/60"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Phone shortcut */}
                      <a
                        href={`tel:${cust.phone}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call</span>
                      </a>

                      {/* Book Repair Problem */}
                      <button
                        onClick={() => handleOpenRepairModal(cust)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        <span>Book Repair</span>
                      </button>

                      {/* Edit Customer */}
                      <button
                        onClick={() => handleOpenEditModal(cust)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
                        title="Edit Customer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Customer */}
                      <button
                        onClick={() => handleDeleteCustomer(cust)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete Customer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: LOG WALK-IN CUSTOMER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Walk-in Customer</h3>
                <p className="text-xs text-slate-500">
                  Adds a local customer record linked to your shop and admin profile.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createCustomerMutation.mutate(customerForm)
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijay Sundaram"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9812345678"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. vijay@example.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local Address / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MG Road, Bangalore"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Notes / Device Preferences (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Prefers OEM parts for iPhone 14 Pro, regular customer"
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createCustomerMutation.isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-75"
                >
                  {createCustomerMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving customer...</span>
                    </>
                  ) : (
                    <span>Save Walk-in Customer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOK REPAIR JOB FOR CUSTOMER */}
      {isRepairModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Book Repair Job for {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Creates a diagnostic repair job under your store.
                </p>
              </div>
              <button
                onClick={() => setIsRepairModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createRepairMutation.mutate({
                  customerId: selectedCustomer.id,
                  customerName: repairForm.customerName,
                  customerPhone: repairForm.customerPhone,
                  brand: repairForm.brand,
                  model: repairForm.model,
                  problemDescription: repairForm.problemDescription,
                  estimatedCostPaise: Math.round(repairForm.estimatedCostRupees * 100),
                })
              }}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={repairForm.customerName}
                    onChange={(e) =>
                      setRepairForm((p) => ({ ...p, customerName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={repairForm.customerPhone}
                    onChange={(e) =>
                      setRepairForm((p) => ({ ...p, customerPhone: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Device Brand
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple iPhone / Samsung"
                    value={repairForm.brand}
                    onChange={(e) => setRepairForm((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Device Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 14 Pro / Galaxy S24"
                    value={repairForm.model}
                    onChange={(e) => setRepairForm((p) => ({ ...p, model: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Problem Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Screen glass broken, digitizer functioning normally."
                  value={repairForm.problemDescription}
                  onChange={(e) =>
                    setRepairForm((p) => ({ ...p, problemDescription: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimated Repair Quote in INR (₹)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={repairForm.estimatedCostRupees}
                  onChange={(e) =>
                    setRepairForm((p) => ({
                      ...p,
                      estimatedCostRupees: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Translates to {Math.round(repairForm.estimatedCostRupees * 100)} integer paise
                </span>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRepairModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createRepairMutation.isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-75"
                >
                  {createRepairMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating ticket...</span>
                    </>
                  ) : (
                    <span>Submit Repair Job</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT CUSTOMER */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Customer Profile</h3>
                <p className="text-xs text-slate-500">Update local walk-in customer details.</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                updateCustomerMutation.mutate({
                  id: selectedCustomer.id,
                  payload: customerForm,
                })
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updateCustomerMutation.isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-75"
                >
                  {updateCustomerMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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
