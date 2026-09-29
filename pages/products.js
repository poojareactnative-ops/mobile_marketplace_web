import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../src/lib/api/client'
import {
  ShoppingBag,
  Search,
  Store,
  MapPin,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Sparkles,
  Lock,
  Navigation,
  Navigation2,
} from 'lucide-react'

function formatINR(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [enquiryProduct, setEnquiryProduct] = useState(null)
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', message: '' })
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data?.data || []
    },
  })

  // Fetch products — re-fetches when location becomes available
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['public-products', searchTerm, selectedCategory, userLocation],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('q', searchTerm)
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (userLocation) {
        params.append('lat', String(userLocation.lat))
        params.append('lng', String(userLocation.lng))
      }
      try {
        const res = await apiClient.get(`/public/products?${params.toString()}`)
        return res.data?.data || []
      } catch (err) {
        try {
          const res = await apiClient.get(`/products?${params.toString()}`)
          return res.data?.data || []
        } catch (e2) {
          const res = await apiClient.get(`/products/featured?${params.toString()}`)
          return res.data?.data || []
        }
      }
    },
  })

  const categories = categoriesData || []
  const products = productsData || []

  async function handleSendEnquiry(e) {
    e.preventDefault()
    if (!enquiryProduct) return
    setIsSubmitting(true)
    try {
      await apiClient.post('/enquiries', {
        productId: enquiryProduct.id,
        shopId: enquiryProduct.shop?.id,
        customerName: enquiryForm.name,
        customerPhone: enquiryForm.phone,
        message:
          enquiryForm.message ||
          `Hi, I am interested in ${enquiryProduct.name}. Is it currently in stock?`,
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Sparkles className="h-4 w-4" />
                Hyperlocal Catalog
              </div>
              <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                Browse Mobile Products &amp; Accessories
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Available right now in verified local stores near you for same-day pickup.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Homepage
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

          {/* Search + Filters */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search accessories, tempered glass, cables, chargers, cases..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  selectedCategory === ''
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5">
                <div className="h-44 w-full rounded-2xl bg-slate-100" />
                <div className="mt-4 h-5 w-3/4 rounded bg-slate-100" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No products found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search or selecting a different category.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('') }}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((prod) => {
              const primaryImg =
                prod.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80'
              return (
                <article
                  key={prod.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-600/5"
                >
                  <div>
                    <Link href={`/products/${prod.id}`} className="block">
                      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                        <img
                          src={primaryImg}
                          alt={prod.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        {prod.discountPercent ? (
                          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-black uppercase text-white shadow-sm">
                            {prod.discountPercent}% OFF
                          </span>
                        ) : null}
                      </div>
                    </Link>

                    <div className="mt-4">
                      {prod.category?.name ? (
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                          {prod.category.name}
                        </span>
                      ) : null}
                      <Link href={`/products/${prod.id}`}>
                        <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition">
                          {prod.name}
                        </h3>
                      </Link>
                      {prod.modelCompatibility ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Fits: <span className="font-semibold text-slate-700">{prod.modelCompatibility}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">{formatINR(prod.pricePaise)}</span>
                      {prod.compareAtPricePaise ? (
                        <span className="text-xs text-slate-400 line-through">{formatINR(prod.compareAtPricePaise)}</span>
                      ) : null}
                    </div>

                    {/* Dynamic Shop Info */}
                    {prod.shop ? (
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <Link
                          href={`/shops/${prod.shop.id}`}
                          className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-indigo-600"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Store className="h-3.5 w-3.5 text-slate-400" />
                            {prod.shop.name}
                          </span>
                          {prod.shop.isVerified ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          ) : null}
                        </Link>

                        {/* Distance badge — only shown when geolocation was granted */}
                        {prod.distanceKm != null && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                            <MapPin className="h-3 w-3 text-indigo-400" />
                            {prod.distanceKm < 1
                              ? `${Math.round(prod.distanceKm * 1000)} m away`
                              : `${prod.distanceKm} km away`}
                          </div>
                        )}
                      </div>
                    ) : null}

                    {prod.isSuperSellerOrAdmin && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Super Seller Verified
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {prod.canReceiveEnquiries !== false ? (
                      <button
                        onClick={() => setEnquiryProduct(prod)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 py-2.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100/70"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Enquire
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Enquiries only for verified Admin/Super Seller products"
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-[11px] font-semibold text-slate-400 cursor-not-allowed"
                      >
                        <Lock className="h-3 w-3 text-slate-400" />
                        Disabled
                      </button>
                    )}
                    {prod.shop?.phone ? (
                      <a
                        href={`tel:${prod.shop.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        Call Shop
                      </a>
                    ) : (
                      <Link
                        href={`/shops/${prod.shop?.id}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"
                      >
                        View Store
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      {enquiryProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Send Enquiry to {enquiryProduct.shop?.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Inquiring about:{' '}
              <span className="font-semibold text-slate-800">{enquiryProduct.name}</span>{' '}
              ({formatINR(enquiryProduct.pricePaise)})
            </p>

            {enquirySuccess ? (
              <div className="my-6 rounded-2xl bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-2 font-bold text-emerald-900">Enquiry Sent Successfully!</p>
                <p className="text-xs text-emerald-700">The seller will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="mt-5 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Message (Optional)</label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Ask about availability, colors, warranties..."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2">
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
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Enquiry'}
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
