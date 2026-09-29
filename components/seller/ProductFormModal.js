import InputField from '../InputField'
import {
  X,
  Package,
  TrendingUp,
  ImagePlus,
  ShoppingBag,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import ProductImageUploader from './ProductImageUploader'

export function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
        {children}
      </div>
    </section>
  )
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editing,
  form,
  setForm,
  formError,
  setFormError,
  onSave,
  isSaving,
  user,
  adminShops = [],
  categoriesList = [],
  onOpenAddCategory,
}) {
  if (!isOpen) return null

  const isSuperSellerOrAdmin =
    user?.role === 'SUPER_SELLER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'PLATFORM_ADMIN'

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={() => {
          onClose()
          setFormError('')
        }}
      />

      <form
        onSubmit={onSave}
        className="relative z-10 flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Inventory Management
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {editing ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose()
              setFormError('')
            }}
            className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {formError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Unable to Submit Product</p>
                <p className="text-xs text-rose-700 mt-0.5">{formError}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormError('')}
                className="text-rose-400 hover:text-rose-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* BASIC INFO */}
          <FormSection
            icon={Package}
            title="Basic Information"
            description="Enter the main product details."
          >
            {(user?.role === 'ADMIN' || user?.role === 'PLATFORM_ADMIN') && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Target Shop</label>
                <select
                  value={form.shopId || ''}
                  onChange={(e) => setForm((s) => ({ ...s, shopId: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="">-- Platform Default (First Active Shop) --</option>
                  {adminShops.map((sh) => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name} ({sh.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <InputField
              label="Product Name *"
              name="name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Fast Charging USB-C Cable"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
                placeholder="e.g. PowerPulse"
              />
              <InputField
                label="SKU / Barcode"
                name="sku"
                value={form.sku}
                onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
                placeholder="PP-USBC-01"
              />
            </div>

            <InputField
              label="Model Compatibility"
              name="modelCompatibility"
              value={form.modelCompatibility}
              onChange={(e) => setForm((s) => ({ ...s, modelCompatibility: e.target.value }))}
              placeholder="e.g. iPhone 15, Samsung S24, All USB-C"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  {isSuperSellerOrAdmin && (
                    <button
                      type="button"
                      onClick={onOpenAddCategory}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-3 w-3" /> + New
                    </button>
                  )}
                </div>
                <select
                  value={form.category}
                  onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm((s) => ({ ...s, condition: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                >
                  <option>New</option>
                  <option>Refurbished</option>
                  <option>Used</option>
                </select>
              </div>
            </div>
          </FormSection>

          {/* PRICING & INVENTORY */}
          <FormSection
            icon={TrendingUp}
            title="Pricing & Inventory"
            description="Specify retail pricing in INR and live quantity."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <InputField
                label="Selling Price (₹) *"
                name="price"
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                placeholder="199"
                required
              />
              <InputField
                label="Original MRP (₹)"
                name="oldPrice"
                type="number"
                min="0"
                step="any"
                value={form.oldPrice}
                onChange={(e) => setForm((s) => ({ ...s, oldPrice: e.target.value }))}
                placeholder="499"
              />
              <InputField
                label="Stock Units *"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((s) => ({ ...s, stock: Number(e.target.value) }))}
                placeholder="25"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Discount (%)"
                name="discount"
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) => setForm((s) => ({ ...s, discount: Number(e.target.value) }))}
                placeholder="10"
              />
              <InputField
                label="Warranty"
                name="warranty"
                value={form.warranty}
                onChange={(e) => setForm((s) => ({ ...s, warranty: e.target.value }))}
                placeholder="6 Months Replacement"
              />
            </div>
          </FormSection>

          {/* IMAGES */}
          <FormSection
            icon={ImagePlus}
            title="Product Images"
            description="Upload photos or paste an image URL."
          >
            <ProductImageUploader
              images={form.images || []}
              setImages={(updater) =>
                setForm((s) => ({
                  ...s,
                  images: typeof updater === 'function' ? updater(s.images || []) : updater,
                }))
              }
              setErrorMsg={setFormError}
            />
          </FormSection>

          {/* DESCRIPTION & FEATURES */}
          <FormSection
            icon={ShoppingBag}
            title="Description & Features"
            description="Detailed specifications for buyers."
          >
            <textarea
              value={form.features}
              onChange={(e) => setForm((s) => ({ ...s, features: e.target.value }))}
              rows={3}
              placeholder="Key features (e.g. 9H hardness, 60W fast charging...)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={3}
              placeholder="General description..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />
          </FormSection>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={() => {
              onClose()
              setFormError('')
            }}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-75"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {editing ? 'Saving…' : 'Submitting…'}
              </>
            ) : editing ? (
              'Update Product'
            ) : (
              'Save & Submit Product'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
