"use client"

import './globals.css'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  MapPin,
  Sliders,
  Phone,
  Store,
  ShieldCheck,
  Star,
  Sparkles,
  AlertCircle,
  Loader2,
  Compass,
} from 'lucide-react'
import TopBanner from '../../components/TopBanner'
import Navbar from '../components/navigation/Navbar'
import Hero from '../../components/Hero'
import ActiveOffersSection from '../../components/ActiveOffersSection'
import ProductShowcase from '../../components/ProductShowcase'
import HowItWorks from '../../components/HowItWorks'
import Features from '../../components/Features'
import Testimonials from '../../components/Testimonials'
import Footer from '../../components/Footer'
import apiClient, { getAccessToken } from '../lib/api/client'
import { useAuth } from '../features/auth/hooks/useAuth'
import { getDashboardRedirect } from '../config/routes.config'

export default function Page() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const hasToken = typeof window !== 'undefined' ? !!getAccessToken() : false

  // Restrict authenticated users from landing page
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getDashboardRedirect(user.role))
    }
  }, [isAuthenticated, user, router])

  // Geolocation & Radius search state
  const [radiusMeters, setRadiusMeters] = useState(2500)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9716, // Default Bangalore city center
    lng: 77.5946,
  })
  const [locating, setLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<
    'default' | 'granted' | 'denied' | 'unsupported'
  >('default')

  // 1. Fetch Landing Page Content
  const { data: landingData } = useQuery({
    queryKey: ['landingPage'],
    queryFn: async () => {
      const res = await apiClient.get('/public/landing-page')
      return res.data.data
    },
    staleTime: 5000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  // 2. Fetch Nearby Shops based on dynamic radius & location
  const {
    data: nearbyShops = [],
    isLoading: isShopsLoading,
    isFetching: isShopsFetching,
    refetch: refetchShops,
  } = useQuery({
    queryKey: ['nearbyShops', location.lat, location.lng, radiusMeters, selectedType],
    queryFn: async () => {
      const params: Record<string, any> = {
        lat: location.lat,
        lng: location.lng,
        radiusMeters,
      }
      if (selectedType !== 'ALL') {
        params.type = selectedType
      }
      const res = await apiClient.get('/shops/nearby', { params })
      return res.data.data
    },
    staleTime: 30000,
  })

  // Browser Geolocation trigger
  function handleDetectLocation() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationStatus('unsupported')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLocationStatus('granted')
        setLocating(false)
      },
      (err) => {
        console.warn('Geolocation access failed or denied:', err)
        setLocationStatus('denied')
        setLocating(false)
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const radiusFormatted =
    radiusMeters >= 1000
      ? `${(radiusMeters / 1000).toFixed(1)} km`
      : `${radiusMeters} m`

  // Prevent landing page from rendering for authenticated users
  if (hasToken && (isLoading || isAuthenticated)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-xl animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-300">
          Redirecting to your dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TopBanner
          banner={landingData?.topBanner}
          offers={landingData?.offers || landingData?.featuredOffers}
          shops={nearbyShops}
        />

        {/* Hero & Discovery Section */}
        <section id="hero" className="grid gap-6 lg:grid-cols-[1.2fr_1fr] items-start">
          {/* Left: Dynamic Hero Content & Search Controls */}
          <div
            id="hero-section"
            className="overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8"
          >
            <Hero
              onFind={handleDetectLocation}
              hero={landingData?.hero}
              isLocating={locating}
            />

            {/* Interactive Search Radius Slider */}
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  <label
                    htmlFor="radius"
                    className="text-sm font-bold text-slate-800"
                  >
                    Search Radius Limit
                  </label>
                </div>
                <span className="rounded-lg bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600">
                  {radiusFormatted}
                </span>
              </div>

              <input
                id="radius"
                type="range"
                min={500}
                max={10000}
                step={250}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
              />

              <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
                <span>500 m</span>
                <span>2.5 km</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>

              {/* Shop Type Filter */}
              <div className="mt-5 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedType('ALL')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${selectedType === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  All Shops
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('SUPER_SELLER')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${selectedType === 'SUPER_SELLER'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Super Sellers (Repairs + Parts)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('ACCESSORY_SELLER')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${selectedType === 'ACCESSORY_SELLER'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Accessory Sellers
                </button>
              </div>

              {/* Geolocation status helper */}
              {locationStatus === 'denied' && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Location permission was denied. Showing verified shops around central Bangalore. You can adjust the radius slider above.
                  </span>
                </div>
              )}

              {locationStatus === 'granted' && (
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <Compass className="h-3.5 w-3.5" />
                  <span>GPS location active. Showing shops calculated from your position.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Dynamic Nearby Shops Panel */}
          <div
            id="shops"
            className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-7"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Store className="h-5 w-5 text-indigo-600" />
                  <span>Nearby Mobile Shops</span>
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Verified sellers within {radiusFormatted}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {nearbyShops.length} Found
              </span>
            </div>

            {/* Loading State */}
            {isShopsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Calculating nearby shops...
                </p>
              </div>
            ) : nearbyShops.length === 0 ? (
              /* Empty State */
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center mt-4">
                <Store className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  No shops found within {radiusFormatted}
                </p>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Try expanding the search radius slider on the left to discover more shops across the city.
                </p>
                <button
                  onClick={() => setRadiusMeters((r) => Math.min(10000, r + 2000))}
                  className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition"
                >
                  Expand Radius to{' '}
                  {radiusMeters + 2000 >= 1000
                    ? `${((radiusMeters + 2000) / 1000).toFixed(1)} km`
                    : `${radiusMeters + 2000} m`}
                </button>
              </div>
            ) : (
              /* Dynamic Shops List */
              <div className="mt-4 space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                {nearbyShops.map((shop: any) => (
                  <div
                    key={shop.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 leading-tight">
                            {shop.name}
                          </h3>
                          {shop.isVerified && (
                            <span title="Verified Shop">
                              <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {shop.address}
                        </p>
                      </div>

                      {/* Distance pill */}
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        {shop.distanceMeters < 1000
                          ? `${shop.distanceMeters} m`
                          : `${(shop.distanceMeters / 1000).toFixed(1)} km`}
                      </span>
                    </div>

                    {/* Services Tags */}
                    {shop.services && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {shop.services.map((svc: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer / Meta */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{shop.rating}</span>
                        <span className="text-slate-400">
                          ({shop.reviewCount})
                        </span>
                      </div>

                      {shop.phone && (
                        <a
                          href={`tel:${shop.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 font-bold text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Contact Shop</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Active Deals & Running Offers */}
        <ActiveOffersSection offers={landingData?.offers || []} />

        {/* Featured Products */}
        <section
          id="products"
          className="mt-10 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-8"
        >
          <ProductShowcase />
        </section>

        {/* How It Works */}
        <section
          id="how"
          className="mt-10 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-8"
        >
          <HowItWorks items={landingData?.howItWorks} />
        </section>

        {/* Features */}
        <section
          id="features"
          className="mt-10 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-8"
        >
          <Features items={landingData?.features} />
        </section>

        {/* Dynamic Testimonials */}
        <section
          id="testimonials"
          className="mt-10 rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:p-8"
        >
          <Testimonials testimonials={landingData?.testimonials} />
        </section>
      </main>

      <Footer />
    </div>
  )
}
