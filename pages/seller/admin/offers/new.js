"use client"

import DashboardLayout from '../../../../components/DashboardLayout'
import { useState } from 'react'

export default function NewOffer() {
  const [title, setTitle] = useState('')
  function submit(e){ e.preventDefault(); alert('Offer created: '+title) }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Create Offer</h1>
        <form onSubmit={submit} className="rounded-2xl border bg-white p-6">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Offer title" className="w-full rounded-md border px-3 py-2" />
          <div className="mt-4"><button className="rounded-md bg-indigo-600 px-4 py-2 text-white">Create</button></div>
        </form>
      </div>
    </DashboardLayout>
  )
}
