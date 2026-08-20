"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import InputField from '../../components/InputField'
import { Tag, Star, MapPin, ArrowRight, Clock, Percent, Store, Zap, Pencil, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'seller_offers_v1'

const DEFAULT_OFFERS = [
  { id: 'o1', title: '10% OFF', text: 'Screen Protectors', description: 'Get 10% discount on premium tempered glass.', expires: 'Today', shop: 'Pooja Mobile', distance: '0.7 km', rating: 4.8, code: 'GLASS10', color: 'indigo' },
  { id: 'o2', title: 'BUY 1 GET 1', text: 'USB-C Cables', description: 'Buy one premium USB-C cable and get another free.', expires: '2 days', shop: 'QuickFix Repairs', distance: '1.1 km', rating: 4.7, code: 'CABLEBOGO', color: 'violet' },
]

const THEME = {
  indigo: { bg: 'from-indigo-50 via-white to-indigo-100/70', icon: 'bg-indigo-600', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', button: 'bg-indigo-600 hover:bg-indigo-700', border: 'border-indigo-100' },
  violet: { bg: 'from-violet-50 via-white to-violet-100/70', icon: 'bg-violet-600', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', button: 'bg-violet-600 hover:bg-violet-700', border: 'border-violet-100' },
  rose: { bg: 'from-rose-50 via-white to-rose-100/70', icon: 'bg-rose-500', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', button: 'bg-rose-500 hover:bg-rose-600', border: 'border-rose-100' },
  cyan: { bg: 'from-cyan-50 via-white to-cyan-100/70', icon: 'bg-cyan-600', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700', button: 'bg-cyan-600 hover:bg-cyan-700', border: 'border-cyan-100' },
}

function OfferCard({ offer, onEdit, onDelete }) {
  const styles = THEME[offer.color] || THEME.indigo

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.bg} p-5 sm:p-6`}> 
      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
        <button onClick={() => onEdit(offer)} className="rounded-md bg-white/90 px-2 py-1 text-xs"> <Pencil className="h-3.5 w-3.5 text-slate-600" /> </button>
        <button onClick={() => onDelete(offer.id)} className="rounded-md bg-white/90 px-2 py-1 text-xs"> <Trash2 className="h-3.5 w-3.5 text-red-600" /> </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${styles.icon}`}>
              <Percent className="h-5 w-5" />
            </div>

            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${styles.text}`}>{offer.text}</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">{offer.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{offer.description}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{offer.rating}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{offer.distance}</span>
            <span className="ml-2 rounded-lg border border-dashed border-slate-300 bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-700">{offer.code}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <a href={`/offers/${offer.id}`} className={`group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg ${styles.button}`}>
            View
            <ArrowRight className="h-4 w-4" />
          </a>

          <div className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />Ends {offer.expires}</div>
        </div>
      </div>
    </div>
  )
}

function emptyOffer() {
  return { id: '', title: '', text: '', description: '', expires: '', shop: '', distance: '', rating: 0, code: '', color: 'indigo' }
}

export default function SellerOffers() {
  const [offers, setOffers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyOffer())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setOffers(raw ? JSON.parse(raw) : DEFAULT_OFFERS)
    } catch (e) { setOffers(DEFAULT_OFFERS) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(offers)) } catch (e) {}
  }, [offers])

  function openNew() { setForm(emptyOffer()); setEditing(null); setIsModalOpen(true) }
  function openEdit(o) { setForm(o); setEditing(o.id); setIsModalOpen(true) }

  function save() {
    if (!form.title) return
    if (editing) {
      setOffers((prev) => prev.map((it) => (it.id === editing ? { ...form } : it)))
    } else {
      const id = `offer_${Date.now()}`
      setOffers((prev) => [{ ...form, id }, ...prev])
    }
    setIsModalOpen(false)
  }

  function remove(id) {
    if (!confirm('Delete this offer?')) return
    setOffers((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Offers</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and view active offers for your shop.</p>
          </div>

          <div>
            <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
              <Tag className="h-4 w-4" /> Add Offer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {offers.map((o) => (
            <div key={o.id} className="group relative">
              <OfferCard offer={o} onEdit={openEdit} onDelete={remove} />
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold">{editing ? 'Edit Offer' : 'Add Offer'}</h3>
              <div className="mt-4 grid gap-3">
                <InputField label="Title" name="title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Offer title" />
                <InputField label="Short text" name="text" value={form.text} onChange={(e) => setForm((s) => ({ ...s, text: e.target.value }))} placeholder="Short label" />
                <InputField label="Description" name="description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} placeholder="Description" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Expires" name="expires" value={form.expires} onChange={(e) => setForm((s) => ({ ...s, expires: e.target.value }))} placeholder="When it ends" />
                  <InputField label="Shop" name="shop" value={form.shop} onChange={(e) => setForm((s) => ({ ...s, shop: e.target.value }))} placeholder="Shop name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Distance" name="distance" value={form.distance} onChange={(e) => setForm((s) => ({ ...s, distance: e.target.value }))} placeholder="e.g. 1.2 km" />
                  <InputField label="Rating" name="rating" type="number" value={form.rating} onChange={(e) => setForm((s) => ({ ...s, rating: Number(e.target.value) }))} placeholder="Rating" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Code" name="code" value={form.code} onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))} placeholder="Coupon code" />
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Color</label>
                    <select value={form.color} onChange={(e) => setForm((s) => ({ ...s, color: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none">
                      <option value="indigo">Indigo</option>
                      <option value="violet">Violet</option>
                      <option value="rose">Rose</option>
                      <option value="cyan">Cyan</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border border-slate-200">Cancel</button>
                <button type="button" onClick={save} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

