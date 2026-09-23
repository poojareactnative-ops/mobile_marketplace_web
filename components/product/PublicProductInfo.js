import Link from 'next/link'
import {
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  MessageSquare,
  Sparkles,
  Lock,
  ChevronRight,
  TrendingUp,
  Clock,
} from 'lucide-react'

function formatINR(paise) {
  if (!paise && paise !== 0) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function PublicProductInfo({ product, onOpenEnquiry }) {
  const isSuperSellerOrAdmin =
    product.shop?.ownerUser?.role === 'SUPER_SELLER' ||
    product.shop?.ownerUser?.role === 'ADMIN' ||
    product.shop?.ownerUser?.role === 'PLATFORM_ADMIN'

  const canReceiveEnquiries =
    product.canReceiveEnquiries !== undefined
      ? product.canReceiveEnquiries
      : isSuperSellerOrAdmin

  return (
    <div className="space-y-8 lg:col-span-7">
      {/* Title & Brand */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {product.category?.name && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              {product.category.name}
            </span>
          )}
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            Condition: {product.condition || 'New'}
          </span>
          {product.warranty && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
              {product.warranty}
            </span>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {product.brand && (
            <span>
              Brand: <strong className="text-slate-800">{product.brand}</strong>
            </span>
          )}
          {product.sku && (
            <span>
              SKU: <strong className="font-mono text-slate-800">{product.sku}</strong>
            </span>
          )}
          {product.modelCompatibility && (
            <span>
              Compatible with:{' '}
              <strong className="text-slate-800">{product.modelCompatibility}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Price Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-black text-slate-900 sm:text-4xl">
            {formatINR(product.pricePaise)}
          </span>
          {product.compareAtPricePaise && (
            <span className="text-lg font-semibold text-slate-400 line-through">
              {formatINR(product.compareAtPricePaise)}
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Save {product.discountPercent}%
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-4 flex items-center gap-2">
          {Number(product.stock) > 5 ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <Boxes className="h-4 w-4" />
              <span>In Stock ({product.stock} units available at store)</span>
            </div>
          ) : Number(product.stock) > 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <Clock className="h-4 w-4" />
              <span>Low Stock: Only {product.stock} units left!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Currently Out of Stock</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          {canReceiveEnquiries ? (
            <button
              onClick={onOpenEnquiry}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-xl shadow-indigo-100 transition hover:bg-indigo-700"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Send Enquiry to Seller</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Lock className="h-4 w-4 text-slate-400" />
                <span>Enquiries Restricted to Super Sellers and Platform Admins</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seller Store Details */}
      {product.shop && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Seller Store
                </span>
                <h3 className="text-base font-bold text-slate-900">{product.shop.name}</h3>
              </div>
            </div>

            <Link
              href={`/shops/${product.shop.id}`}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              <span>Visit Shop</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-600">
            {product.shop.address && (
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{product.shop.address}</span>
              </p>
            )}
            {product.shop.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <a href={`tel:${product.shop.phone}`} className="font-semibold hover:underline">
                  {product.shop.phone}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Features and Description */}
      {(product.features || product.description) && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {product.features && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Key Features &amp; Specifications
              </h3>
              <div className="mt-3 space-y-2">
                {product.features.split('\n').filter(Boolean).map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div className={product.features ? 'border-t border-slate-100 pt-6' : ''}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Product Description
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
