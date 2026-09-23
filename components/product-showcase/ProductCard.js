import { useState } from 'react'
import {
  Package,
  Eye,
  Check,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Lock,
} from 'lucide-react'

export default function ProductCard({ product, onOpenQuickView, onOpenInquiry }) {
  const [activeImage, setActiveImage] = useState(0)
  const images = product.images?.length > 0 ? product.images : []

  const priceFormatted =
    product.priceFormatted || `₹${Number(product.price).toLocaleString('en-IN')}`
  const oldPriceFormatted =
    product.compareAtPriceFormatted ||
    (product.oldPrice ? `₹${Number(product.oldPrice).toLocaleString('en-IN')}` : null)
  const discount = product.discountPercent || product.discount || 0
  const stock = typeof product.stock === 'number' ? product.stock : 10

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl">
      {/* Image Gallery */}
      <div className="relative h-60 overflow-hidden bg-slate-100 flex items-center justify-center">
        {images.length > 0 ? (
          <img
            src={images[activeImage]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <Package className="h-7 w-7" />
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-500">
              {product.brand || 'Accessories'}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <div className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black text-white shadow-md">
              {discount}% OFF
            </div>
          )}
          {product.condition && (
            <div className="rounded-full bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
              {product.condition}
            </div>
          )}
        </div>

        {/* Quick View Hover Trigger */}
        <button
          type="button"
          onClick={() => onOpenQuickView(product)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white hover:text-indigo-600"
          title="Quick View"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Stock Status Pill */}
        <div className="absolute bottom-2.5 left-3">
          {stock > 5 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/70 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur">
              <Check className="h-2.5 w-2.5" />
              <span>In Stock</span>
            </span>
          ) : stock > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/70 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur">
              <Clock className="h-2.5 w-2.5" />
              <span>Only {stock} Left</span>
            </span>
          ) : (
            <span className="rounded-md bg-rose-950/70 px-2 py-0.5 text-[10px] font-bold text-rose-300 backdrop-blur">
              Sold Out
            </span>
          )}
        </div>

        {/* Carousel indicator dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 right-3 flex gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveImage(i)
                }}
                className={`h-1.5 rounded-full transition-all ${
                  activeImage === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Seller Shop */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-indigo-600 text-[10px]">
              {product.category || 'Accessories'}
            </span>
            <span className="flex items-center gap-1 truncate max-w-[130px]" title={product.seller}>
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{product.seller || 'Nearby Shop'}</span>
            </span>
          </div>

          <h3
            onClick={() => onOpenQuickView(product)}
            className="mt-2 line-clamp-2 text-sm font-bold text-slate-900 leading-snug cursor-pointer hover:text-indigo-600 transition"
          >
            {product.name}
          </h3>

          {/* Model / Warranty Tag */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            {product.warranty && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                <ShieldCheck className="h-3 w-3" />
                {product.warranty}
              </span>
            )}
            {product.modelCompatibility && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600 truncate max-w-[140px]">
                {product.modelCompatibility}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{product.rating || 4.8}</span>
            <span className="text-slate-400 font-medium">Verified Seller</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          {/* Price */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {priceFormatted}
              </span>
              {oldPriceFormatted && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {oldPriceFormatted}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[11px] font-bold text-emerald-600">Save {discount}%</span>
            )}
          </div>

          {/* Super Seller / Admin Verification Badge */}
          {product.isSuperSellerOrAdmin && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Super Seller / Admin Verified</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onOpenQuickView(product)}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
              title="View Specifications"
            >
              <Eye className="h-4 w-4" />
            </button>
            {product.canReceiveEnquiries !== false ? (
              <button
                type="button"
                onClick={() => onOpenInquiry(product)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 px-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Send Enquiry</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Enquiries are only available for products uploaded by verified Admins and Super Sellers"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 px-2 text-[11px] font-semibold text-slate-400 border border-slate-200 cursor-not-allowed"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Enquiries Disabled</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
