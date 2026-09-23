import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import DashboardLayout from '../../components/DashboardLayout'
import { ShieldCheck, PlusCircle, Mail, Phone, Calendar } from 'lucide-react'

export default function PlatformAdminsPage() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users?role=ADMIN')
      return res.data?.data || []
    },
  })

  const admins = usersData || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
              <ShieldCheck className="h-4 w-4" />
              Governance & Security
            </div>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Platform Administrators</h1>
            <p className="mt-1 text-sm text-slate-500">Users with system-wide management privileges.</p>
          </div>

          <Link
            href="/admin/admins/new"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700"
          >
            <PlusCircle className="h-4 w-4" />
            Create Admin Account
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No administrators found</h3>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Admin Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{a.name}</td>
                    <td className="px-6 py-4 text-slate-600">{a.email}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                        {a.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
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
