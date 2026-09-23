import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import DashboardLayout from '../../../components/DashboardLayout'
import apiClient from '../../../src/lib/api/client'
import { Users, ArrowLeft } from 'lucide-react'

export default function NewCustomer() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await apiClient.post('/admin/users', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'CUSTOMER',
      })
      alert('Successfully created customer account!')
      router.push('/admin/customers')
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <Link href="/admin/customers" className="inline-flex items-center gap-1 text-xs font-bold text-violet-600">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>

        <div>
          <h1 className="text-2xl font-black text-slate-900">Add New Customer</h1>
          <p className="text-xs text-slate-500">Register a new customer profile into the platform database.</p>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Full Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Priya Sharma"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. priya@gmail.com"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Phone Number (Optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Customer...' : 'Save Customer Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
