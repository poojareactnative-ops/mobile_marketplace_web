"use client"

import { MapPin, Search, MessageSquare, Repeat, Sparkles } from 'lucide-react'

export default function HowItWorks({ items }) {
  if (!items || items.length === 0) return null

  const steps = items.map((it, idx) => ({
    id: it.id || idx + 1,
    icon: idx === 0 ? MapPin : idx === 1 ? Search : idx === 2 ? MessageSquare : Sparkles,
    title: it.title,
    text: it.description || it.text,
  }))

  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
        <Sparkles className="h-4 w-4" />
        <span>Simple Workflow</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900">How Hyperlocal Mobile Works</h3>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, idx) => {
          const Icon = s.icon
          return (
            <li key={s.id} className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold text-slate-400">STEP {idx + 1}</span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900">{s.title || `Step ${idx + 1}`}</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{s.text}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
