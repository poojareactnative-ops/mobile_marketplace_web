"use client"

import DashboardLayout from '../../../components/DashboardLayout'
import { useState } from 'react'

export default function NewAdmin() {
  const [form, setForm] = useState({ name: '', email: '' })

  function submit(e) {
    e.preventDefault()
    alert('Created admin: ' + form.name)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Add a new administrator account.</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full name" className="rounded-md border px-3 py-2" />
            <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email" className="rounded-md border px-3 py-2" />
          </div>
          <div className="mt-4">
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Create Admin</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
