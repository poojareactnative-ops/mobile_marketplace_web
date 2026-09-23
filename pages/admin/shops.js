import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import DashboardLayout from '../../components/DashboardLayout'
import { Store, Search, CheckCircle2, Clock, MapPin, PhoneCall, ShieldCheck, Power } from 'lucide-react'

export default function AdminShopsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['admin-all-shops', searchTerm],
    queryFn: async () => {
      const param = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''
      const res = await apiClient.get(`/admin/shops${param}`)
      return res.data?.data || []
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async ({ shopId, isVerified }) => {
      return apiClient.patch(`/admin/shops/${shopId}/verify`, { isVerified })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-shops'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
  })

  const activeMutation = useMutation({
    mutationFn: async ({ shopId, isActive }) => {
      return apiClient.patch(`/admin/shops/${shopId}/active`, { isActive })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-shops'] })
    },
  })

  const shops = shopsData || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
              <Store className="h-4 w-4" />
              Store Governance
            </div>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Manage Network Shops</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review and approve storefronts, toggle verification badges, and monitor activity.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by store or address..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No stores found</h3>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Store Name & Location</th>
                  <th className="px-6 py-4">Specialty</th>
                  <th className="px-6 py-4">Owner Contact</th>
                  <th className="px-6 py-4">Catalog / Activity</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        {s.isVerified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {s.address || 'Bangalore Central'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        {s.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-slate-800">{s.ownerUser?.name || 'Owner'}</p>
                      <p className="text-slate-400">{s.ownerUser?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {s._count?.products || 0} items • {s._count?.repairJobs || 0} repairs
                    </td>
                    <td className="px-6 py-4">
                      {s.isVerified ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => verifyMutation.mutate({ shopId: s.id, isVerified: !s.isVerified })}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            s.isVerified
                              ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                          }`}
                        >
                          {s.isVerified ? 'Revoke' : 'Approve'}
                        </button>
                        <Link
                          href={`/shops/${s.id}`}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Preview
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
