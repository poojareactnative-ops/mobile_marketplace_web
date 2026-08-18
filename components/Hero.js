"use client"

import { MapPin, UserPlus } from 'lucide-react'

export default function Hero({ onFind }) {
  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">Find Mobile Accessories & Repair Near You</h1>
      <p className="text-lg text-slate-600 mt-2">Discover trusted local shops offering accessories and fast repairs within a few kilometers — instant enquiries, real-time offers.</p>

      <div className="flex flex-wrap gap-3 mt-4">
        <button onClick={onFind} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-md hover:-translate-y-0.5 transition">
          <MapPin className="h-4 w-4" />
          <span>Find Nearby Shops</span>
        </button>

        <a href="/register/super-seller" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
          <UserPlus className="h-4 w-4" />
          <span>Register Your Shop</span>
        </a>
      </div>
    </div>
  )
}
