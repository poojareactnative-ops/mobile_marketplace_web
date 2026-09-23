import { useState } from 'react'
import DashboardLayout from '../../../../../components/DashboardLayout'
import InputField from '../../../../../components/InputField'
import Toast from '../../../../../components/Toast'
import apiClient from '../../../../../src/lib/api/client'

export default function NewCustomerProblem() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [problem, setProblem] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      await apiClient.post('/seller/repair-jobs', {
        customerName: name,
        customerPhone: phone,
        brand: brand || null,
        model: model || null,
        problemDescription: problem,
      })
      setSaving(false)
      setToast('Repair ticket created successfully')
      setTimeout(() => {
        window.location.href = '/seller/admin/repairing/customers'
      }, 600)
    } catch (err) {
      setSaving(false)
      setToast(err.response?.data?.error?.message || 'Unable to submit problem')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Add Repairing Problem</h1>
        <p className="text-sm text-slate-500 mt-1">Submit a customer's mobile repair problem.</p>

        <form className="mt-6 space-y-4 max-w-2xl" onSubmit={handleSubmit}>
          <InputField label="Customer Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <InputField label="Mobile Number" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Brand" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Apple, Samsung, etc." />
            <InputField label="Model" name="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="iPhone 15, S24, etc." />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Problem Description</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              rows={4}
              required
              placeholder="Describe the issue in detail (e.g. cracked screen, won't turn on, water damage)..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => window.history.back()} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-75">
              {saving ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </form>
        <Toast message={toast} />
      </div>
    </DashboardLayout>
  )
}
