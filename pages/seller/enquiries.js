"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import apiClient from '../../src/lib/api/client'
import { MessageCircle, CheckCircle2, Loader2, Clock } from 'lucide-react'

export default function EnquiriesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [openIds, setOpenIds] = useState([])

  useEffect(() => {
    loadEnquiries()
  }, [])

  async function loadEnquiries() {
    try {
      const res = await apiClient.get('/seller/enquiries')
      setItems(res.data.data || [])
    } catch (e) {
      console.error('Failed to load enquiries', e)
    } finally {
      setLoading(false)
    }
  }

  async function toggleResolved(id, currentResolved) {
    const nextStatus = currentResolved ? 'NEW' : 'RESPONDED'
    try {
      await apiClient.patch(`/seller/enquiries/${id}`, {
        status: nextStatus,
        responseNote: 'Followed up via telephone / WhatsApp',
      })
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, resolved: !currentResolved, status: nextStatus } : it
        )
      )
    } catch (e) {
      alert('Unable to update enquiry status')
    }
  }

  function toggleOpen(id) {
    setOpenIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Inquiries</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time inquiries submitted by buyers from your product catalogue.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
              <p className="mt-2 text-xs">Loading customer enquiries...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No customer enquiries yet</p>
              <p className="text-xs text-slate-400">When shoppers send inquiries on your products, they will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((it) => (
                <li key={it.id} className="px-5 py-4 transition hover:bg-slate-50/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          it.resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {it.name?.[0] || 'C'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {it.name} • {it.phone}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Inquiry regarding: <span className="font-semibold text-slate-700">{it.interest}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => toggleOpen(it.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {openIds.includes(it.id) ? 'Hide' : 'Read Message'}
                      </button>
                      <button
                        onClick={() => toggleResolved(it.id, it.resolved)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          it.resolved
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                        }`}
                      >
                        {it.resolved ? '✓ Responded' : 'Mark as Responded'}
                      </button>
                    </div>
                  </div>

                  {openIds.includes(it.id) && (
                    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-700 space-y-2">
                      <p className="text-sm font-medium text-slate-800 italic leading-relaxed">
                        "{it.message}"
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>Submitted on {it.date}</span>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}