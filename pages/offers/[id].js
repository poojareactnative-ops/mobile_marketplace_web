import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import {
  Tag,
  ArrowLeft,
  Store,
  PhoneCall,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  X,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'

export default function OfferDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [copied, setCopied] = useState(false)
  const [showEnquiryModal, setShowEnquiryModal] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    message: 'Hello, I would like to inquire about this running offer and how to redeem it.',
  })

  const { data: offer, isLoading, error } = useQuery({
    queryKey: ['offer-detail', id],
    queryFn: async () => {
      if (!id) return null
      try {
        const res = await apiClient.get(`/offers/${id}`)
        return res.data?.data
      } catch (err) {
        const res = await apiClient.get(`/public/offers/${id}`)
        return res.data?.data
      }
    },
    enabled: !!id,
  })

  function copyCode(code) {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSendEnquiry(e) {
    e.preventDefault()
    if (!offer) return
    setIsSubmitting(true)
    try {
      await apiClient.post('/enquiries', {
        offerId: offer.id,
        shopId: offer.shop?.id,
        customerName: enquiryForm.name,
        customerPhone: enquiryForm.phone,
        message: enquiryForm.message,
      })
      setEnquirySuccess(true)
      setTimeout(() => {
        setEnquirySuccess(false)
        setShowEnquiryModal(false)
        setEnquiryForm({
          name: '',
          phone: '',
          message: 'Hello, I would like to inquire about this running offer and how to redeem it.',
        })
      }, 2500)
    } catch (err) {
      alert('Failed to send enquiry: ' + (err.response?.data?.error?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-2xl animate-pulse space-y-6">
          <div className="h-64 rounded-3xl bg-slate-200" />
        </div>
      </main>
    )
  }

  if (error || !offer) {
    return (
      <main className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Tag className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Offer Not Found</h2>
          <p className="mt-1 text-sm text-slate-500">This promotional offer may have expired or is no longer valid.</p>
          <Link href="/offers" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
            ← Explore Running Offers
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 text-white sm:p-10">
          <Link href="/offers" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to running offers
          </Link>

          <div className="mt-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {offer.discountType === 'PERCENT' ? `${offer.discountValue}% DISCOUNT` : 'PROMOTIONAL DEAL'}
            </span>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{offer.title}</h1>
            {offer.text ? <p className="mt-2 text-sm text-indigo-100 leading-relaxed">{offer.text}</p> : null}
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-6">
          {offer.code ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Coupon Code</p>
              <div className="mt-2 flex items-center justify-between rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-4">
                <span className="font-mono text-xl font-black tracking-widest text-indigo-700">{offer.code}</span>
                <button
                  onClick={() => copyCode(offer.code)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-indigo-50 transition"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          ) : null}

          {offer.description ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Offer Details</p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">
                {offer.description}
              </p>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Send Enquiry for this Offer</span>
            </button>

            {offer.shop?.phone ? (
              <a
                href={`tel:${offer.shop.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                <PhoneCall className="h-4 w-4 text-indigo-600" />
                <span>Call Store</span>
              </a>
            ) : null}
          </div>

          {offer.shop ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Redeemable at Store</p>
                  <h3 className="text-base font-bold text-slate-900">{offer.shop.name}</h3>
                  {offer.shop.address ? <p className="mt-1 text-xs text-slate-500">{offer.shop.address}</p> : null}
                </div>

                <Link
                  href={`/shops/${offer.shop.id}`}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition"
                >
                  View Store
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enquire About This Deal</h3>
                <p className="mt-0.5 text-xs text-slate-500">{offer.shop?.name}</p>
              </div>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="rounded-xl bg-slate-100 p-1.5 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {enquirySuccess ? (
              <div className="my-6 rounded-2xl bg-emerald-50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-2 font-bold text-emerald-900">Offer Enquiry Sent Successfully!</p>
                <p className="text-xs text-emerald-700">The store will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Message / Question</label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Submit Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
