"use client"

import { MapPin, UserPlus, Loader2 } from 'lucide-react'

export default function Hero({ onFind, hero, isLocating }) {
  const title = hero?.title || 'Mobile repairs and accessories, nearby'
  const subtitle =
    hero?.subtitle ||
    'Compare trusted local sellers, request fast repairs, and get genuine accessories within a few kilometers.'
  const ctaLabel = hero?.ctaLabel || 'Find Nearby Shops'

  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 mb-3">
        <span>⚡ Hyperlocal Mobile Marketplace</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-slate-900">
        {title}
      </h1>

      <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
        {subtitle}
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          onClick={onFind}
          disabled={isLocating}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-indigo-500/30 transition disabled:opacity-75"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          <span>{isLocating ? 'Detecting Location...' : ctaLabel}</span>
        </button>

        <a
          href="/register/super-seller"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white/80 text-slate-700 font-semibold hover:bg-slate-100 hover:border-slate-300 transition"
        >
          <UserPlus className="h-4 w-4 text-slate-500" />
          <span>Seller Portal</span>
        </a>
      </div>
    </div>
  )
}
