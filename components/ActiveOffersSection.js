"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../src/lib/api/client'
import {
  Tag,
  Sparkles,
  Store,
  MapPin,
  Calendar,
  MessageCircle,
  Phone,
  ShieldCheck,
  ArrowRight,
  Clock,
  Check,
  Copy,
  Flame,
  X,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

function formatDate(dateString) {
  if (!dateString) return null
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

export default function ActiveOffersSection({ offers = [] }) {
  const [copiedId, setCopiedId] = useState(null)

  // Enquiry Modal state
  const [enquiryModalOffer, setEnquiryModalOffer] = useState(null)
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const [enquiryError, setEnquiryError] = useState('')

  const { data: fallbackOffers } = useQuery({
    queryKey: ['landing-active-offers-backup'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/public/landing-page')
        return res.data?.data?.offers || []
      } catch {
        return []
      }
    },
    enabled: !offers || offers.length === 0,
    staleTime: 10000,
  })

  const sourceOffers = offers && offers.length > 0 ? offers : (fallbackOffers || [])
  const activeOffers = Array.isArray(sourceOffers)
    ? sourceOffers.filter((o) => o && o.status !== 'INACTIVE')
    : []

  const handleCopyCode = (id, code) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const openEnquiryModal = (offer) => {
    const shop = offer.shop || {}
    const isPercentage = offer.discountType === 'PERCENT' || offer.discountType === 'PERCENTAGE'
    const discountLabel = offer.discountValue
      ? isPercentage
        ? `${offer.discountValue}% OFF`
        : `₹${offer.discountValue} OFF`
      : 'Special Deal'

    setEnquiryModalOffer(offer)
    setEnquiryForm({
      name: '',
      phone: '',
      message: `Hi, I am interested in your offer "${offer.title}" (${discountLabel}) at ${shop.name || 'your store'}. How can I claim this deal?`,
    })
    setEnquirySuccess(false)
    setEnquiryError('')
  }

  const handleEnquirySubmit = async (e) => {
    e.preventDefault()
    if (!enquiryModalOffer) return
    setIsSubmitting(true)
    setEnquiryError('')

    try {
      await apiClient.post('/enquiries', {
        offerId: enquiryModalOffer.id,
        shopId: enquiryModalOffer.shopId || enquiryModalOffer.shop?.id,
        customerName: enquiryForm.name,
        customerPhone: enquiryForm.phone,
        message: enquiryForm.message,
      })

      setEnquirySuccess(true)
    } catch (err) {
      setEnquiryError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          'Failed to send enquiry. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="offers" className="mt-10">
      {/* Section Container */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100/90 bg-gradient-to-br from-white via-indigo-50/15 to-violet-50/30 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
        {/* Glow ambient background decoration */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        {/* Section Header */}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">
              <Flame className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
              <span>Limited-Time Store Deals</span>
            </div>

            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Active Offers &amp; Local Discounts
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
              Discover exclusive flash deals, festival discounts, and device repair specials from verified neighborhood mobile shops.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-100/80 px-3 py-1 text-xs font-bold text-indigo-800">
              {activeOffers.length} {activeOffers.length === 1 ? 'Live Offer' : 'Live Offers'}
            </span>
            <Link
              href="/offers"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-sm border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Offers Grid */}
        {activeOffers.length === 0 ? (
          /* Empty / Fallback State */
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
              <Tag className="h-7 w-7 text-indigo-500" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">New Offers Dropping Soon</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Local shops frequently post weekend promos, screen repair discounts, and accessory bundles. Check back shortly or browse neighborhood stores.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/shops"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
              >
                Explore Nearby Shops
              </Link>
              <Link
                href="/products"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Live Offers Grid */
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeOffers.map((offer) => {
              const shop = offer.shop || {}
              const isPercentage = offer.discountType === 'PERCENT' || offer.discountType === 'PERCENTAGE'
              const discountLabel = offer.discountValue
                ? isPercentage
                  ? `${offer.discountValue}% OFF`
                  : `₹${offer.discountValue} OFF`
                : 'Special Deal'

              const phoneClean = getCleanPhone(shop.whatsappNumber || shop.phone)
              const startsFormatted = formatDate(offer.startsAt)
              const endsFormatted = formatDate(offer.endsAt)

              const whatsappMessage = encodeURIComponent(
                `Hello ${shop.name || 'Store'}, I saw your active offer "${offer.title}" (${discountLabel}) on Hyperlocal Mobile and would like to claim it!`
              )

              return (
                <div
                  key={offer.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div>
                    {/* Header: Discount Badge + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-black text-white shadow-sm shadow-indigo-600/25">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{discountLabel}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Deal</span>
                      </div>
                    </div>

                    {/* Offer Title & Text */}
                    <h3 className="mt-3.5 text-lg font-black text-slate-900 capitalize tracking-tight group-hover:text-indigo-600 transition">
                      {offer.title}
                    </h3>

                    {offer.text && (
                      <p className="mt-1 text-xs font-semibold text-indigo-600">
                        {offer.text}
                      </p>
                    )}

                    {offer.description && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    )}

                    {/* Validity Period */}
                    {(startsFormatted || endsFormatted) && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>
                          {endsFormatted ? `Valid until ${endsFormatted}` : `From ${startsFormatted}`}
                        </span>
                      </div>
                    )}

                    {/* Coupon Code (if available) */}
                    {offer.code && (
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="font-mono text-xs font-black tracking-wider text-indigo-800">
                            {offer.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(offer.id, offer.code)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                        >
                          {copiedId === offer.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-400" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shop Details & Quick Actions */}
                  <div className="mt-5 border-t border-slate-100 pt-3.5">
                    {/* Shop Identity */}
                    <div className="flex items-center justify-between text-xs">
                      <Link
                        href={`/shops/${shop.id || ''}`}
                        className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-indigo-600 transition truncate max-w-[200px]"
                      >
                        <Store className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{shop.name || 'Verified Partner Shop'}</span>
                        {shop.isVerified && (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" title="Verified Seller" />
                        )}
                      </Link>

                      {shop.address && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[100px]" title={shop.address}>
                          {shop.address.split(',')[0]}
                        </span>
                      )}
                    </div>

                    {/* CTAs */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEnquiryModal(offer)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Enquire Offer</span>
                      </button>

                      {phoneClean && (
                        <a
                          href={`https://wa.me/91${phoneClean}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Instant WhatsApp Chat"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      )}

                      {shop.phone && (
                        <a
                          href={`tel:${shop.phone}`}
                          title="Call Shop"
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Offer Enquiry Modal */}
      {enquiryModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setEnquiryModalOffer(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                <span>
                  {enquiryModalOffer.discountType === 'PERCENT' || enquiryModalOffer.discountType === 'PERCENTAGE'
                    ? `${enquiryModalOffer.discountValue}% OFF`
                    : `₹${enquiryModalOffer.discountValue} OFF`}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-slate-900 leading-snug">
                Enquire: {enquiryModalOffer.title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Direct enquiry to <span className="font-semibold text-slate-800">{enquiryModalOffer.shop?.name || 'Shop Owner'}</span>
              </p>
            </div>

            {enquirySuccess ? (
              <div className="my-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-5 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h4 className="mt-2 text-base font-bold text-emerald-900">Enquiry Sent to Seller!</h4>
                <p className="mt-1 text-xs text-emerald-700">
                  The store owner has received your offer enquiry and will review it in their dashboard.
                </p>
                {getCleanPhone(enquiryModalOffer.shop?.whatsappNumber || enquiryModalOffer.shop?.phone) && (
                  <a
                    href={`https://wa.me/91${getCleanPhone(
                      enquiryModalOffer.shop?.whatsappNumber || enquiryModalOffer.shop?.phone
                    )}?text=${encodeURIComponent(
                      `Hello ${enquiryModalOffer.shop?.name || 'Store'}, I just submitted an enquiry for offer "${
                        enquiryModalOffer.title
                      }". My name is ${enquiryForm.name} (${enquiryForm.phone}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Continue on WhatsApp Chat</span>
                  </a>
                )}
                <div className="mt-3">
                  <button
                    onClick={() => setEnquiryModalOffer(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="mt-5 space-y-4">
                {enquiryError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                    {enquiryError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Enquiry Message
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Offer Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
