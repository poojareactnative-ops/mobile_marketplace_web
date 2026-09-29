import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../src/lib/api/client'
import {
  Tag,
  Percent,
  Sparkles,
  Store,
  MessageSquare,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  X,
  PhoneCall,
  MapPin,
  Navigation,
  Navigation2,
} from 'lucide-react'

export default function PublicOffersPage() {
  const [copiedCode, setCopiedCode] = useState(null)
  const [enquiryOffer, setEnquiryOffer] = useState(null)
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    message: 'Hello, I would like to inquire about this running offer and how to redeem it.',
  })
  const [userLocation, setUserLocation] = useState(null)       // { lat, lng }
  const [locationStatus, setLocationStatus] = useState('idle') // idle | requesting | granted | denied

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied')
      return
    }
    setLocationStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationStatus('granted')
      },
      () => setLocationStatus('denied'),
      { timeout: 8000 }
    )
  }, [])

  // Fetch all active running offers — re-fetches when location is known
  const { data: offersData, isLoading } = useQuery({
    queryKey: ['running-offers', userLocation],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (userLocation) {
        params.append('lat', String(userLocation.lat))
        params.append('lng', String(userLocation.lng))
      }
      try {
        const res = await apiClient.get(`/public/offers/running?${params.toString()}`)
        return res.data?.data || []
      } catch (err) {
        const res = await apiClient.get(`/offers?${params.toString()}`)
        return res.data?.data || []
      }
    },
    enabled: locationStatus !== 'requesting',
    staleTime: 10000,
  })

  const offers = offersData || []

  function copyCode(code) {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  async function handleSendEnquiry(e) {
    e.preventDefault()
    if (!enquiryOffer) return
    setIsSubmitting(true)
    try {
      await apiClient.post('/enquiries', {
        offerId: enquiryOffer.id,
        shopId: enquiryOffer.shop?.id,
        customerName: enquiryForm.name,
        customerPhone: enquiryForm.phone,
        message: enquiryForm.message,
      })
      setEnquirySuccess(true)
      setTimeout(() => {
        setEnquirySuccess(false)
        setEnquiryOffer(null)
        setEnquiryForm({
          name: '',
          phone: '',
          message: 'Hello, I would like to inquire about this running offer and how to redeem it.',
        })
      }, 2500)
    } catch (err) {
      alert('Failed to send enquiry: ' + (err.response?.data?.error?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
                <Tag className="h-3.5 w-3.5" />
                <span>Verified Store Deals</span>
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Running Offers &amp; Promotional Discounts
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 leading-relaxed">
                Discover limited-time offers, discounts, and package deals from verified Super Sellers
                and authorized phone repair stores. Enquire directly about any running offer!
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Marketplace
            </Link>
          </div>

          {/* Location Status Banner */}
          <div className="mt-5">
            {locationStatus === 'granted' && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                <Navigation2 className="h-3.5 w-3.5 text-emerald-500" />
                Sorted by nearest stores to your location
              </div>
            )}
            {locationStatus === 'denied' && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
                <Navigation className="h-3.5 w-3.5 text-slate-400" />
                Enable location for nearest-store results — showing most recent instead
              </div>
            )}
            {locationStatus === 'requesting' && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-medium text-indigo-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                Getting your location…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading || locationStatus === 'requesting' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Tag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No running offers at the moment</h3>
            <p className="mt-1 text-sm text-slate-500">
              Check back soon! Verified Super Sellers regularly post seasonal discounts and repair promotions.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
            >
              Browse Products &amp; Accessories
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const isSuperSeller =
                offer.shop?.type === 'SUPER_SELLER' ||
                offer.shop?.ownerUser?.role === 'SUPER_SELLER' ||
                offer.shop?.ownerUser?.role === 'ADMIN'

              return (
                <div
                  key={offer.id}
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-600/5"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black uppercase text-indigo-700">
                        <Sparkles className="h-3 w-3 text-indigo-500" />
                        {offer.discountType === 'PERCENT'
                          ? `${offer.discountValue}% OFF`
                          : offer.discountType === 'FLAT'
                          ? `₹${offer.discountValue} FLAT OFF`
                          : 'BUY 1 GET 1'}
                      </span>
                      {isSuperSeller && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          <ShieldCheck className="h-3 w-3 text-amber-500" />
                          Super Seller
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-4 text-xl font-bold text-slate-900 leading-snug">{offer.title}</h3>
                    {offer.text && (
                      <p className="mt-1 text-xs font-semibold text-indigo-600">{offer.text}</p>
                    )}
                    {offer.description && (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">{offer.description}</p>
                    )}

                    {/* Promo Code */}
                    {offer.code && (
                      <div className="mt-4 flex items-center justify-between rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-2.5">
                        <span className="font-mono text-sm font-black tracking-wider text-indigo-700">
                          {offer.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCode(offer.code)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          {copiedCode === offer.code ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                          )}
                          {copiedCode === offer.code ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Store Info & Actions */}
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    {offer.shop && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <Link
                            href={`/shops/${offer.shop.id}`}
                            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-indigo-600"
                          >
                            <Store className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{offer.shop.name}</span>
                          </Link>
                          {offer.shop.phone && (
                            <a
                              href={`tel:${offer.shop.phone}`}
                              className="text-slate-400 hover:text-indigo-600"
                              title="Call Store"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Distance badge — only shown when location is granted */}
                        {offer.distanceKm != null && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                            <MapPin className="h-3 w-3 text-indigo-400" />
                            {offer.distanceKm < 1
                              ? `${Math.round(offer.distanceKm * 1000)} m away`
                              : `${offer.distanceKm} km away`}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEnquiryOffer(offer)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 py-2.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100/80 active:scale-95"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Enquire on Offer
                      </button>
                      <Link
                        href={`/offers/${offer.id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"
                      >
                        View Deal
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      {enquiryOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enquire About Running Offer</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Store: <span className="font-semibold text-slate-800">{enquiryOffer.shop?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setEnquiryOffer(null)}
                className="rounded-xl bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs">
              <p className="font-bold text-indigo-900">{enquiryOffer.title}</p>
              {enquiryOffer.code && (
                <p className="mt-0.5 font-mono text-[11px] font-semibold text-indigo-700">
                  Code: {enquiryOffer.code}
                </p>
              )}
            </div>

            {enquirySuccess ? (
              <div className="my-6 rounded-2xl bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-2 font-bold text-emerald-900">Offer Enquiry Sent!</p>
                <p className="text-xs text-emerald-700">The store will contact you with details.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Message / Question</label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Ask about terms, eligibility, or stock for this offer..."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnquiryOffer(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3.5 w-3.5" />
                        Submit Enquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
