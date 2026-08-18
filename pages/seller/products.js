"use client"

import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { PlusCircle, Pencil, Trash2, Package } from 'lucide-react'

const STORAGE_KEY = 'seller_products_v1'

function emptyProduct() {
  return {
    id: '',
    name: '',
    brand: '',
    sku: '',
    modelCompatibility: '',
    condition: 'New',
    warranty: '',
    image: '',
    price: '',
    stock: 0,
    category: '',
    features: '',
    tags: '',
    description: '',
  }
}

export default function SellerProducts() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setProducts(raw ? JSON.parse(raw) : [])
    } catch (e) {
      setProducts([])
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch (e) {}
  }, [products])

  function openNew() {
    setForm(emptyProduct())
    setEditing(null)
    setIsModalOpen(true)
  }

  function openEdit(p) {
    setForm(p)
    setEditing(p.id)
    setIsModalOpen(true)
  }

  function save() {
    if (!form.name) return

    if (editing) {
      setProducts((prev) => prev.map((it) => (it.id === editing ? { ...form } : it)))
    } else {
      const id = `p_${Date.now()}`
      setProducts((prev) => [{ ...form, id }, ...prev])
    }

    setIsModalOpen(false)
  }

  function remove(id) {
    if (!confirm('Delete this product?')) return
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="mt-1 text-sm text-slate-500">Create and manage products for your shop.</p>
          </div>

          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
            <PlusCircle className="h-4 w-4" /> Add Product
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Stock</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">No products yet — add your first product.</td>
                  </tr>
                )}

                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 text-indigo-600">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="mt-1 text-xs text-slate-400">{p.brand ? `${p.brand} · ` : ''}SKU: {p.sku || p.id}</div>
                          {p.modelCompatibility && <div className="mt-0.5 text-[11px] text-slate-400">Compatible: {p.modelCompatibility}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-700">{p.category || '—'}</div>
                      <div className="mt-1 text-xs text-slate-400">Condition: {p.condition}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{p.price || '—'}</div>
                      {p.warranty && <div className="mt-1 text-xs text-slate-400">Warranty: {p.warranty}</div>}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-700">{p.stock}</div>
                      {p.tags && <div className="mt-1 text-xs text-slate-400">Tags: {p.tags}</div>}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>

                        <button onClick={() => remove(p.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />

            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold">{editing ? 'Edit Product' : 'Add Product'}</h3>

              <div className="mt-4 grid gap-3">
                <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Product name" />

                <div className="grid grid-cols-2 gap-3">
                  <input value={form.brand} onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Brand" />
                  <input value={form.sku} onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="SKU / ID" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input value={form.modelCompatibility} onChange={(e) => setForm((s) => ({ ...s, modelCompatibility: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Model compatibility (comma separated)" />
                  <select value={form.condition} onChange={(e) => setForm((s) => ({ ...s, condition: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2">
                    <option>New</option>
                    <option>Refurbished</option>
                    <option>Used</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Price (e.g. ₹199)" />
                  <input type="number" value={form.stock} onChange={(e) => setForm((s) => ({ ...s, stock: Number(e.target.value) }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Stock" />
                </div>

                <input value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Category" />

                <input value={form.warranty} onChange={(e) => setForm((s) => ({ ...s, warranty: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Warranty (e.g. 6 months)" />

                <input value={form.image} onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Image URL (optional)" />

                <input value={form.tags} onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Tags (comma separated)" />

                <textarea value={form.features} onChange={(e) => setForm((s) => ({ ...s, features: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Key features (one per line)" rows={3} />

                <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} className="w-full rounded-md border border-slate-200 px-3 py-2" placeholder="Short description" rows={3} />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md px-4 py-2 text-sm font-medium border border-slate-200">Cancel</button>
                <button type="button" onClick={save} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
