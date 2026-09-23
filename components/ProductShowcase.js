"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingCart,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Package,
  X,
  Sparkles,
} from 'lucide-react'
import apiClient from '../src/lib/api/client'
import ProductCard from './product-showcase/ProductCard'
import QuickViewModal from './product-showcase/QuickViewModal'
import InquiryModal from './product-showcase/InquiryModal'

export default function ProductShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [inquiryModal, setInquiryModal] = useState(null)

  // 1. Fetch Dynamic Active Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data?.data || []
    },
    staleTime: 60000,
  })

  // 2. Fetch Dynamic Products with filters
  const {
    data: apiProducts,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['featuredProducts', selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('limit', '12')
      if (selectedCategory && selectedCategory !== 'ALL') {
        params.append('categoryId', selectedCategory)
      }
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim())
      }
      if (sortBy) {
        params.append('sortBy', sortBy)
      }
      const res = await apiClient.get(`/products/featured?${params.toString()}`)
      return res.data?.data || []
    },
    staleTime: 30000,
  })

  const rawProducts = apiProducts || []
  const products = rawProducts.map((p) => {
    const isSuperSellerOrAdmin =
      p.shop?.ownerUser?.role === 'SUPER_SELLER' ||
      p.shop?.ownerUser?.role === 'ADMIN' ||
      p.shop?.ownerUser?.role === 'PLATFORM_ADMIN'

    return {
      id: p.id,
      name: p.name,
      price: p.priceFormatted || (p.pricePaise ? p.pricePaise / 100 : 0),
      oldPrice: p.compareAtPriceFormatted || (p.compareAtPricePaise ? p.compareAtPricePaise / 100 : null),
      priceFormatted: p.priceFormatted,
      compareAtPriceFormatted: p.compareAtPriceFormatted,
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 0,
      seller: p.shop?.name || 'Local Store',
      shopId: p.shopId,
      shopAddress: p.shop?.address,
      shopPhone: p.shop?.phone,
      category: p.category?.name || p.category || 'Accessories',
      categoryId: p.categoryId,
      brand: p.brand || '',
      condition: p.condition || 'New',
      warranty: p.warranty || '',
      images: Array.isArray(p.images)
        ? p.images.map((img) => (typeof img === 'string' ? img : img.url))
        : [],
      discountPercent: p.discountPercent || 0,
      stock: p.stock ?? 10,
      features: p.features || '',
      description: p.description || '',
      modelCompatibility: p.modelCompatibility || '',
      isSuperSellerOrAdmin,
      canReceiveEnquiries: p.canReceiveEnquiries !== undefined ? p.canReceiveEnquiries : isSuperSellerOrAdmin,
    }
  })

  const dynamicCategories = categoriesData || []
  const categoriesList = [
    { id: 'ALL', name: 'All Accessories' },
    ...dynamicCategories.map((c) => ({ id: c.id, name: c.name })),
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Bangalore Live Verified Inventory</span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Genuine Mobile Accessories &amp; Spare Parts
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Directly listed by nearby certified repair shops. Verified stocks, genuine warranty, and same-day pickup.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
        >
          <span>View All in Store</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-slate-200/60">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accessories (e.g. 9H Glass, Fast Charger, ANC Earbuds)..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-400"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid or States */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-slate-100 bg-slate-50 p-4 space-y-4"
            >
              <div className="h-52 w-full rounded-2xl bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-8 w-full rounded bg-slate-200 mt-2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center">
          <Package className="h-12 w-12 text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-800">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No accessories match your filters'
              : 'No featured products published yet'}
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'Try adjusting your search terms or picking another category.'
              : 'Local store inventories will appear here automatically when verified sellers list items.'}
          </p>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL')
                setSearchQuery('')
              }}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenQuickView={(p) => setQuickViewProduct(p)}
              onOpenInquiry={(p) => setInquiryModal(p)}
            />
          ))}
        </div>
      )}

      {/* Explore Full Marketplace Bottom Bar */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 p-5 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Looking for more parts, models, or screen replacements?
            </h4>
            <p className="text-xs text-slate-500">
              Browse the complete live catalogue across all verified local repair shops in Bangalore.
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition active:scale-95"
        >
          <span>Explore Full Catalogue</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onEnquire={(p) => {
            setQuickViewProduct(null)
            setInquiryModal(p)
          }}
        />
      )}

      {/* Customer Direct Enquiry Modal */}
      {inquiryModal && (
        <InquiryModal product={inquiryModal} onClose={() => setInquiryModal(null)} />
      )}
    </section>
  )
}