import Link from 'next/link'
import {
  Package,
  Pencil,
  Trash2,
  Store,
  Eye,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react'

export function ProductImage({ product }) {
  const imgUrl = product.images?.[0]
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-500 ring-1 ring-indigo-100">
      {imgUrl ? (
        <img
          src={typeof imgUrl === 'string' ? imgUrl : imgUrl.url}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <Package className="h-5 w-5" />
      )}
    </div>
  )
}

export function stockStatus(stock) {
  const value = Number(stock)
  if (value === 0)
    return { label: 'Out of stock', className: 'bg-red-50 text-red-600 ring-red-100' }
  if (value <= 5)
    return { label: 'Low stock', className: 'bg-amber-50 text-amber-600 ring-amber-100' }
  return { label: 'In stock', className: 'bg-emerald-50 text-emerald-600 ring-emerald-100' }
}

export default function ProductTable({
  products,
  isLoading,
  isPlatformStaff,
  onOpenEdit,
  onOpenNew,
  onDeleteRequest,
  onUpdateStock,
  onUpdateStatus,
}) {
  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Product Inventory</h2>
          <p className="mt-1 text-xs text-slate-500">
            Real-time database product catalogue scoped to your shop.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Product
                </th>
                {isPlatformStaff && (
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Store
                  </th>
                )}
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Category
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Price
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Stock
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={isPlatformStaff ? 7 : 6}
                    className="py-12 text-center text-slate-400"
                  >
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
                    <p className="mt-2 text-xs">Loading products...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                        <Package className="h-7 w-7" />
                      </div>
                      <h3 className="mt-4 font-semibold text-slate-900">No products found</h3>
                      <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Try adjusting your search filter or create your first product above.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const status = stockStatus(product.stock)
                  const detailHref = isPlatformStaff
                    ? `/admin/products/${product.id}`
                    : `/seller/products/${product.id}`
                  return (
                    <tr key={product.id} className="group transition hover:bg-slate-50/70">
                      <td className="px-5 py-5">
                        <div className="flex min-w-[260px] items-center gap-3">
                          <ProductImage product={product} />
                          <div className="min-w-0">
                            <Link
                              href={detailHref}
                              className="truncate font-semibold text-slate-900 transition hover:text-indigo-600"
                            >
                              {product.name}
                            </Link>
                            <p className="mt-1 text-xs text-slate-400">
                              {product.brand ? `${product.brand} · ` : ''}SKU:{' '}
                              {product.sku || product.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {isPlatformStaff && (
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            <Store className="h-3 w-3 text-slate-400" />
                            {product.shop?.name || 'Store'}
                          </span>
                        </td>
                      )}

                      <td className="px-5 py-5">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {product.category || 'Uncategorized'}
                        </span>
                        <p className="mt-2 text-xs text-slate-400">{product.condition}</p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-bold text-slate-900">
                          {product.priceFormatted ||
                            (product.price ? `₹${product.price}` : '—')}
                        </p>
                        {product.oldPrice && (
                          <p className="mt-1 text-xs text-slate-400 line-through">
                            ₹{product.oldPrice}
                          </p>
                        )}
                        {product.discount > 0 && (
                          <span className="mt-1 inline-block text-[11px] font-semibold text-emerald-600">
                            {product.discount}% OFF
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">{product.stock}</p>
                          <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                            <button
                              onClick={() => onUpdateStock(product.id, Number(product.stock) - 1)}
                              disabled={product.stock <= 0}
                              className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 disabled:opacity-30"
                              title="Decrease stock"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onUpdateStock(product.id, Number(product.stock) + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100"
                              title="Increase stock"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <select
                          value={product.status || 'ACTIVE'}
                          onChange={(e) => onUpdateStatus(product.id, e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="OUT_OF_STOCK">Out of Stock</option>
                          <option value="DRAFT">Draft</option>
                        </select>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-1.5 opacity-80 transition group-hover:opacity-100">
                          <Link
                            href={detailHref}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => onOpenEdit(product)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteRequest(product)}
                            className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Package className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 font-semibold text-slate-900">No products found</h3>
            <button
              onClick={onOpenNew}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        ) : (
          products.map((product) => {
            const status = stockStatus(product.stock)
            const detailHref = isPlatformStaff
              ? `/admin/products/${product.id}`
              : `/seller/products/${product.id}`
            return (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <ProductImage product={product} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={detailHref}
                        className="truncate font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        {product.name}
                      </Link>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      {product.priceFormatted || `₹${product.price}`}
                    </p>
                    {isPlatformStaff && product.shop && (
                      <p className="mt-1 text-xs text-slate-500">Store: {product.shop.name}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{product.stock} in stock</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateStock(product.id, Number(product.stock) - 1)}
                        disabled={product.stock <= 0}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onUpdateStock(product.id, Number(product.stock) + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={detailHref}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-indigo-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onOpenEdit(product)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-indigo-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(product)}
                      className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
