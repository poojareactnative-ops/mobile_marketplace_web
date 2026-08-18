"use client"

import { useState } from 'react'
import {
  ShoppingCart,
  Star,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  ChevronRight,
  Zap,
  ShieldCheck,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react'

const SAMPLE_PRODUCTS = [
 
  {
    id: 'p2',
    name: 'Fast Charging USB-C Cable',
    price: 299,
    oldPrice: 499,
    discount: 40,
    rating: 4.8,
    reviews: 245,
    distance: '1.3 km',
    seller: 'Tech World',
    category: 'Charging',
    stock: 'In Stock',

    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1200&auto=format&fit=crop',
    ],
  },

  {
    id: 'p3',
    name: 'Premium Wireless Earbuds',
    price: 1299,
    oldPrice: 1999,
    discount: 35,
    rating: 4.5,
    reviews: 389,
    distance: '2.1 km',
    seller: 'Sound House',
    category: 'Audio',
    stock: 'Only 3 left',

    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1588423771078-cb3a4b7a6c3f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?q=80&w=1200&auto=format&fit=crop',
    ],
  },

  {
    id: 'p4',
    name: '20W Fast Charging Adapter',
    price: 699,
    oldPrice: 999,
    discount: 30,
    rating: 4.7,
    reviews: 176,
    distance: '1.7 km',
    seller: 'Quick Charge Store',
    category: 'Chargers',
    stock: 'In Stock',

    images: [
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1609592424823-8d0b0c5c0e3d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop',
    ],
  },

  

  {
    id: 'p6',
    name: 'Smart Watch Series 8',
    price: 2499,
    oldPrice: 3999,
    discount: 37,
    rating: 4.6,
    reviews: 213,
    distance: '3.2 km',
    seller: 'Smart Gadgets',
    category: 'Wearables',
    stock: 'In Stock',

    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1200&auto=format&fit=crop',
    ],
  },
]

export default function ProductShowcase() {
  return (
    <section className="py-10">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-600" />

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Near You
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Popular Products Nearby
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Shop from trusted sellers around your location
          </p>
        </div>

        <a
          href="/products"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
        >
          View all products

          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </a>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {SAMPLE_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product }) {
  const [activeImage, setActiveImage] = useState(0)

  const nextImage = () => {
    setActiveImage((current) =>
      current === product.images.length - 1 ? 0 : current + 1
    )
  }

  const previousImage = () => {
    setActiveImage((current) =>
      current === 0 ? product.images.length - 1 : current - 1
    )
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50">
      {/* Image Gallery */}
      <div className="relative h-72 overflow-hidden bg-slate-100">
        <img
          src={product.images[activeImage]}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

        {/* Discount */}
        <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          {product.discount}% OFF
        </div>

        {/* Wishlist */}
        <button
          type="button"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-lg backdrop-blur transition hover:text-red-500"
        >
          <Heart className="h-5 w-5" />
        </button>

        {/* Previous */}
        <button
          type="button"
          onClick={previousImage}
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={nextImage}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        {/* Quick View */}
        <button
          type="button"
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 translate-y-10 items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-xs font-bold text-slate-800 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="h-4 w-4" />
          Quick View
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3 scrollbar-hide">
        {product.images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(index)}
            className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${
              activeImage === index
                ? 'border-indigo-600'
                : 'border-transparent hover:border-slate-300'
            }`}
          >
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Product Details */}
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            {product.category}
          </span>

          <span
            className={`text-[11px] font-semibold ${
              product.stock === 'In Stock'
                ? 'text-emerald-600'
                : 'text-orange-500'
            }`}
          >
            {product.stock}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-slate-900">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

            <span className="text-xs font-bold text-amber-700">
              {product.rating}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Seller */}
        <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
            </div>

            <span className="truncate text-xs font-medium text-slate-600">
              {product.seller}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5" />
            {product.distance}
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end gap-2">
          <span className="text-2xl font-extrabold text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>

          <span className="mb-1 text-sm text-slate-400 line-through">
            ₹{product.oldPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Cart */}
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            className="group/cart flex h-8 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <ShoppingCart className="h-5 w-5 transition group-hover/cart:scale-110" />

            Send Inquiry
          </button>

          
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <Zap className="h-3.5 w-3.5 text-amber-500" />

          Nearby seller • Quick pickup available
        </div>
      </div>
    </article>
  )
}