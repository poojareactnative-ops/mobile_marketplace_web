import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../../components/DashboardLayout'
import { useAuth } from '../../../src/features/auth/hooks/useAuth'
import apiClient from '../../../src/lib/api/client'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import ProductFormCard from '../../../components/seller/ProductFormCard'
import AddCategoryModal from '../../../components/seller/AddCategoryModal'

export default function NewProductPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const [form, setForm] = useState({
    shopId: '',
    name: '',
    brand: '',
    sku: '',
    modelCompatibility: '',
    condition: 'New',
    warranty: '6 Months Replacement',
    price: '',
    oldPrice: '',
    discount: 0,
    stock: 15,
    category: '',
    features: '',
    description: '',
    images: [],
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState('ACCESSORY')
  const [newCategoryError, setNewCategoryError] = useState('')

  const isPlatformStaff = user?.role === 'ADMIN' || user?.role === 'PLATFORM_ADMIN'

  // Fetch Categories
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const res = await apiClient.get('/categories')
      return res.data?.data || []
    },
    staleTime: 30000,
  })

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

  // Fetch Shops for Admins
  const { data: adminShopsData } = useQuery({
    queryKey: ['adminShopsList'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/shops')
      return res.data?.data || []
    },
    enabled: isPlatformStaff,
  })
  const adminShops = adminShopsData || []

  // Create Product Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const pricePaise = Math.round(parseFloat(payload.price || '0') * 100)
      const compareAtPricePaise =
        payload.oldPrice && !isNaN(parseFloat(payload.oldPrice)) && parseFloat(payload.oldPrice) > 0
          ? Math.round(parseFloat(payload.oldPrice) * 100)
          : null

      const body = {
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
      if (payload.shopId) body.shopId = payload.shopId
      return apiClient.post('/seller/products', body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] })
      queryClient.invalidateQueries({ queryKey: ['sellerDashboard'] })
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] })
      queryClient.invalidateQueries({ queryKey: ['public-products'] })
      setSubmitSuccess(true)
      setTimeout(() => {
        router.push(isPlatformStaff ? '/admin/products' : '/seller/products')
      }, 1500)
    },
    onError: (err) => {
      const resp = err.response?.data
      const message = resp?.error?.message || err.message || 'Failed to submit product.'
      const fields = resp?.error?.fields
      if (fields && typeof fields === 'object') {
        const details = Object.entries(fields)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ')
        setErrorMsg(`${message} — ${details}`)
      } else {
        setErrorMsg(message)
      }
    },
  })

  function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault()
    if (createMutation.isPending) return

    setErrorMsg('')
    const name = (form.name || '').trim()
    const price = parseFloat(form.price)
    const stock = Number(form.stock)
    const oldPrice = form.oldPrice ? parseFloat(form.oldPrice) : null

    if (name.length < 2) return setErrorMsg('Product name must be at least 2 characters.')
    if (!form.price || isNaN(price) || price <= 0)
      return setErrorMsg('Please enter a valid selling price greater than ₹0.')
    if (!form.category || !form.category.trim())
      return setErrorMsg('Please select a product category.')
    if (isNaN(stock) || stock < 0) return setErrorMsg('Stock cannot be negative.')
    if (oldPrice !== null) {
      if (isNaN(oldPrice) || oldPrice < 0)
        return setErrorMsg('Original MRP must be a valid non-negative number.')
      if (oldPrice < price) return setErrorMsg('MRP cannot be less than selling price.')
    }
    if (!form.images || form.images.length === 0)
      return setErrorMsg('At least one product image is required.')

    createMutation.mutate({ ...form, name, stock })
  }

  const backHref = isPlatformStaff ? '/admin/products' : '/seller/products'

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6 pb-12">
        {submitSuccess && (
          <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>Product created successfully! Redirecting...</span>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={backHref}
              className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
              Back to Products
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Add New Product
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Create a new mobile accessory or device item for your active inventory catalogue.
            </p>
          </div>
        </div>

        <ProductFormCard
          form={form}
          setForm={setForm}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending}
          user={user}
          adminShops={adminShops}
          categoriesList={categoriesList}
          onOpenAddCategory={() => setShowAddCategoryModal(true)}
          submitButtonText="Create & Publish Product"
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
