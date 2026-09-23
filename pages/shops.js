import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../src/lib/api/client'
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  PhoneCall,
  Navigation,
  Sparkles,
  Sliders,
  ArrowRight,
  Wrench,
  ShoppingBag,
} from 'lucide-react'

export default function ShopsPage() {
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 }) // Default central coords
  const [radiusMeters, setRadiusMeters] = useState(5000)
  const [locating, setLocating] = useState(false)

  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['nearby-shops', coords.lat, coords.lng, radiusMeters],
    queryFn: async () => {
      const res = await apiClient.get(`/shops/nearby?lat=${coords.lat}&lng=${coords.lng}&radiusMeters=${radiusMeters}`)
      return res.data?.data || []
    },
  })

  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        console.warn('Geolocation failed:', err)
        setLocating(false)
        alert('Could not retrieve your location. Using Bangalore default.')
      }
    )
  }

  const shops = shopsData || []

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                <Sparkles className="h-4 w-4" />
                Hyperlocal Discovery
              </div>
              <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
                Find Mobile Stores & Repair Centers Nearby
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Verified local storefronts offering same-day device repairs, genuine accessories, and quick pickup.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Homepage
            </Link>
          </div>

          {/* Controls: Geolocation + Radius Slider */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLocateMe}
                disabled={locating}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Navigation className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
                {locating ? 'Detecting...' : 'Use My GPS Location'}
              </button>
              <span className="text-xs text-slate-500">
                Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">Radius:</span>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="h-2 w-32 cursor-pointer rounded-lg bg-slate-200 accent-indigo-600 sm:w-48"
              />
              <span className="min-w-[4rem] text-xs font-bold text-indigo-600">
                {(radiusMeters / 1000).toFixed(1)} km
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stores List */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6">
                <div className="h-6 w-3/4 rounded bg-slate-100" />
                <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-10 w-full rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No stores found within {(radiusMeters / 1000).toFixed(1)} km</h3>
            <p className="mt-1 text-sm text-slate-500">
              Try increasing the search radius slider to see shops in surrounding neighborhoods.
            </p>
            <button
              onClick={() => setRadiusMeters(10000)}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Expand to 10 km
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => {
              const distanceKm = (shop.distanceMeters / 1000).toFixed(1)
              const isSuperSeller = shop.type === 'SUPER_SELLER'

              return (
                <article
                  key={shop.id}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-600/5"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                          isSuperSeller
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {isSuperSeller ? <Wrench className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                        {isSuperSeller ? 'Sales & Repair Center' : 'Accessory Store'}
                      </span>

                      <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                        <MapPin className="h-3.5 w-3.5" />
                        {distanceKm} km away
                      </span>
                    </div>

                    {/* Shop Name & Verified */}
                    <div className="mt-4 flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition">
                        {shop.name}
                      </h3>
                      {shop.isVerified ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" title="Verified Store" />
                      ) : null}
                    </div>

                    {/* Address & Hours */}
                    {shop.address ? (
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                        {shop.address}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {shop.rating?.toFixed(1) || '4.8'}
                        <span className="font-normal text-slate-400">({shop.reviewCount || 24})</span>
                      </div>
                      {shop.openingHours ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {shop.openingHours}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <Link
                      href={`/shops/${shop.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"
                    >
                      View Catalog
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    {shop.phone ? (
                      <a
                        href={`tel:${shop.phone}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                        title="Call shop"
                      >
                        <PhoneCall className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
