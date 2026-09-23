import { useState } from 'react'
import { X, CheckCircle2, Loader2 } from 'lucide-react'
import apiClient from '../../src/lib/api/client'

export default function InquiryModal({ product, onClose }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(
    `Hi, is ${product.name} available for same-day pickup at ${product.seller}?`
  )
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await apiClient.post('/enquiries', {
        productId: product.id,
        shopId: product.shopId,
        customerName: name,
        customerPhone: phone,
        message,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Unable to submit enquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Enquiry Sent!</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your inquiry has been sent to <strong>{product.seller || 'the store'}</strong>. The
              store owner will contact you via phone or WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Direct Seller Enquiry
              </span>
              <h3 className="mt-1 text-lg font-bold text-slate-900 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500">
                Seller: <strong className="text-slate-700">{product.seller || 'Verified Shop'}</strong>
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Enquiry Message</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-75"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{submitting ? 'Sending...' : 'Send Enquiry'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
