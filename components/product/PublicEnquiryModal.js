import { X, CheckCircle2, Loader2, Send } from 'lucide-react'

export default function PublicEnquiryModal({
  isOpen,
  onClose,
  product,
  enquiryForm,
  setEnquiryForm,
  onSubmit,
  isSubmitting,
  enquirySuccess,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {enquirySuccess ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Enquiry Sent Successfully!</h3>
            <p className="mt-2 text-sm text-slate-500">
              The store owner at <strong>{product.shop?.name}</strong> has received your enquiry
              and will get in touch with you shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Direct Store Enquiry
              </span>
              <h3 className="mt-1 text-xl font-bold text-slate-900">{product.name}</h3>
              <p className="mt-1 text-xs text-slate-500">
                Contacting:{' '}
                <strong className="text-slate-800">{product.shop?.name || 'Local Seller'}</strong>
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Your Message or Question
                </label>
                <textarea
                  rows={3}
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm((s) => ({ ...s, message: e.target.value }))}
                  placeholder="Is this available in stock for today's pickup? Can you install it on my phone?"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? 'Sending…' : 'Send Enquiry'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
