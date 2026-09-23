import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../src/features/auth/hooks/useAuth'
import { Plus, CheckCircle2, ShoppingBag } from 'lucide-react'
import apiClient from '../../src/lib/api/client'

import ProductStatCards from '../../components/seller/ProductStatCards'
import ProductFilterBar from '../../components/seller/ProductFilterBar'
import ProductTable from '../../components/seller/ProductTable'
import ProductFormModal from '../../components/seller/ProductFormModal'
import AddCategoryModal from '../../components/seller/AddCategoryModal'
import DeleteProductModal from '../../components/seller/DeleteProductModal'

function emptyProduct() {
  return {
    id: '',
    shopId: '',
    name: '',
    brand: '',
    sku: '',
    modelCompatibility: '',
    condition: 'New',
    warranty: '',
    images: [],
    price: '',
    oldPrice: '',
    discount: 0,
    stock: 10,
    status: 'ACTIVE',
    category: '',
    features: '',
    description: '',
  }
}

export default function SellerProducts() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct())
  const [formError, setFormError] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [page, setPage] = useState(1)

  const isPlatformStaff = user?.role === 'ADMIN' || user?.role === 'PLATFORM_ADMIN'

  // Fetch Categories from Database
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data?.data || []
    },
    staleTime: 30000,
  })

  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('ACCESSORY')
  const [newCategoryError, setNewCategoryError] = useState('')

  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, type }) => {
      const res = await apiClient.post('/categories', { name, type })
      return res.data?.data
    },
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['categories-all'] })
      queryClient.invalidateQueries({ queryKey: ['public-categories'] })
      if (newCat?.name) {
        setForm((s) => ({ ...s, category: newCat.name }))
      }
      setShowAddCategoryModal(false)
      setNewCategoryName('')
      setNewCategoryError('')
    },
    onError: (err) => {
      setNewCategoryError(err.response?.data?.error?.message || 'Failed to create category')
    },
  })

  const categoriesList = useMemo(() => {
    const list = [...dbCategories]
    if (form.category && !list.some((c) => c.name.toLowerCase() === form.category.toLowerCase())) {
      list.unshift({ id: 'custom', name: form.category, type: 'CUSTOM' })
    }
    return list
  }, [dbCategories, form.category])

  // Fetch shops for Admin/Platform Admin product assignment
  const { data: adminShopsData } = useQuery({
    queryKey: ['adminShopsList'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/shops')
      return res.data?.data || []
    },
    enabled: isPlatformStaff,
  })
  const adminShops = adminShopsData || []

  useEffect(() => {
    if (router.query?.action === 'new') {
      openNew()
    }
  }, [router.query?.action])

  // Fetch Products via API
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['sellerProducts', page, search, categoryFilter, stockFilter],
    queryFn: async () => {
      const params = {
        page,
        limit: 50,
        search: search || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        stockFilter: stockFilter !== 'All' ? stockFilter : undefined,
      }
      const res = await apiClient.get('/seller/products', { params })
      return res.data
    },
    staleTime: 10000,
  })

  const products = productsResponse?.data || []
  const totalCount = productsResponse?.meta?.total ?? products.length

  function buildPayload(payload) {
    const pricePaise = Math.round(parseFloat(payload.price || '0') * 100)
    const compareAtPricePaise =
      payload.oldPrice && !isNaN(parseFloat(payload.oldPrice)) && parseFloat(payload.oldPrice) > 0
        ? Math.round(parseFloat(payload.oldPrice) * 100)
        : null

    return {
      name: payload.name.trim(),
      brand: payload.brand || null,
      sku: payload.sku || null,
      modelCompatibility: payload.modelCompatibility || null,
      condition: payload.condition || 'New',
      warranty: payload.warranty || null,
      pricePaise,
      compareAtPricePaise,
      discountPercent: Number(payload.discount) || 0,
      stock: Number(payload.stock) || 0,
      category: payload.category || null,
      features: payload.features || null,
      description: payload.description || null,
      images: payload.images || [],
    }
  }

  function invalidateProductQueries() {
    queryClient.invalidateQueries({ queryKey: ['sellerProducts'] })
    queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] })
    queryClient.invalidateQueries({ queryKey: ['featuredProducts'] })
    queryClient.invalidateQueries({ queryKey: ['public-products'] })
    queryClient.invalidateQueries({ queryKey: ['landingPage'] })
  }

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const body = buildPayload(payload)
      if (payload.shopId) body.shopId = payload.shopId
      return apiClient.post('/seller/products', body)
    },
    onSuccess: () => {
      invalidateProductQueries()
      setIsModalOpen(false)
      setForm(emptyProduct())
      setFormError('')
      setToastMessage('Product submitted and added to catalogue successfully!')
      setTimeout(() => setToastMessage(''), 4000)
    },
    onError: (err) => {
      const resp = err.response?.data
      const message = resp?.error?.message || err.message || 'Failed to submit product.'
      const fields = resp?.error?.fields
      if (fields && typeof fields === 'object') {
        const details = Object.entries(fields)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ')
        setFormError(`${message} — ${details}`)
      } else {
        setFormError(message)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return apiClient.patch(`/seller/products/${id}`, buildPayload(payload))
    },
    onSuccess: () => {
      invalidateProductQueries()
      setIsModalOpen(false)
      setForm(emptyProduct())
      setFormError('')
      setToastMessage('Product updated successfully!')
      setTimeout(() => setToastMessage(''), 4000)
    },
    onError: (err) => {
      const resp = err.response?.data
      const message = resp?.error?.message || err.message || 'Failed to update product.'
      const fields = resp?.error?.fields
      if (fields && typeof fields === 'object') {
        const details = Object.entries(fields)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ')
        setFormError(`${message} — ${details}`)
      } else {
        setFormError(message)
      }
    },
  })

  const [productToDelete, setProductToDelete] = useState(null)

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => apiClient.patch(`/seller/products/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
    },
  })

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }) =>
      apiClient.patch(`/seller/products/${id}`, { stock: Math.max(0, stock) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => apiClient.delete(`/seller/products/${id}`),
    onSuccess: () => {
      invalidateProductQueries()
      setProductToDelete(null)
    },
  })

  const categories = useMemo(() => {
    const dbNames = dbCategories.map((c) => c.name)
    const prodNames = products.map((p) => p.category).filter(Boolean)
    return ['All', ...new Set([...dbNames, ...prodNames])]
  }, [dbCategories, products])

  const stats = useMemo(() => {
    const total = totalCount
    const inStock = products.filter((p) => Number(p.stock) > 5).length
    const lowStock = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length
    const outOfStock = products.filter((p) => Number(p.stock) === 0).length
    return { total, inStock, lowStock, outOfStock }
  }, [products, totalCount])

  function openNew() {
    setForm(emptyProduct())
    setEditing(null)
    setFormError('')
    setIsModalOpen(true)
  }

  function openEdit(product) {
    setForm({
      ...product,
      price: product.price ? product.price.toString() : '',
      oldPrice: product.oldPrice ? product.oldPrice.toString() : '',
      status: product.status || 'ACTIVE',
      category: product.category?.name || product.category || '',
      modelCompatibility: product.modelCompatibility || '',
      images: Array.isArray(product.images)
        ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
        : [],
    })
    setEditing(product.id)
    setFormError('')
    setIsModalOpen(true)
  }

  function save(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (createMutation.isPending || updateMutation.isPending) return

    setFormError('')
    const name = (form.name || '').trim()
    const price = parseFloat(form.price)
    const stock = Number(form.stock)
    const oldPrice = form.oldPrice ? parseFloat(form.oldPrice) : null

    if (name.length < 2) return setFormError('Product name must be at least 2 characters.')
    if (!form.price || isNaN(price) || price <= 0)
      return setFormError('Please enter a valid selling price greater than ₹0.')
    if (!form.category || !form.category.trim())
      return setFormError('Please select a product category.')
    if (isNaN(stock) || stock < 0) return setFormError('Stock cannot be negative.')
    if (oldPrice !== null) {
      if (isNaN(oldPrice) || oldPrice < 0)
        return setFormError('Original MRP must be a valid non-negative number.')
      if (oldPrice < price) return setFormError('MRP cannot be less than selling price.')
    }
    if (!form.images || form.images.length === 0)
      return setFormError('At least one product image is required.')

    if (editing) {
      updateMutation.mutate({ id: editing, payload: { ...form, name, stock } })
    } else {
      createMutation.mutate({ ...form, name, stock })
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-full space-y-6 pb-10">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 shadow-xl shadow-indigo-100 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-violet-300/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                <ShoppingBag className="h-3.5 w-3.5" />
                Live Database Inventory
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Products</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                Create, organize and manage your mobile accessories inventory.
              </p>
            </div>
            <button
              onClick={openNew}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              <Plus className="h-5 w-5 transition group-hover:rotate-90" />
              Add Product
            </button>
          </div>
        </div>

        <ProductStatCards stats={stats} />

        <ProductFilterBar
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          categories={categories}
          productsCount={products.length}
          totalCount={totalCount}
        />

        <ProductTable
          products={products}
          isLoading={isLoading}
          isPlatformStaff={isPlatformStaff}
          onOpenEdit={openEdit}
          onOpenNew={openNew}
          onDeleteRequest={setProductToDelete}
          onUpdateStock={(id, stock) => updateStockMutation.mutate({ id, stock })}
          onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
        />

        <ProductFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editing={editing}
          form={form}
          setForm={setForm}
          formError={formError}
          setFormError={setFormError}
          onSave={save}
          isSaving={createMutation.isPending || updateMutation.isPending}
          user={user}
          adminShops={adminShops}
          categoriesList={categoriesList}
          onOpenAddCategory={() => setShowAddCategoryModal(true)}
        />

        <DeleteProductModal
          product={productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={(id) => deleteMutation.mutate(id)}
          isPending={deleteMutation.isPending}
        />

        <AddCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => {
            setShowAddCategoryModal(false)
            setNewCategoryError('')
          }}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          newCategoryType={newCategoryType}
          setNewCategoryType={setNewCategoryType}
          newCategoryError={newCategoryError}
          setNewCategoryError={setNewCategoryError}
          onSubmit={(e) => {
            e.preventDefault()
            if (!newCategoryName.trim()) {
              setNewCategoryError('Please enter a category name')
              return
            }
            createCategoryMutation.mutate({
              name: newCategoryName.trim(),
              type: newCategoryType,
            })
          }}
          isPending={createCategoryMutation.isPending}
        />
      </div>
    </DashboardLayout>
  )
}