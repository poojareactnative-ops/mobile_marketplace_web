"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import apiClient from '../../src/lib/api/client'
import { Store, ShieldCheck, Phone, MapPin, Clock, Loader2, Save } from 'lucide-react'

export default function SellerProfilePage() {
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    openingHours: '',
    description: '',
  })

  useEffect(() => {
    loadShop()
  }, [])

  async function loadShop() {
    try {
      const res = await apiClient.get('/seller/shop')
      const s = res.data.data
      setShop(s)
      setForm({
        name: s.name || '',
        phone: s.phone || '',
        address: s.address || '',
        openingHours: s.openingHours || '',
        description: s.description || '',
      })
    } catch (e) {
      console.error('Failed to load shop profile', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await apiClient.patch('/seller/shop', form)
      setShop(res.data.data)
      setToast('Shop profile updated successfully!')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      alert('Failed to update shop profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-slate-500">Loading shop profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
            Shop Management
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            Shop Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your storefront details visible to nearby buyers.
          </p>
        </div>

        {toast && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700">
            {toast}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white shadow-lg shadow-indigo-600/20">
              {shop?.name?.slice(0, 2).toUpperCase() || 'SM'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{shop?.name}</h2>
                {shop?.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Owner: {shop?.ownerUser?.name} ({shop?.ownerUser?.email})
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Business Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Complete Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => setForm((s) => ({ ...s, openingHours: e.target.value }))}
                  placeholder="9:00 AM - 9:00 PM"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Shop Bio / Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition disabled:opacity-75"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
