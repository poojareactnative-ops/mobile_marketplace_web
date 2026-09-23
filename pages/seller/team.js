import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import apiClient from '../../src/lib/api/client'
import useAuth from '../../src/features/auth/hooks/useAuth'
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Mail,
  Phone,
  Store,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Lock,
  Calendar,
  Sparkles,
  Key,
} from 'lucide-react'

export default function SuperSellerTeam() {
  const queryClient = useQueryClient()
  const { user, shop } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'SELLER_ADMIN',
  })

  // 1. Fetch sellers created by this Super Seller
  const { data: sellers = [], isLoading, refetch } = useQuery({
    queryKey: ['super-seller-team'],
    queryFn: async () => {
      const res = await apiClient.get('/super-seller/sellers')
      return res.data?.data || []
    },
  })

  // 2. Create Seller Mutation
  const createSellerMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/super-seller/sellers', payload)
      return res.data
    },
    onSuccess: (data) => {
      setSuccessMsg(data?.message || 'Seller created successfully!')
      setErrorMsg('')
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'SELLER_ADMIN',
      })
      queryClient.invalidateQueries(['super-seller-team'])
      setTimeout(() => {
        setShowModal(false)
        setSuccessMsg('')
      }, 1500)
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error?.message || err.message || 'Failed to create seller')
    },
  })

  function handleCreateSeller(e) {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    createSellerMutation.mutate(form)
  }

  const isSuperSeller = user?.role === 'SUPER_SELLER' || user?.role === 'PLATFORM_ADMIN'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Super Seller Staff Management</span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Store Sellers & Admins
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage Seller (Admin) accounts authorized to handle inventory, products, and customer orders for <span className="font-semibold text-slate-800">{shop?.name || 'your store'}</span>.
            </p>
          </div>

          {isSuperSeller && (
            <button
              onClick={() => {
                setShowModal(true)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Seller (Admin)</span>
            </button>
          )}
        </div>

        {/* Informative Banner */}
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/80 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Super Seller Hierarchy Privileges
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                As an authorized Super Seller, you can provision <strong>Seller Admins</strong> (with full product and order rights) or standard <strong>Sellers</strong> (sales & dispatch). They will log in using their email and credentials, with their actions linked directly to your store storefront.
              </p>
            </div>
          </div>
        </div>

        {/* Sellers List */}
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm font-semibold text-slate-600">Loading team sellers...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No sellers created yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Click the button below to add your first Seller or Seller Admin to manage your shop's products and enquiries.
            </p>
            {isSuperSeller && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add First Seller Admin</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-bold text-slate-900">
                Registered Team ({sellers.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Seller Name</th>
                    <th className="px-6 py-3.5">Email & Phone</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Store Assignment</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sellers.map((s) => (
                    <tr key={s.id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{s.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {s.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{s.email}</span>
                          </p>
                          {s.phone && (
                            <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{s.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            s.role === 'SELLER_ADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          <span>{s.role === 'SELLER_ADMIN' ? 'Seller Admin' : 'Seller'}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                          <Store className="h-3.5 w-3.5 text-slate-400" />
                          <span>{s.shop?.name || shop?.name || 'Assigned Store'}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{s.status}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Seller / Admin */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create New Seller (Admin)</h3>
                    <p className="text-xs text-slate-500">Super Seller Staff Provisioning</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateSeller} className="mt-4 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. ramesh@store.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Temporary Password *</label>
                  <div className="relative mt-1">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Role & Access Level *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="SELLER_ADMIN">Seller Admin (Full store management, inventory & orders)</option>
                    <option value="SELLER">Store Seller (Inventory update & enquiry response)</option>
                  </select>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                  <p>
                    Store Association: <strong className="text-slate-800">{shop?.name || 'Current Shop'}</strong>
                  </p>
                  <p className="mt-0.5">The created user can immediately log in and manage this storefront.</p>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={createSellerMutation.isLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createSellerMutation.isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Create Seller Account</span>
                      </>
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
