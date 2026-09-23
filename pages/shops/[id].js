import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  PhoneCall,
  ArrowLeft,
  Tag,
  ShoppingBag,
  Sparkles,
  MessageSquare,
} from 'lucide-react'

function formatINR(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function ShopDetailPage() {
  const router = useRouter()
  const { id } = router.query

  const [enquiryProduct, setEnquiryProduct] = useState(null)
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', message: '' })
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: shop, isLoading, error } = useQuery({
    queryKey: ['shop-detail', id],
    queryFn: async () => {
      if (!id) return null
      const res = await apiClient.get(`/public/shops/${id}`)
      return res.data?.data
    },
    enabled: !!id,
  })

  async function handleSendEnquiry(e) {
    e.preventDefault()
    if (!enquiryProduct || !shop) return
    setIsSubmitting(true)
    try {
      await apiClient.post('/enquiries', {
        productId: enquiryProduct.id,
        shopId: shop.id,
        customerName: enquiryForm.name,
        customerPhone: enquiryForm.phone,
        message: enquiryForm.message || `Hi, inquiring about ${enquiryProduct.name} at ${shop.name}.`,
      })
      setEnquirySuccess(true)
      setTimeout(() => {
        setEnquiryProduct(null)
        setEnquirySuccess(false)
        setEnquiryForm({ name: '', phone: '', message: '' })
      }, 2000)
    } catch (err) {
      alert('Failed to send enquiry: ' + (err.response?.data?.error?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-48 rounded-3xl bg-slate-200" />
          <div className="h-64 rounded-3xl bg-slate-200" />
        </div>
      </main>
    )
  }

  if (error || !shop) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Store className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Shop Not Found</h2>
          <p className="mt-1 text-sm text-slate-500">
            The requested store profile does not exist or has been deactivated.
          </p>
          <Link
            href="/shops"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            ← Back to All Shops
          </Link>
        </div>
      </main>
    )
  }

  const initials = shop.name.slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Banner / Store Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/shops"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to nearby stores
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-black text-white shadow-xl shadow-indigo-600/20">
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                    {shop.name}
                  </h1>
                  {shop.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Verified
                    </span>
                  ) : null}
                </div>

                {shop.address ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {shop.address}
                  </p>
                ) : null}

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {shop.rating?.toFixed(1) || '4.8'} ({shop.reviewCount || 30} reviews)
                  </span>
                  {shop.openingHours ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {shop.openingHours}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {shop.phone ? (
                <a
                  href={`tel:${shop.phone}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  <PhoneCall className="h-4 w-4" />
                  Call {shop.phone}
                </a>
              ) : null}
              {shop.type === 'SUPER_SELLER' ? (
                <Link
                  href="/repairs"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Book Repair Service
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Content Body: Active Offers & Catalog */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Active Store Offers */}
        {shop.offers && shop.offers.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Tag className="h-4 w-4" />
              Special Deals & Coupons
            </div>
            <h2 className="mt-1 text-xl font-black text-slate-900">Current Store Offers</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shop.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"
                >
                  <div>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black uppercase text-indigo-600">
                      {offer.discountType === 'PERCENT' ? `${offer.discountValue}% OFF` : 'Special Promo'}
                    </span>
                    <h4 className="mt-3 text-base font-bold text-slate-900">{offer.title}</h4>
                    <p className="mt-1 text-xs text-slate-500">{offer.text || offer.description}</p>
                  </div>
                  {offer.code ? (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-3 py-2">
                      <span className="text-xs text-slate-500 font-medium">Coupon Code:</span>
                      <span className="font-mono text-xs font-bold text-indigo-700">{offer.code}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Store Catalog */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <ShoppingBag className="h-4 w-4" />
            In-Stock Catalog
          </div>
          <h2 className="mt-1 text-xl font-black text-slate-900">Products Available at {shop.name}</h2>

          {!shop.products || shop.products.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">No active products listed currently for this store.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shop.products.map((prod) => {
                const img = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80'
                return (
                  <article
                    key={prod.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-100">
                        <img src={img} alt={prod.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                        {prod.discountPercent ? (
                          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                            {prod.discountPercent}% OFF
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{prod.name}</h4>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900">{formatINR(prod.pricePaise)}</span>
                          {prod.compareAtPricePaise ? (
                            <span className="text-xs text-slate-400 line-through">{formatINR(prod.compareAtPricePaise)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEnquiryProduct(prod)}
                      className="mt-4 w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-indigo-600"
                    >
                      Enquire Stock
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enquiry Modal */}
      {enquiryProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Enquire at {shop.name}</h3>
            <p className="mt-1 text-xs text-slate-500">Product: {enquiryProduct.name} ({formatINR(enquiryProduct.pricePaise)})</p>

            {enquirySuccess ? (
              <div className="my-6 rounded-2xl bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-2 font-bold text-emerald-900">Enquiry Sent!</p>
                <p className="text-xs text-emerald-700">The store owner will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="mt-5 space-y-3">
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
                <input
                  type="tel"
                  required
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  placeholder="Your Phone Number"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
                />
                <textarea
                  rows={3}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  placeholder="Message (e.g. Can you hold one piece for me today?)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnquiryProduct(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  )
}
