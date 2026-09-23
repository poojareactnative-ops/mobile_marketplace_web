"use client"

import { Star, MessageSquareQuote } from 'lucide-react'

export default function Testimonials({ testimonials }) {
  if (!testimonials || testimonials.length === 0) return null

  const items = testimonials

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <MessageSquareQuote className="h-4 w-4" />
            <span>Customer Stories</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            What Customers Say
          </h2>
        </div>
        <p className="hidden text-sm text-slate-500 sm:block">
          Trusted by 10,000+ local buyers & repair clients
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, idx) => (
          <div
            key={t.id || idx}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed italic">
                “{t.quote || t.text}”
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3">
              <p className="text-sm font-bold text-slate-900">{t.authorName || t.name}</p>
              <p className="text-xs text-slate-500">{t.role || 'Verified Customer'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
