import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../src/features/auth/hooks/useAuth'
import apiClient from '../../src/lib/api/client'
import {
  Tag,
  Plus,
  Search,
  Package,
  Boxes,
  Wrench,
  Sparkles,
  ExternalLink,
  X,
  Loader2,
  CheckCircle2,
  Filter,
} from 'lucide-react'

export default function SellerCategoriesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('ACCESSORY')
  const [imageUrl, setImageUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const isSuperSellerOrAdmin =
    user?.role === 'SUPER_SELLER' ||
    user?.role === 'ADMIN' ||
    user?.role === 'PLATFORM_ADMIN'

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-management'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data?.data || []
    },
  })

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/categories', payload)
      return res.data?.data
    },
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['categories-management'] })
      queryClient.invalidateQueries({ queryKey: ['categories-all'] })
      queryClient.invalidateQueries({ queryKey: ['public-categories'] })
      setShowCreateModal(false)
      setName('')
      setImageUrl('')
      setType('ACCESSORY')
      setErrorMsg('')
      setSuccessMsg(`Category "${newCat?.name}" created successfully!`)
      setTimeout(() => setSuccessMsg(''), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create category')
    },
  })

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.slug.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'ALL' || cat.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [categories, search, typeFilter])

  // Stats calculation
  const stats = useMemo(() => {
    const total = categories.length
    const accessories = categories.filter((c) => c.type === 'ACCESSORY').length
    const repair = categories.filter((c) => c.type === 'REPAIR').length
    const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0)
    return { total, accessories, repair, totalProducts }
  }, [categories])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-4 w-4" />
              <span>Catalog Architecture</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
              Product & Service Categories
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage taxonomies for marketplace accessories and repair services.
            </p>
          </div>

          {isSuperSellerOrAdmin ? (
            <button
              onClick={() => {
                setShowCreateModal(true)
                setErrorMsg('')
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Create Category</span>
            </button>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
              Category creation reserved for Super Sellers & Admins
            </div>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Categories"
            value={stats.total}
            icon={Tag}
            color="bg-indigo-50 text-indigo-600"
          />
          <StatCard
            title="Accessory Types"
            value={stats.accessories}
            icon={Boxes}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            title="Repair & Spares"
            value={stats.repair}
            icon={Wrench}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Indexed Products"
            value={stats.totalProducts}
            icon={Package}
            color="bg-sky-50 text-sky-600"
          />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name or slug..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="ACCESSORY">Accessories Only</option>
              <option value="REPAIR">Repair Only</option>
            </select>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">No categories found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try searching for a different term or create a new category.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Category Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Slug Identifier</th>
                    <th className="px-6 py-4">Products Linked</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((cat) => (
                    <tr key={cat.id || cat.slug} className="hover:bg-slate-50/75 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                            <Tag className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{cat.name}</p>
                            <p className="text-xs text-slate-400">
                              Added {new Date(cat.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${
                            cat.type === 'ACCESSORY'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {cat.type === 'ACCESSORY' ? 'Accessories' : 'Repair & Parts'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {cat.slug}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          <Package className="h-3 w-3 text-slate-500" />
                          {cat._count?.products ?? 0} Products
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/seller/products?category=${encodeURIComponent(cat.name)}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition"
                        >
                          <span>View Products</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create Category */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create New Category</h3>
                    <p className="text-xs text-slate-500">Super Seller & Admin permission</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!name.trim()) {
                    setErrorMsg('Category name is required')
                    return
                  }
                  createMutation.mutate({
                    name: name.trim(),
                    type,
                    imageUrl: imageUrl.trim() || undefined,
                  })
                }}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setErrorMsg('')
                    }}
                    placeholder="e.g. Wireless Power Banks, Curved Screens..."
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-white"
                  >
                    <option value="ACCESSORY">Mobile Accessories</option>
                    <option value="REPAIR">Repair Parts & Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Image / Icon URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !name.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  )
}
