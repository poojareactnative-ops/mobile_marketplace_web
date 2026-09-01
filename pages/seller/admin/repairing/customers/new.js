import { useState } from 'react'
import DashboardLayout from '../../../../../../components/DashboardLayout'
import InputField from '../../../../../../components/InputField'
import repairingService from '../../../../../../../services/repairingService'
import Toast from '../../../../../../../components/Toast'

export default function NewCustomerProblem() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [problem, setProblem] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const item = repairingService.createProblem({
      customerName: name,
      customerPhone: phone,
      brand,
      model,
      problem,
    })
    setTimeout(() => {
      setSaving(false)
      setToast('Problem submitted')
      setTimeout(() => { window.location.href = '/seller/admin/repairing/customers' }, 600)
    }, 250)
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
            <InputField label="Brand" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
            <InputField label="Model" name="model" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Problem Description</label>
            <textarea value={problem} onChange={(e) => setProblem(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm" rows={4} />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => window.history.back()} className="rounded-xl bg-slate-100 px-4 py-2">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">{saving ? 'Saving...' : 'Save Problem'}</button>
          </div>
        </form>
        <Toast message={toast} />
      </div>
    </DashboardLayout>
  )
}
