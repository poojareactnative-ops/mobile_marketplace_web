"use client"

import DashboardLayout from '../../../../components/DashboardLayout'
import { useState } from 'react'

export default function NewCustomer() {
  const [form, setForm] = useState({ name: '', phone: '' })
  function submit(e) { e.preventDefault(); alert('Added '+form.name) }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">New Customer</h1>
        <form onSubmit={submit} className="rounded-2xl border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Full name" className="rounded-md border px-3 py-2" />
            <input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} placeholder="Phone" className="rounded-md border px-3 py-2" />
          </div>
          <div className="mt-4"><button className="rounded-md bg-indigo-600 px-4 py-2 text-white">Add Customer</button></div>
        </form>
      </div>
    </DashboardLayout>
  )
}
