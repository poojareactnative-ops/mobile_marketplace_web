"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import {
  Tag,
  Percent,
  Clock,
  Pencil,
  Trash2,
  X,
  Loader2,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertCircle,
  Power,
} from 'lucide-react'
import offerService from '../../src/lib/api/offer.service'

function emptyOffer() {
  return {
    id: '',
    title: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startsAt: '',
    endsAt: '',
    status: 'ACTIVE',
  }
}

export default function SellerOffers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyOffer())
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    loadOffers()
  }, [statusFilter])

  async function loadOffers() {
    setLoading(true)
    try {
      const res = await offerService.getOffers({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      })
      setOffers(res.items || [])
    } catch (e) {
      console.error('Failed to load offers', e)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setForm(emptyOffer())
    setEditing(null)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  function openEdit(o) {
    setForm({
      id: o.id,
      title: o.title || '',
      discountType: o.discountType || 'PERCENTAGE',
      discountValue: o.discountValue ?? 10,
      startsAt: o.startsAt ? o.startsAt.slice(0, 10) : '',
      endsAt: o.endsAt ? o.endsAt.slice(0, 10) : '',
      status: o.status || 'ACTIVE',
    })
    setEditing(o.id)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim() || form.title.trim().length < 2) {
      setErrorMsg('Offer title must be at least 2 characters')
      return
    }
    if (form.discountValue < 0) {
      setErrorMsg('Discount value must be non-negative')
      return
    }

    setSaving(true)
    setErrorMsg('')

    try {
      if (editing) {
        await offerService.updateOffer(editing, {
          title: form.title.trim(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          status: form.status,
        })
        setToastMessage('Offer updated successfully!')
      } else {
        await offerService.createOffer({
          title: form.title.trim(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          status: form.status,
        })
        setToastMessage('Offer created successfully!')
      }

      await loadOffers()
      setIsModalOpen(false)
      setTimeout(() => setToastMessage(''), 3500)
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(offer) {
    const nextStatus = offer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await offerService.updateOffer(offer.id, { status: nextStatus })
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, status: nextStatus } : o))
      )
      setToastMessage(`Offer marked as ${nextStatus}`)
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      alert('Failed to update offer status')
    }
  }

  async function remove(id) {
    if (!confirm('Are you sure you want to delete this offer?')) return
    try {
      await offerService.deleteOffer(id)
      setOffers((prev) => prev.filter((o) => o.id !== id))
      setToastMessage('Offer deleted')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      alert('Unable to delete offer')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Promotional Campaigns</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Promotions &amp; Customer Offers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage running discount offers displayed on the marketplace and storefront banners.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>New Offer</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s === 'ALL' ? 'All Offers' : s}
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-xs font-semibold">Loading promotions...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Tag className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No offers found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Launch discount deals to attract shoppers and increase foot traffic.
            </p>
            <button
              onClick={openNew}
              className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
            >
              Create Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => {
              const isActive = offer.status === 'ACTIVE'
              const isFixed = offer.discountType === 'FIXED'

              return (
                <div
                  key={offer.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Type and Actions */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                        <Percent className="h-3 w-3" />
                        <span>{isFixed ? `₹${offer.discountValue} FLAT OFF` : `${offer.discountValue}% OFF`}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(offer)}
                          title={isActive ? 'Deactivate' : 'Activate'}
                          className={`rounded-lg p-1.5 transition ${
                            isActive
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(offer)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(offer.id)}
                          title="Delete"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 text-base font-black text-slate-900 leading-snug">
                      {offer.title}
                    </h3>

                    {/* Timeline */}
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {offer.startsAt
                          ? new Date(offer.startsAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Ongoing'}{' '}
                        —{' '}
                        {offer.endsAt
                          ? new Date(offer.endsAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'No expiry'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-400">Campaign Status</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        offer.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : offer.status === 'EXPIRED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal: Create / Edit Offer */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {editing ? 'Edit Offer' : 'Create New Campaign Offer'}
                    </h2>
                    <p className="text-xs text-slate-400">Discount &amp; Promotion configuration</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offer Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    placeholder="e.g. Diwalil Festive 20% OFF on all screen protectors"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm((s) => ({ ...s, discountType: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {form.discountType === 'FIXED' ? 'Flat Rupees (₹)' : 'Percent (%)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, discountValue: Math.max(0, Number(e.target.value)) }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={form.startsAt}
                      onChange={(e) => setForm((s) => ({ ...s, startsAt: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.endsAt}
                      onChange={(e) => setForm((s) => ({ ...s, endsAt: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE (Live in marketplace)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                    <option value="EXPIRED">EXPIRED (Archived)</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editing ? 'Update Offer' : 'Create Offer'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
