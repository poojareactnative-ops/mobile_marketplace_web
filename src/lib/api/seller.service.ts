import apiClient from './client'
import { LocalCustomer, LocalCustomerInput } from './customers.service'

export interface SellerProductImage {
  id?: string
  url: string
  altText?: string
  position?: number
}

export interface SellerProduct {
  id: string
  shopId: string
  categoryId: string
  name: string
  brand?: string
  sku?: string
  modelCompatibility?: string
  conditionState?: string
  warranty?: string
  pricePaise: number
  compareAtPricePaise?: number
  discountPercent?: number
  stock: number
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | string
  description?: string
  images: SellerProductImage[]
  category?: {
    id: string
    name: string
    slug?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateSellerProductInput {
  categoryId: string
  name: string
  brand?: string
  sku?: string
  modelCompatibility?: string
  conditionState?: string
  warranty?: string
  pricePaise: number
  compareAtPricePaise?: number
  discountPercent?: number
  stock?: number
  status?: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | string
  description?: string
  images?: Array<{ url: string; altText?: string; position?: number }>
}

export interface SellerShopProfile {
  id: string
  name: string
  type?: string
  address?: string
  latitude?: number
  longitude?: number
  whatsappNumber?: string | null
  businessDocUrl?: string | null
  openingHours?: string | null
  planType?: string | null
  isActive?: boolean
  isVerified?: boolean
  rating?: number
  reviewsCount?: number
  createdAt?: string
}

export interface SellerEnquiryItem {
  id: string
  shopId: string
  productId?: string
  customerName: string
  customerPhone: string
  message: string
  status?: string
  product?: {
    id: string
    name: string
    pricePaise?: number
  }
  createdAt?: string
}

export interface SellerDashboardData {
  metrics: {
    totalRevenuePaise?: number
    totalOrders?: number
    activeProducts?: number
    totalEnquiries?: number
    pendingRepairs?: number
    completedRepairs?: number
  }
  recentOrders?: any[]
  recentEnquiries?: SellerEnquiryItem[]
  repairStatusBreakdown?: Record<string, number>
}

export const sellerService = {
  /**
   * Shop Performance KPI & Dashboard Overview
   * GET /seller/dashboard
   */
  async getDashboard(period: string = '30d'): Promise<SellerDashboardData> {
    const res = await apiClient.get('/seller/dashboard', { params: { period } })
    return res.data?.data || res.data
  },

  /**
   * List Shop Catalog Products with Stock & Filters
   * GET /seller/products
   */
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    categoryId?: string
  }): Promise<{ items: SellerProduct[]; total?: number }> {
    const res = await apiClient.get('/seller/products', { params })
    const data = res.data
    return {
      items: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
      total: data?.meta?.total,
    }
  },

  /**
   * Add New Product to Shop Catalogue
   * POST /seller/products
   */
  async createProduct(payload: CreateSellerProductInput): Promise<SellerProduct> {
    const res = await apiClient.post('/seller/products', payload)
    return res.data?.data || res.data
  },

  /**
   * Get Product Details by ID
   * GET /seller/products/:productId
   */
  async getProductById(productId: string): Promise<SellerProduct> {
    const res = await apiClient.get(`/seller/products/${productId}`)
    return res.data?.data || res.data
  },

  /**
   * Update Product Details
   * PATCH /seller/products/:productId
   */
  async updateProduct(
    productId: string,
    payload: Partial<CreateSellerProductInput>
  ): Promise<SellerProduct> {
    const res = await apiClient.patch(`/seller/products/${productId}`, payload)
    return res.data?.data || res.data
  },

  /**
   * Delete Product from Catalogue
   * DELETE /seller/products/:productId
   */
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    const res = await apiClient.delete(`/seller/products/${productId}`)
    return res.data
  },

  /**
   * Get Storefront Profile
   * GET /seller/shop
   */
  async getShopProfile(): Promise<SellerShopProfile> {
    const res = await apiClient.get('/seller/shop')
    return res.data?.data || res.data
  },

  /**
   * Update Storefront Profile, WhatsApp Number & Location Coordinates
   * PATCH /seller/shop
   */
  async updateShopProfile(payload: Partial<SellerShopProfile>): Promise<SellerShopProfile> {
    const res = await apiClient.patch('/seller/shop', payload)
    return res.data?.data || res.data
  },

  /**
   * List WhatsApp Lead Enquiries for Shop
   * GET /seller/enquiries
   */
  async getEnquiries(): Promise<SellerEnquiryItem[]> {
    const res = await apiClient.get('/seller/enquiries')
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * List Walk-In Local Customers
   * GET /seller/admin/customers
   */
  async getCustomers(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<LocalCustomer[]> {
    const res = await apiClient.get('/seller/admin/customers', { params })
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Log / Register Walk-In Local Customer
   * POST /seller/admin/customers
   */
  async createCustomer(payload: LocalCustomerInput): Promise<LocalCustomer> {
    const res = await apiClient.post('/seller/admin/customers', payload)
    return res.data?.data || res.data
  },
}

export default sellerService
