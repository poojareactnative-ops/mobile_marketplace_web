"use client"

import { CheckCircle2, ShieldCheck, Tag, Zap, Star } from 'lucide-react'

export default function Features({ items }) {
  const list = items || []
  if (list.length === 0) return null

  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
        <ShieldCheck className="h-4 w-4" />
        <span>Platform Highlights</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900">Why Choose Hyperlocal Mobile</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((it, idx) => (
          <div key={it.id || idx} className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">{it.title}</h4>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{it.description || it.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
