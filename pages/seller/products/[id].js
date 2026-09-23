import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../../components/DashboardLayout'
import apiClient from '../../../src/lib/api/client'
import { useAuth } from '../../../src/features/auth/hooks/useAuth'
import {
  Package,
  ArrowLeft,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { SellerProductSpecs, SellerProductControls } from '../../../components/seller/SellerProductView'
import DeleteProductModal from '../../../components/seller/DeleteProductModal'

export default function SellerProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [selectedImgIndex, setSelectedImgIndex] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isPlatformStaff = user?.role === 'ADMIN' || user?.role === 'PLATFORM_ADMIN'
  const backHref = isPlatformStaff ? '/admin/products' : '/seller/products'
  const editHref = isPlatformStaff ? `/admin/products/${id}/edit` : `/seller/products/${id}/edit`

  // 1. Fetch Product Details
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['sellerProductDetail', id],
    queryFn: async () => {
      const res = await apiClient.get(`/seller/products/${id}`)
      return res.data?.data
    },
    enabled: !!id,
  })

  // 2. Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async (status) => apiClient.patch(`/seller/products/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProductDetail', id] })
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
    },
  })

  const updateStockMutation = useMutation({
    mutationFn: async (stock) =>
      apiClient.patch(`/seller/products/${id}`, { stock: Math.max(0, stock) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProductDetail', id] })
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => apiClient.delete(`/seller/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
      router.push(backHref)
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading product inventory record…</p>
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !product) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
          <Package className="h-12 w-12 text-slate-300" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
            <p className="mt-1 text-xs text-slate-500">
              The product you are requesting may have been deleted or does not belong to your shop.
            </p>
          </div>
          <Link
            href={backHref}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            Back to Inventory
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
    : []
  const currentImage = images[selectedImgIndex] || images[0]

  const statusColors = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    DRAFT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    INACTIVE: 'bg-slate-100 text-slate-700 ring-slate-400/20',
    OUT_OF_STOCK: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-16">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href={backHref} className="transition hover:text-indigo-600">
                Products
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="truncate text-slate-700">{product.name}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{product.name}</h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                  statusColors[product.status] || statusColors.ACTIVE
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {product.status || 'ACTIVE'}
              </span>
              {product.isSuperSellerOrAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Super Seller Item
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/products/${product.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Customer View
            </Link>
            <Link
              href={editHref}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Product
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          <SellerProductSpecs
            product={product}
            images={images}
            currentImage={currentImage}
            selectedImgIndex={selectedImgIndex}
            setSelectedImgIndex={setSelectedImgIndex}
          />
          <SellerProductControls
            product={product}
            onUpdateStatus={(st) => updateStatusMutation.mutate(st)}
            onUpdateStock={(stk) => updateStockMutation.mutate(stk)}
            isStatusLoading={updateStatusMutation.isPending}
            isStockLoading={updateStockMutation.isPending}
          />
        </div>

        <DeleteProductModal
          product={showDeleteModal ? product : null}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate()}
          isPending={deleteMutation.isPending}
        />
      </div>
    </DashboardLayout>
  )
}
