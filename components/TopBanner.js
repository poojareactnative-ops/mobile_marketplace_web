"use client"

import { useEffect, useState } from 'react'
import {
  Tag,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Zap,
  Store,
  Percent,
} from 'lucide-react'

export default function TopBanner({ banner, offers, shops }) {
  if (banner && banner.isVisible === false) {
    return null
  }

  const offerList = offers || []
  const shopList =
    shops && shops.length > 0
      ? shops.slice(0, 3).map((s) => ({
          id: s.id,
          name: s.name,
          rating: s.rating || 4.8,
          distance: s.distanceKm || (s.distanceMeters ? `${(s.distanceMeters / 1000).toFixed(1)} km` : 'Near you'),
          initials: s.name.slice(0, 2).toUpperCase(),
        }))
      : []

  if (offerList.length === 0 && shopList.length === 0) {
    return null
  }

  const [activeOffer, setActiveOffer] = useState(0)

  const nextOffer = () => {
    setActiveOffer((current) =>
      current >= offerList.length - 1 ? 0 : current + 1
    )
  }

  const previousOffer = () => {
    setActiveOffer((current) =>
      current === 0 ? offerList.length - 1 : current - 1
    )
  }

  // Auto carousel
  useEffect(() => {
    if (offerList.length <= 1) return
    const timer = setInterval(() => {
      setActiveOffer((current) =>
        current >= offerList.length - 1 ? 0 : current + 1
      )
    }, 5000)

    return () => clearInterval(timer)
  }, [offerList.length])

  const offer = offerList[activeOffer] || offerList[0]

  return (
    <section className="mb-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Background */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative grid lg:grid-cols-[1fr_360px]">
          {/* ================================================= */}
          {/* OFFER CAROUSEL */}
          {/* ================================================= */}

          <div className="min-w-0 p-5 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20">
                  <Tag className="h-5 w-5" />

                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Running Offers
                    </h2>

                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-500">
                      Hot Deals
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {banner?.text || 'Exclusive offers from nearby sellers'}
                  </p>
                </div>
              </div>

              {/* Carousel controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previousOffer}
                  aria-label="Previous offer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={nextOffer}
                  aria-label="Next offer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Carousel */}
            {offer ? (
              <>
                <div className="relative mt-5 overflow-hidden rounded-2xl">
                  <OfferSlide
                    key={offer.id}
                    offer={offer}
                  />
                </div>

                {offerList.length > 1 && (
                  <div className="mt-5 flex items-center justify-center gap-2">
                    {offerList.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveOffer(index)}
                        aria-label={`Show offer ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeOffer === index
                            ? 'w-7 bg-indigo-600'
                            : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                <Tag className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No active promotional discounts right now</p>
                <p className="mt-1 text-[11px] text-slate-400">Nearby sellers post limited-time deals and coupons here.</p>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* TOP SHOPS */}
          {/* ================================================= */}

          <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-indigo-600" />

                  <h3 className="text-sm font-bold text-slate-900">
                    Top Shops Nearby
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Highly rated sellers around you
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {shopList.map((shop, index) => (
                <ShopRow
                  key={shop.id}
                  shop={shop}
                  index={index}
                />
              ))}
            </div>

            <a
              href="/shops"
              className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-indigo-600"
            >
              <MapPin className="h-4 w-4" />

              Explore Nearby Shops

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================= */
/* OFFER SLIDE */
/* ================================================= */

function OfferSlide({ offer }) {
  const theme = {
    indigo: {
      background: 'from-indigo-50 via-white to-indigo-100/70',
      icon: 'bg-indigo-600',
      text: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-700',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      border: 'border-indigo-100',
    },

    violet: {
      background: 'from-violet-50 via-white to-violet-100/70',
      icon: 'bg-violet-600',
      text: 'text-violet-600',
      badge: 'bg-violet-100 text-violet-700',
      button: 'bg-violet-600 hover:bg-violet-700',
      border: 'border-violet-100',
    },

    rose: {
      background: 'from-rose-50 via-white to-rose-100/70',
      icon: 'bg-rose-500',
      text: 'text-rose-600',
      badge: 'bg-rose-100 text-rose-700',
      button: 'bg-rose-500 hover:bg-rose-600',
      border: 'border-rose-100',
    },

    cyan: {
      background: 'from-cyan-50 via-white to-cyan-100/70',
      icon: 'bg-cyan-600',
      text: 'text-cyan-600',
      badge: 'bg-cyan-100 text-cyan-700',
      button: 'bg-cyan-600 hover:bg-cyan-700',
      border: 'border-cyan-100',
    },
  }

  const styles = theme[offer.color]

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.background} p-5 sm:p-7`}
    >
      {/* Decorative */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/70" />

      <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/40 blur-2xl" />

      <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        {/* Left */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg ${styles.icon}`}
            >
              <Percent className="h-5 w-5" />
            </div>

            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
            >
              Limited Time
            </span>

            <span className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold text-slate-500">
              <Clock className="h-3 w-3" />
              Ends {offer.expires}
            </span>
          </div>

          <div className="mt-5">
            <p
              className={`text-xs font-bold uppercase tracking-[0.2em] ${styles.text}`}
            >
              {offer.text}
            </p>

            <h3 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {offer.title}
            </h3>

            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
              {offer.description}
            </p>
          </div>

          {/* Shop information */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                <Store className={`h-4 w-4 ${styles.text}`} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  {offer.shop}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {offer.rating}
                  </span>

                  <span>•</span>

                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {offer.distance}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200" />

            {/* Coupon */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Code
              </span>

              <span className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 font-mono text-xs font-bold text-slate-700">
                {offer.code}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="relative">
          <a
            href={`/offers/${offer.id}`}
            className={`group flex min-w-[160px] items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition ${styles.button}`}
          >
            Grab This Deal

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <div className="mt-3 flex items-center justify-center gap-1 text-[10px] font-medium text-slate-400">
            <Zap className="h-3 w-3 text-amber-500" />
            Available nearby
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================= */
/* SHOP ROW */
/* ================================================= */

function ShopRow({ shop, index }) {
  return (
    <a
      href={`/shops/${shop.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 transition duration-200 hover:border-indigo-100 hover:shadow-md"
    >
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md">
          {shop.initials}
        </div>

        {index === 0 && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400">
            <Zap className="h-2.5 w-2.5 fill-white text-white" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-bold text-slate-800 group-hover:text-indigo-600">
          {shop.name}
        </h4>

        <div className="mt-1 flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            <Star className="h-3 w-3 fill-amber-400" />
            {shop.rating}
          </span>

          <span className="text-slate-300">•</span>

          <span className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            {shop.distance}
          </span>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
    </a>
  )
}