import { useEffect, useState } from 'react'
import { MapPin, Search, CheckCircle2 } from 'lucide-react'
import SellerCard from '../components/SellerCard'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'
import ProductShowcase from '../components/ProductShowcase'
import TopBanner from '../components/TopBanner'

export default function Home() {
  const [location, setLocation] = useState(null)
  const [radius, setRadius] = useState(2500)
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function findNearby() {
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }

        setLocation(loc)
      },
      (err) => {
        setError(err.message || 'Failed to get your location.')
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
      }
    )
  }

  useEffect(() => {
    if (!location) return

    setLoading(true)
    setError(null)

    fetch(
      `/api/sellers?lat=${location.lat}&lng=${location.lng}&radius=${radius}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch nearby shops')
        }

        return response.json()
      })
      .then((data) => {
        setSellers(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        setError(e.message || 'Something went wrong')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [location, radius])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Top banner */}
        <TopBanner />

        {/* Hero + Nearby Shops */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

          {/* Hero */}
          <div className="animate-float overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6">

              <Hero onFind={findNearby} />

              {/* Radius */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label
                    htmlFor="radius"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Search Radius
                  </label>

                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                    {Math.round(radius / 100) / 10} km
                  </span>
                </div>

                <input
                  id="radius"
                  type="range"
                  min={500}
                  max={5000}
                  step={250}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
                />

                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>500 m</span>
                  <span>5 km</span>
                </div>
              </div>

            </div>
          </div>

          {/* Nearby Shops */}
          <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Nearby Shops
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Find trusted shops around you
                </p>
              </div>

              {location && (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Initial State */}
            {!location && !error && !loading && (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-xl text-blue-600">
                  <MapPin className="h-6 w-6" />
                </div>

                <p className="text-sm font-medium text-slate-700">
                  Discover shops near you
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                  Click "Find Nearby Shops" to detect your location and find
                  mobile shops around you.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex min-h-[180px] flex-col items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Finding nearby shops...
                </p>
              </div>
            )}

            {/* Shops */}
            {!loading && location && sellers.length > 0 && (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {sellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >
                    <SellerCard seller={seller} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && location && sellers.length === 0 && (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 text-center">
                <div className="mb-3 text-3xl text-slate-400">
                    <Search className="h-8 w-8" />
                  </div>

                <p className="text-sm font-semibold text-slate-700">
                  No shops found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try increasing your search radius.
                </p>
              </div>
            )}

          </div>
        </section>

        {/* Product Showcase */}
        <section className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <ProductShowcase />
        </section>

        {/* How It Works */}
        {/* <section className="mt-8 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <HowItWorks />
        </section> */}

        {/* Features */}
        {/* <section className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <Features />
        </section> */}

        {/* Testimonials */}
        {/* <section className="mt-6 rounded-3xl border border-white/70 bg-white/60 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
          <Testimonials />
        </section> */}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}