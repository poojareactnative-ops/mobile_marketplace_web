import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import DashboardLayout from '../../components/DashboardLayout'
import { Users, PlusCircle, ShieldCheck, Mail, Phone, Store } from 'lucide-react'

export default function AdminUsersDirectoryPage() {
  const [roleFilter, setRoleFilter] = useState('')

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-all-users', roleFilter],
    queryFn: async () => {
      const param = roleFilter ? `?role=${roleFilter}` : ''
      const res = await apiClient.get(`/admin/users${param}`)
      return res.data?.data || []
    },
  })

  const users = usersData || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
              <Users className="h-4 w-4" />
              Platform Identity
            </div>
            <h1 className="mt-1 text-3xl font-black text-slate-900">User Accounts Directory</h1>
            <p className="mt-1 text-sm text-slate-500">
              All registered customers, sellers, super sellers, and platform administrators.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['', 'CUSTOMER', 'SELLER', 'SUPER_SELLER', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  roleFilter === r
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {r ? r.replace('_', ' ') : 'All Roles'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No users found</h3>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Associated Store</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const roleColors = {
                    ADMIN: 'bg-violet-50 text-violet-700',
                    SUPER_SELLER: 'bg-amber-50 text-amber-700',
                    SELLER: 'bg-indigo-50 text-indigo-700',
                    CUSTOMER: 'bg-slate-100 text-slate-700',
                  }

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4 text-slate-600">{u.phone || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${roleColors[u.role] || 'bg-slate-100'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {u.ownedShops && u.ownedShops.length > 0 ? (
                          <span className="flex items-center gap-1">
                            <Store className="h-3 w-3 text-slate-400" />
                            {u.ownedShops[0].name}
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
