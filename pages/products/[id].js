import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../src/lib/api/client'
import { useAuth } from '../../src/features/auth/hooks/useAuth'
import { ArrowLeft, ChevronRight, Share2, Loader2, AlertTriangle } from 'lucide-react'

import PublicProductGallery from '../../components/product/PublicProductGallery'
import PublicProductInfo from '../../components/product/PublicProductInfo'
import PublicEnquiryModal from '../../components/product/PublicEnquiryModal'

export default function PublicProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  const [selectedImgIndex, setSelectedImgIndex] = useState(0)
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    message: '',
  })
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false)
  const [enquirySuccess, setEnquirySuccess] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // 1. Fetch Product
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['publicProductDetail', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`)
      return res.data?.data
    },
    enabled: !!id,
  })

  function handleShare() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 3000)
    }
  }

  async function handleEnquirySubmit(e) {
    e.preventDefault()
    if (!product) return

    setIsSubmittingEnquiry(true)
    try {
      await apiClient.post('/enquiries', {
        productId: product.id,
        shopId: product.shopId,
        customerName: enquiryForm.name,
        customerPhone: enquiryForm.phone,
        message: enquiryForm.message || `Inquiry about ${product.name}`,
      })
      setEnquirySuccess(true)
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit enquiry. Please try again.')
    } finally {
      setIsSubmittingEnquiry(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Loading product specifications...
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (isError || !product) {
    return (
      <main className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Product Not Available</h1>
          <p className="mt-2 text-sm text-slate-500">
            The item you are looking for may have been sold out or unlisted by the shop.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore Other Products
          </Link>
        </div>
      </main>
    )
  }

  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
      : [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        ]
  const currentImage = images[selectedImgIndex] || images[0]

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-indigo-600">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <Link href="/products" className="hover:text-indigo-600">
                Products
              </Link>
              {product.category?.name && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-slate-700">{product.category.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <Share2 className="h-3.5 w-3.5" />
                {copiedLink ? 'Link Copied!' : 'Share'}
              </button>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* LEFT: Gallery */}
          <div className="lg:col-span-5">
            <PublicProductGallery
              images={images}
              currentImage={currentImage}
              selectedImgIndex={selectedImgIndex}
              setSelectedImgIndex={setSelectedImgIndex}
              product={product}
            />
          </div>

          {/* RIGHT: Info */}
          <PublicProductInfo
            product={product}
            onOpenEnquiry={() => {
              setEnquirySuccess(false)
              setIsEnquiryModalOpen(true)
            }}
          />
        </div>
      </div>

      <PublicEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        product={product}
        enquiryForm={enquiryForm}
        setEnquiryForm={setEnquiryForm}
        onSubmit={handleEnquirySubmit}
        isSubmitting={isSubmittingEnquiry}
        enquirySuccess={enquirySuccess}
      />
    </main>
  )
}
