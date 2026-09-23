import InputField from '../InputField'
import {
  Package,
  TrendingUp,
  ImagePlus,
  ShoppingBag,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import ProductImageUploader from './ProductImageUploader'

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function ProductFormCard({
  form,
  setForm,
  errorMsg,
  setErrorMsg,
  onSubmit,
  isPending,
  user,
  adminShops = [],
  categoriesList = [],
  onOpenAddCategory,
  submitButtonText = 'Save Product',
}) {
  const isSuperSellerOrAdmin =
    user?.role === 'SUPER_SELLER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'PLATFORM_ADMIN'

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Unable to Submit Product</p>
            <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
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
        description="Enter the core details and categorization for this product."
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
          placeholder="e.g. 65W GaN Fast Charger"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Brand"
            name="brand"
            value={form.brand}
            onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
            placeholder="e.g. Anker"
          />
          <InputField
            label="SKU / Barcode"
            name="sku"
            value={form.sku}
            onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
            placeholder="e.g. ANK-65W-01"
          />
        </div>

        <InputField
          label="Model Compatibility"
          name="modelCompatibility"
          value={form.modelCompatibility}
          onChange={(e) => setForm((s) => ({ ...s, modelCompatibility: e.target.value }))}
          placeholder="e.g. iPhone 15 Pro, Galaxy S24 Ultra, MacBook Air"
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
                  <Plus className="h-3 w-3" /> + New Category
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
        description="Set your customer retail pricing in INR and stock levels."
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
            placeholder="1499"
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
            placeholder="2499"
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
            placeholder="15"
          />
          <InputField
            label="Warranty"
            name="warranty"
            value={form.warranty}
            onChange={(e) => setForm((s) => ({ ...s, warranty: e.target.value }))}
            placeholder="1 Year Manufacturer Warranty"
          />
        </div>
      </FormSection>

      {/* IMAGES */}
      <FormSection
        icon={ImagePlus}
        title="Product Images *"
        description="Upload photos or link web images for your product listing."
      >
        <ProductImageUploader
          images={form.images || []}
          setImages={(updater) =>
            setForm((s) => ({
              ...s,
              images: typeof updater === 'function' ? updater(s.images || []) : updater,
            }))
          }
          setErrorMsg={setErrorMsg}
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

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-75"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            submitButtonText
          )}
        </button>
      </div>
    </form>
  )
}
