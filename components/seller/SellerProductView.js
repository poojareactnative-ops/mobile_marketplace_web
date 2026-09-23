import Link from 'next/link'
import {
  MessageSquare,
  Phone,
  Clock,
  TrendingUp,
  Boxes,
  Minus,
  Plus,
  Store,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

export function SellerProductSpecs({
  product,
  images,
  currentImage,
  selectedImgIndex,
  setSelectedImgIndex,
}) {
  return (
    <div className="space-y-6 lg:col-span-8">
      {/* Gallery Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
          <img
            src={currentImage}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-300"
          />
          {product.discountPercent > 0 && (
            <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-black uppercase text-white shadow-md">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImgIndex(idx)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  selectedImgIndex === idx
                    ? 'border-indigo-600 shadow-md ring-2 ring-indigo-100'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Specifications Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Product Specifications</h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <dt className="text-xs font-medium text-slate-500">Brand</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{product.brand || 'Unbranded'}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <dt className="text-xs font-medium text-slate-500">SKU / Model Number</dt>
            <dd className="mt-1 font-mono text-sm font-bold text-slate-900">{product.sku || 'N/A'}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <dt className="text-xs font-medium text-slate-500">Device Compatibility</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{product.modelCompatibility || 'Universal'}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <dt className="text-xs font-medium text-slate-500">Category</dt>
            <dd className="mt-1 text-sm font-bold text-indigo-600">{product.category || 'Accessories'}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <dt className="text-xs font-medium text-slate-500">Condition</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{product.condition || 'New'}</dd>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <dt className="text-xs font-medium text-slate-500">Warranty Guarantee</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{product.warranty || 'No Warranty specified'}</dd>
          </div>
        </dl>

        {product.description && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</h4>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {product.description}
            </p>
          </div>
        )}

        {product.features && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Features</h4>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {product.features}
            </p>
          </div>
        )}
      </div>

      {/* Enquiries Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Customer Enquiries ({product.enquiries?.length || 0})
            </h3>
          </div>
          <Link href="/seller/enquiries" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View all enquiries
          </Link>
        </div>

        {!product.enquiries || product.enquiries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No customer enquiries received yet for this item.</p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {product.enquiries.map((enq) => (
              <div key={enq.id} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{enq.customerName}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3" />
                        {enq.customerPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(enq.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {enq.status}
                  </span>
                </div>
                <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">{enq.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SellerProductControls({
  product,
  onUpdateStatus,
  onUpdateStock,
  isStatusLoading,
  isStockLoading,
}) {
  return (
    <div className="space-y-6 lg:col-span-4">
      {/* Status Control Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Product Status</h3>
        <div className="mt-3">
          <select
            value={product.status || 'ACTIVE'}
            onChange={(e) => onUpdateStatus(e.target.value)}
            disabled={isStatusLoading}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          >
            <option value="ACTIVE">Active (Live in Store)</option>
            <option value="INACTIVE">Inactive (Hidden)</option>
            <option value="DRAFT">Draft</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <p className="mt-2 text-xs text-slate-400">
            Changes save instantly and update all public storefront listings.
          </p>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pricing & Value</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">
            {product.priceFormatted || `₹${product.price}`}
          </span>
          {product.oldPrice && (
            <span className="text-sm font-medium text-slate-400 line-through">₹{product.oldPrice}</span>
          )}
        </div>

        {product.discountPercent > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>Customer Savings: {product.discountPercent}% OFF</span>
          </div>
        )}
      </div>

      {/* Inventory Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock on Hand</h3>
          <Boxes className="h-4 w-4 text-slate-400" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-4xl font-black text-slate-900">{product.stock}</div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateStock(Number(product.stock) - 1)}
              disabled={product.stock <= 0 || isStockLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onUpdateStock(Number(product.stock) + 1)}
              disabled={isStockLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onUpdateStock(Number(product.stock) + 10)}
              disabled={isStockLoading}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
            >
              +10
            </button>
          </div>
        </div>
      </div>

      {/* Shop Profile Widget */}
      {product.shop && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Assigned Store
                </span>
                <p className="font-bold text-slate-900 text-sm">{product.shop.name}</p>
              </div>
            </div>
            <Link
              href={`/shops/${product.shop.id}`}
              target="_blank"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Visit Store →
            </Link>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-500">
            {product.shop.address && (
              <p className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                <span>{product.shop.address}</span>
              </p>
            )}
            {product.shop.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{product.shop.phone}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
