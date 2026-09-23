import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import DashboardLayout from '../../components/DashboardLayout'
import { Users, PlusCircle, Mail, Phone, Calendar, ArrowRight } from 'lucide-react'

export default function AdminCustomersPage() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users?role=CUSTOMER')
      return res.data?.data || []
    },
  })

  const customers = usersData || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
              <Users className="h-4 w-4" />
              Platform Directory
            </div>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Customer Accounts</h1>
            <p className="mt-1 text-sm text-slate-500">Registered platform customers and shoppers.</p>
          </div>

          <Link
            href="/admin/customers/new"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700"
          >
            <PlusCircle className="h-4 w-4" />
            Add Customer
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No customers registered yet</h3>
            <p className="mt-1 text-sm text-slate-500">When customers sign up or place enquiries, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-slate-600">{c.email}</td>
                    <td className="px-6 py-4 text-slate-600">{c.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
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
