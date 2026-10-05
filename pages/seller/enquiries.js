"use client"

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import DashboardLayout from '../../components/DashboardLayout'
import apiClient from '../../src/lib/api/client'
import {
  MessageCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Tag,
  Package,
  Phone,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  User,
  ArrowRight,
} from 'lucide-react'

function formatDate(dateString) {
  if (!dateString) return 'Recent'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

function getCleanPhone(phone) {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '').slice(-10)
}

export default function EnquiriesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [openIds, setOpenIds] = useState([])
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL' | 'OFFERS' | 'PRODUCTS' | 'NEW' | 'RESPONDED'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadEnquiries()
  }, [])

  async function loadEnquiries(isManual = false) {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await apiClient.get('/seller/enquiries')
      setItems(res.data.data || [])
    } catch (e) {
      console.error('Failed to load enquiries', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function toggleResolved(id, currentResolved) {
    const nextStatus = currentResolved ? 'NEW' : 'RESPONDED'
    try {
      await apiClient.patch(`/seller/enquiries/${id}`, {
        status: nextStatus,
        responseNote: 'Followed up with customer directly',
      })
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, resolved: !currentResolved, status: nextStatus } : it
        )
      )
    } catch (e) {
      // Optimistic fallback update in local state
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, resolved: !currentResolved, status: nextStatus } : it
        )
      )
    }
  }

  function toggleOpen(id) {
    setOpenIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]))
  }

  // Parse enquiry details
  const parsedItems = useMemo(() => {
    return items.map((it) => {
      const customerName = it.customerName || it.name || 'Walk-in / Online Customer'
      const customerPhone = it.customerPhone || it.phone || ''
      const phoneClean = getCleanPhone(customerPhone)

      const isOffer = Boolean(it.message && it.message.includes('[Offer:'))
      const offerTagMatch = isOffer ? it.message.match(/\[Offer:\s*([^\]]+)\]/) : null
      const offerTitle = offerTagMatch ? offerTagMatch[1] : null
      const cleanMessage = isOffer
        ? it.message.replace(/\[Offer:[^\]]+\]\s*/, '').trim()
        : it.message

      const isProduct = Boolean(it.product || it.productId)
      const productName = it.product?.name || null

      const isResponded = it.resolved || it.status === 'RESPONDED'

      return {
        ...it,
        customerName,
        customerPhone,
        phoneClean,
        isOffer,
        offerTitle,
        cleanMessage,
        isProduct,
        productName,
        isResponded,
      }
    })
  }, [items])

  // KPI Metrics
  const stats = useMemo(() => {
    const total = parsedItems.length
    const offerLeads = parsedItems.filter((it) => it.isOffer).length
    const productLeads = parsedItems.filter((it) => it.isProduct && !it.isOffer).length
    const responded = parsedItems.filter((it) => it.isResponded).length
    const pending = total - responded

    return { total, offerLeads, productLeads, responded, pending }
  }, [parsedItems])

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    return parsedItems.filter((it) => {
      if (activeTab === 'OFFERS' && !it.isOffer) return false
      if (activeTab === 'PRODUCTS' && (!it.isProduct || it.isOffer)) return false
      if (activeTab === 'NEW' && it.isResponded) return false
      if (activeTab === 'RESPONDED' && !it.isResponded) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const name = (it.customerName || '').toLowerCase()
        const phone = (it.customerPhone || '').toLowerCase()
        const msg = (it.message || '').toLowerCase()
        const offer = (it.offerTitle || '').toLowerCase()
        const prod = (it.productName || '').toLowerCase()

        return (
          name.includes(q) ||
          phone.includes(q) ||
          msg.includes(q) ||
          offer.includes(q) ||
          prod.includes(q)
        )
      }

      return true
    })
  }, [parsedItems, activeTab, searchQuery])

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              Dynamic Customer Enquiries
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              Offer &amp; Product Inquiries
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Real-time WhatsApp and store enquiries generated directly by buyers interested in your running offers and catalog items.
            </p>
          </div>

          <button
            onClick={() => loadEnquiries(true)}
            disabled={refreshing || loading}
            title="Refresh Inquiries"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {/* Total */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Enquiries
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <MessageCircle className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{stats.total}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">All inbound leads</p>
          </div>

          {/* Offer Leads */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Offer Inquiries
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Tag className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-amber-900">{stats.offerLeads}</p>
            <p className="mt-0.5 text-[11px] text-amber-700/80">From active deals &amp; discounts</p>
          </div>

          {/* Product Leads */}
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                Product Leads
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Package className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-blue-900">{stats.productLeads}</p>
            <p className="mt-0.5 text-[11px] text-blue-700/80">From catalog items</p>
          </div>

          {/* Responded */}
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Followed Up
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-900">{stats.responded}</p>
            <p className="mt-0.5 text-[11px] text-emerald-700/80">{stats.pending} pending response</p>
          </div>
        </div>

        {/* Main Feed Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          {/* Controls: Search + Filter Tabs */}
          <div className="border-b border-slate-100 p-4 sm:p-5 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search enquiries by customer name, phone, offer title, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {[
                { id: 'ALL', label: 'All Inquiries', count: stats.total },
                { id: 'OFFERS', label: 'Offer Inquiries', count: stats.offerLeads },
                { id: 'PRODUCTS', label: 'Product Inquiries', count: stats.productLeads },
                { id: 'NEW', label: 'Pending Response', count: stats.pending },
                { id: 'RESPONDED', label: 'Responded', count: stats.responded },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-1.5 font-semibold transition ${
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

          {/* List Content */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
              <p className="mt-3 text-xs font-semibold text-slate-600">Loading inquiries...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">
                {items.length === 0 ? 'No customer enquiries received yet' : 'No enquiries match your filter'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {items.length === 0
                  ? 'When buyers click "Enquire Offer" on your running deals or send inquiries on your catalog products, they will appear here in real-time.'
                  : 'Try clearing your search query or switching to another filter tab above.'}
              </p>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    setActiveTab('ALL')
                    setSearchQuery('')
                  }}
                  className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredItems.map((it) => {
                const isOpen = openIds.includes(it.id)

                const replyGreeting = encodeURIComponent(
                  `Hello ${it.customerName}, thank you for reaching out regarding ${
                    it.isOffer
                      ? `our active offer "${it.offerTitle || 'Store Deal'}"`
                      : it.productName
                      ? `our product "${it.productName}"`
                      : 'your enquiry'
                  } at our store! How can we assist you today?`
                )

                return (
                  <li key={it.id} className="p-5 transition hover:bg-slate-50/60">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Customer & Item Identity */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm ${
                            it.isOffer
                              ? 'bg-amber-100 text-amber-800'
                              : it.isProduct
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {it.isOffer ? <Tag className="h-5 w-5" /> : it.isProduct ? <Package className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        </div>

                        <div>
                          {/* Top Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {it.customerName}
                            </span>

                            {it.isOffer ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                                <Sparkles className="h-3 w-3 text-amber-500" />
                                <span>Offer Inquiry</span>
                              </span>
                            ) : it.isProduct ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-200">
                                <Package className="h-3 w-3 text-blue-500" />
                                <span>Product Lead</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                                <span>General Lead</span>
                              </span>
                            )}

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                it.isResponded
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {it.isResponded ? 'Responded' : 'Pending Action'}
                            </span>
                          </div>

                          {/* Reference Subject */}
                          <div className="mt-1 text-xs text-slate-600">
                            {it.isOffer && it.offerTitle && (
                              <p className="font-semibold text-amber-900">
                                Offer: <span className="font-bold text-indigo-700">{it.offerTitle}</span>
                              </p>
                            )}

                            {it.isProduct && it.productName && (
                              <p className="font-semibold text-slate-700">
                                Product: <span className="font-bold text-slate-900">{it.productName}</span>
                              </p>
                            )}
                          </div>

                          {/* Contact Info & Timestamp */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            {it.customerPhone && (
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{it.customerPhone}</span>
                              </span>
                            )}

                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{formatDate(it.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions for the Seller */}
                      <div className="flex flex-wrap items-center gap-2 self-start">
                        {it.phoneClean && (
                          <a
                            href={`https://wa.me/91${it.phoneClean}?text=${replyGreeting}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp Reply</span>
                          </a>
                        )}

                        {it.customerPhone && (
                          <a
                            href={`tel:${it.customerPhone}`}
                            title="Call Customer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleResolved(it.id, it.isResponded)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                            it.isResponded
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {it.isResponded ? '✓ Done' : 'Mark Done'}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleOpen(it.id)}
                          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
                          title={isOpen ? 'Collapse Message' : 'Read Full Message'}
                        >
                          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Message Box */}
                    {isOpen && (
                      <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-700 space-y-2 animate-in fade-in duration-150">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Customer Message
                        </p>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          "{it.cleanMessage || it.message}"
                        </p>

                        {it.whatsappUrl && (
                          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Origin: WhatsApp Click-to-Chat</span>
                            <a
                              href={it.whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <span>Original Chat URL</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}