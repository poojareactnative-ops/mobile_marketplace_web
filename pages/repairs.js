import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../src/lib/api/client'
import {
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  Store,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

const COMMON_ISSUES = [
  'Broken / Cracked Screen',
  'Battery Draining Fast / Swollen',
  'Not Charging / Loose Port',
  'Water / Liquid Damage',
  'Back Glass Broken',
  'Camera Not Focusing / Broken Lens',
  'Mic / Speaker Distortion',
  'Software / Boot Loop',
]

const POPULAR_BRANDS = ['Apple iPhone', 'Samsung', 'OnePlus', 'Xiaomi / Redmi', 'Vivo', 'Oppo', 'Google Pixel', 'Realme', 'Other']

export default function RepairsPage() {
  const [activeTab, setActiveTab] = useState('book') // 'book' or 'track'

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    brand: 'Apple iPhone',
    model: '',
    problemDescription: '',
    preferredShopId: '',
  })
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(null)

  // Tracking query state
  const [trackSearch, setTrackSearch] = useState('')
  const [trackingSubmitted, setTrackingSubmitted] = useState(false)

  // Fetch shops for preferred shop dropdown
  const { data: shopsData } = useQuery({
    queryKey: ['repair-shops-list'],
    queryFn: async () => {
      const res = await apiClient.get('/shops/nearby?lat=12.9716&lng=77.5946&radiusMeters=15000')
      return res.data?.data || []
    },
  })

  // Tracking query
  const { data: trackResults, isLoading: isTracking, refetch: refetchTrack } = useQuery({
    queryKey: ['track-repair-job', trackSearch],
    queryFn: async () => {
      if (!trackSearch.trim()) return []
      const isPhone = /^\d{10}$/.test(trackSearch.trim())
      const param = isPhone ? `phone=${trackSearch.trim()}` : `ticketId=${trackSearch.trim()}`
      const res = await apiClient.get(`/public/repairs/track?${param}`)
      return res.data?.data || []
    },
    enabled: false,
  })

  async function handleBookRepair(e) {
    e.preventDefault()
    setIsSubmittingBooking(true)
    try {
      const res = await apiClient.post('/public/repairs/book', {
        ...bookingForm,
        preferredShopId: bookingForm.preferredShopId || undefined,
      })
      setBookingSuccess(res.data?.data)
      setBookingForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        brand: 'Apple iPhone',
        model: '',
        problemDescription: '',
        preferredShopId: '',
      })
    } catch (err) {
      alert('Failed to book repair: ' + (err.response?.data?.error?.message || err.message))
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  function handleSearchTrack(e) {
    e.preventDefault()
    if (!trackSearch.trim()) return
    setTrackingSubmitted(true)
    refetchTrack()
  }

  const shops = shopsData || []

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Wrench className="h-4 w-4" />
                Mobile Repair Center
              </div>
              <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                Device Repair & Real-Time Tracking
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Book guaranteed repairs with certified local technicians and track status live.
              </p>
            </div>

            <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              ← Homepage
            </Link>
          </div>

          {/* Tab Switcher */}
          <div className="mt-8 flex gap-3 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('book')}
              className={`pb-3 text-sm font-bold transition ${
                activeTab === 'book'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Book a Device Repair
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`pb-3 text-sm font-bold transition ${
                activeTab === 'track'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Track Repair Status
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ========================================= */}
        {/* TAB 1: BOOK REPAIR */}
        {/* ========================================= */}
        {activeTab === 'book' && (
          <div className="mx-auto max-w-2xl">
            {bookingSuccess ? (
              <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-900">Repair Ticket Created!</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your device repair request has been submitted to <span className="font-bold text-slate-800">{bookingSuccess.shop?.name}</span>.
                </p>

                <div className="mt-6 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Your Repair Ticket ID</p>
                  <p className="mt-1 font-mono text-2xl font-black text-slate-900 select-all">{bookingSuccess.id}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Save this Ticket ID or use your phone number <span className="font-bold text-slate-700">{bookingSuccess.customerPhone}</span> to track status anytime.
                  </p>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setTrackSearch(bookingSuccess.id)
                      setActiveTab('track')
                      setBookingSuccess(null)
                    }}
                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
                  >
                    Track This Ticket Now →
                  </button>
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Book Another Device
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookRepair} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Device & Customer Details</h3>
                  <p className="text-xs text-slate-500">Please provide accurate information for an accurate diagnosis.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.customerName}
                      onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                      placeholder="e.g. Anand Sharma"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.customerPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Device Brand *</label>
                    <select
                      value={bookingForm.brand}
                      onChange={(e) => setBookingForm({ ...bookingForm, brand: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    >
                      {POPULAR_BRANDS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Model Name *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.model}
                      onChange={(e) => setBookingForm({ ...bookingForm, model: e.target.value })}
                      placeholder="e.g. iPhone 14 Pro / Galaxy S23"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Common Issue Quick Buttons */}
                <div>
                  <label className="text-xs font-bold text-slate-700">Select Common Issue (or type below)</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_ISSUES.map((issue) => (
                      <button
                        type="button"
                        key={issue}
                        onClick={() => {
                          const current = bookingForm.problemDescription
                          setBookingForm({
                            ...bookingForm,
                            problemDescription: current ? `${current}, ${issue}` : issue,
                          })
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        + {issue}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Problem Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={bookingForm.problemDescription}
                    onChange={(e) => setBookingForm({ ...bookingForm, problemDescription: e.target.value })}
                    placeholder="Describe what happened: screen blank, lines on display, battery draining in 2 hours, dropped in water..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Preferred Shop */}
                <div>
                  <label className="text-xs font-bold text-slate-700">Preferred Local Repair Store</label>
                  <select
                    value={bookingForm.preferredShopId}
                    onChange={(e) => setBookingForm({ ...bookingForm, preferredShopId: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Auto-Assign to nearest verified repair center</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.address ? s.address.slice(0, 35) + '...' : 'Bangalore'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmittingBooking ? 'Submitting Request...' : 'Confirm Repair Booking'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: TRACK STATUS */}
        {/* ========================================= */}
        {activeTab === 'track' && (
          <div className="mx-auto max-w-2xl space-y-8">
            <form onSubmit={handleSearchTrack} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Track by Ticket ID or 10-Digit Mobile Number
              </label>
              <div className="mt-2 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={trackSearch}
                    onChange={(e) => setTrackSearch(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. 56350f...) or Phone (e.g. 9876543210)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  Track Status
                </button>
              </div>
            </form>

            {isTracking && (
              <div className="p-8 text-center text-slate-500">
                <Clock className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-2 text-sm font-semibold">Looking up repair status...</p>
              </div>
            )}

            {trackingSubmitted && !isTracking && trackResults && trackResults.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
                <h3 className="mt-3 text-base font-bold text-slate-900">No repair tickets found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Please verify your ticket ID or mobile number and try again.
                </p>
              </div>
            )}

            {trackResults && trackResults.length > 0 && (
              <div className="space-y-6">
                {trackResults.map((job) => {
                  const statusColors = {
                    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
                    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
                    READY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    COMPLETED: 'bg-slate-100 text-slate-700 border-slate-300',
                  }

                  return (
                    <div
                      key={job.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md"
                    >
                      <div className="border-b border-slate-100 bg-slate-50/70 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-mono text-slate-400">TICKET #{job.id.slice(0, 8)}...</span>
                          <h3 className="text-lg font-black text-slate-900">{job.brand} {job.model}</h3>
                        </div>
                        <span
                          className={`self-start sm:self-auto rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider border ${
                            statusColors[job.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="p-6 space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold">Reported Problem:</span>
                            <p className="mt-0.5 font-bold text-slate-800">{job.problemDescription}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold">Handling Store:</span>
                            <p className="mt-0.5 font-bold text-slate-800">{job.shop?.name || 'Local Center'}</p>
                            {job.shop?.phone ? (
                              <a href={`tel:${job.shop.phone}`} className="mt-1 flex items-center gap-1 text-indigo-600 font-medium">
                                <PhoneCall className="h-3 w-3" /> Call: {job.shop.phone}
                              </a>
                            ) : null}
                          </div>
                        </div>

                        {/* Audit Timeline */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Updates & Timeline</h4>
                          <div className="mt-4 space-y-4">
                            {job.updates?.map((upd, idx) => (
                              <div key={upd.id} className="relative flex gap-3 pl-2">
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600 ring-4 ring-indigo-50" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">{upd.status}</span>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(upd.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                  </div>
                                  {upd.note ? (
                                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{upd.note}</p>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
