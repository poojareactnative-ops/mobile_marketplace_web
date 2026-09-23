import { useState } from 'react'
import Link from 'next/link'
import {
  X,
  Package,
  Star,
  MapPin,
  Phone,
  Check,
  ArrowRight,
  MessageCircle,
  Lock,
} from 'lucide-react'

export default function QuickViewModal({ product, onClose, onEnquire }) {
  const images = product.images?.length > 0 ? product.images : []
  const [selectedImg, setSelectedImg] = useState(0)

  const priceFormatted =
    product.priceFormatted || `₹${Number(product.price).toLocaleString('en-IN')}`
  const oldPriceFormatted =
    product.compareAtPriceFormatted ||
    (product.oldPrice ? `₹${Number(product.oldPrice).toLocaleString('en-IN')}` : null)

  const featuresList = product.features
    ? product.features.split('\n').filter(Boolean)
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[selectedImg]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-16 w-16 text-slate-300" />
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`h-14 w-14 overflow-hidden rounded-xl border-2 transition ${
                      selectedImg === i ? 'border-indigo-600' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Local Store Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sold & Guaranteed By
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{product.seller}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                  <Star className="h-3 w-3 fill-amber-400" />
                  {product.rating || 4.8}
                </span>
              </div>

              {product.shopAddress && (
                <p className="mt-2 text-xs text-slate-500 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{product.shopAddress}</span>
                </p>
              )}

              {product.shopPhone && (
                <a
                  href={`tel:${product.shopPhone}`}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-white py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Store ({product.shopPhone})</span>
                </a>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {product.brand}
                  </span>
                )}
                {product.warranty && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    {product.warranty}
                  </span>
                )}
              </div>

              <h3 className="mt-2.5 text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h3>

              {/* Price Row */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900">{priceFormatted}</span>
                {oldPriceFormatted && (
                  <span className="text-sm text-slate-400 line-through">{oldPriceFormatted}</span>
                )}
                {product.discountPercent > 0 && (
                  <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Compatibility */}
              {product.modelCompatibility && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                  <span className="font-bold text-slate-700">Device Compatibility: </span>
                  <span className="text-slate-600">{product.modelCompatibility}</span>
                </div>
              )}

              {/* Features bullets */}
              {featuresList.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <span className="text-xs font-bold text-slate-800">Highlights:</span>
                  <ul className="space-y-1">
                    {featuresList.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 sm:gap-3">
              <Link
                href={`/products/${product.id}`}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>Full Details</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </Link>
              {product.canReceiveEnquiries !== false ? (
                <button
                  type="button"
                  onClick={() => onEnquire(product)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send Enquiry to Seller</span>
                </button>
              ) : (
                <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 px-3 text-xs font-semibold text-slate-400 border border-slate-200">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Enquiries Restricted to Super Sellers & Admins</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
