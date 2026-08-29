"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import InputField from '../../components/InputField'

const STORAGE_KEY = 'product_inquiries_v1'

function sample() {
  return [
    { id: 'q1', name: 'Amit', phone: '9001112233', location: '0.8 km', interest: 'Screen Protector', message: 'Do you have curved-edge protectors?', date: '2026-08-19', resolved: false },
    { id: 'q2', name: 'Neha', phone: '9002223344', location: '1.2 km', interest: 'Battery Replacement', message: 'How long is the warranty?', date: '2026-08-18', resolved: true },
  ]
}

export default function EnquiriesPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', phone: '', location: '', interest: '', message: '' })
  const [openIds, setOpenIds] = useState([])

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); setItems(raw ? JSON.parse(raw) : sample()) } catch (e) { setItems(sample()) }
  }, [])

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch (e) {} }, [items])

  function addInquiry(e) {
    e.preventDefault()
    const id = `inq_${Date.now()}`
    setItems((s) => [{ ...form, id, date: new Date().toISOString().slice(0,10), resolved: false }, ...s])
    setForm({ name: '', phone: '', location: '', interest: '', message: '' })
  }

  function toggleResolved(id) {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, resolved: !it.resolved } : it)))
  }

  function remove(id) {
    if (!confirm('Delete inquiry?')) return
    setItems((s) => s.filter((it) => it.id !== id))
  }

  function toggleOpen(id) {
    setOpenIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Inquiries</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage customer enquiries about products and services.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
          
            <div className="overflow-hidden rounded-2xl border bg-white">
              <ul className="divide-y divide-slate-100">
                {items.map((it) => (
                  <li key={it.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-md flex items-center justify-center text-sm font-bold ${it.resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-600'}`}>{it.name?.[0]}</div>
                        <div>
                          <div className="font-semibold text-slate-900">{it.name} • {it.phone}</div>
                          <div className="mt-1 text-xs text-slate-500">{it.interest} — {it.location}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleOpen(it.id)} className="text-sm text-slate-500">{openIds.includes(it.id) ? 'Hide' : 'View'}</button>
                        <button onClick={() => toggleResolved(it.id)} className={`rounded-md px-3 py-1 text-sm font-medium ${it.resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>{it.resolved ? 'Resolved' : 'Mark Resolved'}</button>
                        <button onClick={() => remove(it.id)} className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600">Delete</button>
                      </div>
                    </div>

                    {openIds.includes(it.id) && (
                      <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                        <div>{it.message}</div>
                        <div className="mt-2 text-xs text-slate-400">{it.date}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          
        </div>
      </div>
    </DashboardLayout>
  )
}