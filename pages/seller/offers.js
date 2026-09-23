"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import InputField from '../../components/InputField'
import { Tag, Star, MapPin, ArrowRight, Clock, Percent, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import apiClient from '../../src/lib/api/client'

const THEME = {
  indigo: { bg: 'from-indigo-50 via-white to-indigo-100/70', icon: 'bg-indigo-600', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', button: 'bg-indigo-600 hover:bg-indigo-700', border: 'border-indigo-100' },
  violet: { bg: 'from-violet-50 via-white to-violet-100/70', icon: 'bg-violet-600', text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', button: 'bg-violet-600 hover:bg-violet-700', border: 'border-violet-100' },
  rose: { bg: 'from-rose-50 via-white to-rose-100/70', icon: 'bg-rose-500', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700', button: 'bg-rose-500 hover:bg-rose-600', border: 'border-rose-100' },
  cyan: { bg: 'from-cyan-50 via-white to-cyan-100/70', icon: 'bg-cyan-600', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700', button: 'bg-cyan-600 hover:bg-cyan-700', border: 'border-cyan-100' },
}

function OfferCard({ offer, onEdit, onDelete }) {
  const styles = THEME[offer.themeColor || offer.color] || THEME.indigo

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.bg} p-5 sm:p-6 shadow-sm transition hover:shadow-md`}> 
      <div className="absolute right-3 top-3 flex gap-2">
        <button onClick={() => onEdit(offer)} className="rounded-md bg-white/90 p-1.5 text-xs text-slate-600 hover:bg-white shadow-sm">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(offer.id)} className="rounded-md bg-white/90 p-1.5 text-xs text-rose-600 hover:bg-white shadow-sm">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${styles.icon}`}>
              <Percent className="h-5 w-5" />
            </div>

            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${styles.text}`}>{offer.text || 'SPECIAL DEAL'}</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-900">{offer.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{offer.description}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            {offer.code && (
              <span className="rounded-lg border border-dashed border-slate-300 bg-white px-2 py-0.5 font-mono font-bold text-slate-700">
                {offer.code}
              </span>
            )}
            <span className="font-semibold text-emerald-600 uppercase text-[10px]">
              {offer.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function emptyOffer() {
  return { id: '', title: '', text: '', description: '', code: '', themeColor: 'indigo', discountValue: 10, discountType: 'PERCENT' }
}

export default function SellerOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyOffer())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOffers()
  }, [])

  async function loadOffers() {
    try {
      const res = await apiClient.get('/seller/offers')
      setOffers(res.data.data || [])
    } catch (e) {
      console.error('Failed to load offers', e)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setForm(emptyOffer())
    setEditing(null)
    setIsModalOpen(true)
  }

  function openEdit(o) {
    setForm(o)
    setEditing(o.id)
    setIsModalOpen(true)
  }

  async function save() {
    if (!form.title.trim()) return
    setSaving(true)

    try {
      if (editing) {
        await apiClient.patch(`/seller/offers/${editing}`, form)
      } else {
        await apiClient.post('/seller/offers', form)
      }
      await loadOffers()
      setIsModalOpen(false)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this offer?')) return
    try {
      await apiClient.delete(`/seller/offers/${id}`)
      setOffers((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      alert('Unable to delete offer')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Promotions & Deals</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live promotional offers displayed on your public shop and banner.
            </p>
          </div>

          <div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Tag className="h-4 w-4" /> Add Offer
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
            <p className="mt-2 text-xs">Loading active offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Tag className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-2 font-bold text-slate-800">No active offers</h3>
            <p className="text-xs text-slate-400 mt-1">Create promotional deals to attract nearby shoppers.</p>
            <button onClick={openNew} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} onEdit={openEdit} onDelete={remove} />
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {editing ? 'Edit Offer' : 'Create New Offer'}
              </h2>

              <div className="space-y-3">
                <InputField
                  label="Title (e.g. 10% OFF, BUY 1 GET 1)"
                  name="title"
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  required
                />
                <InputField
                  label="Subtext (e.g. Screen Protectors)"
                  name="text"
                  value={form.text || ''}
                  onChange={(e) => setForm((s) => ({ ...s, text: e.target.value }))}
                />
                <InputField
                  label="Promo Code (e.g. GLASS10)"
                  name="code"
                  value={form.code || ''}
                  onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description || ''}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm outline-none focus:border-indigo-400 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Theme Color</label>
                    <select
                      value={form.themeColor || 'indigo'}
                      onChange={(e) => setForm((s) => ({ ...s, themeColor: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none"
                    >
                      <option value="indigo">Indigo</option>
                      <option value="violet">Violet</option>
                      <option value="rose">Rose</option>
                      <option value="cyan">Cyan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      value={form.discountValue || 10}
                      onChange={(e) => setForm((s) => ({ ...s, discountValue: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{editing ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
