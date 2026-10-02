import apiClient from './client'

export interface NearestProductItem {
  id: string
  name: string
  brand?: string
  modelCompatibility?: string
  pricePaise: number
  compareAtPricePaise?: number
  discountPercent?: number
  stock: number
  status: string
  images?: Array<{ url: string; altText?: string; position?: number }>
  shop: {
    id: string
    name: string
    address?: string
    latitude: number
    longitude: number
    whatsappNumber?: string
    distanceMeters?: number
    distanceKm?: number
  }
}

export interface NearestProductsParams {
  lat: number
  lng: number
  radiusMeters?: number
  categoryId?: string
  q?: string
  page?: number
  limit?: number
}

export interface ShopNearbyItem {
  id: string
  name: string
  address?: string
  latitude: number
  longitude: number
  whatsappNumber?: string
  openingHours?: string
  isVerified?: boolean
  distanceMeters?: number
  distanceKm?: number
  featuredProducts?: NearestProductItem[]
}

export interface NearbyShopsParams {
  lat: number
  lng: number
  radiusMeters?: number
  search?: string
}

export interface PublicCategory {
  id: string
  name: string
  slug?: string
  type?: 'accessory' | 'repair'
  iconUrl?: string
  itemCount?: number
}

export interface WhatsAppEnquiryPayload {
  shopId: string
  productId?: string
  customerName: string
  customerPhone: string
  message: string
}

export interface WhatsAppEnquiryResponse {
  enquiryId: string
  whatsappUrl: string
  status?: string
}

export interface GuestRepairBookingPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  brand: string
  model: string
  problemDescription: string
  preferredShopId?: string
}

export interface GuestRepairBookingResponse {
  ticketId: string
  referenceNumber: string
  status: string
  brand?: string
  model?: string
}

export interface RepairMilestone {
  step: number
  status: string
  isCompleted: boolean
  isCurrent: boolean
}

export interface RepairTrackingResult {
  ticketId: string
  referenceNumber: string
  customerName: string
  brand?: string
  model?: string
  problemDescription?: string
  status: string
  currentMilestoneIndex?: number
  milestones?: RepairMilestone[]
  estimatedCostPaise?: number
  shop?: {
    id: string
    name: string
    phone?: string
    address?: string
  }
  updates?: Array<{
    id: string
    status: string
    note: string
    createdAt: string
  }>
}

export interface TrackRepairParams {
  ticketId?: string
  phone?: string
}

export const publicService = {
  /**
   * Nearest Product Discovery (Haversine Geo-Search)
   * GET /public/products/nearest
   */
  async getNearestProducts(params: NearestProductsParams): Promise<{
    items: NearestProductItem[]
    meta?: { page: number; limit: number; total: number; radiusMeters: number }
  }> {
    const res = await apiClient.get('/public/products/nearest', { params })
    const data = res.data
    return {
      items: Array.isArray(data?.data) ? data.data : [],
      meta: data?.meta,
    }
  },

  /**
   * Nearby Repair & Accessories Storefronts
   * GET /shops/nearby
   */
  async getNearbyShops(params: NearbyShopsParams): Promise<ShopNearbyItem[]> {
    const res = await apiClient.get('/shops/nearby', { params })
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Get Public Shop Details by ID
   * GET /shops/:shopId
   */
  async getShopById(shopId: string): Promise<ShopNearbyItem> {
    const res = await apiClient.get(`/shops/${shopId}`)
    return res.data?.data || res.data
  },

  /**
   * Get Products for Specific Shop
   * GET /shops/:shopId/products
   */
  async getShopProducts(
    shopId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<{ items: NearestProductItem[]; total?: number }> {
    const res = await apiClient.get(`/shops/${shopId}/products`, { params })
    const data = res.data
    return {
      items: Array.isArray(data?.data) ? data.data : [],
      total: data?.meta?.total,
    }
  },

  /**
   * List Product and Repair Categories
   * GET /categories
   */
  async getCategories(type?: 'accessory' | 'repair'): Promise<PublicCategory[]> {
    const res = await apiClient.get('/categories', { params: type ? { type } : undefined })
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Featured Products from Verified Stores
   * GET /products/featured
   */
  async getFeaturedProducts(): Promise<NearestProductItem[]> {
    const res = await apiClient.get('/products/featured')
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Dynamic Landing Page Hero, Stats & Sections
   * GET /public/landing-page
   */
  async getLandingPageContent(): Promise<any> {
    const res = await apiClient.get('/public/landing-page')
    return res.data?.data || res.data
  },

  /**
   * Direct WhatsApp Click-to-Chat Lead Generation
   * POST /enquiries or POST /enquiries/whatsapp
   */
  async sendWhatsAppEnquiry(payload: WhatsAppEnquiryPayload): Promise<WhatsAppEnquiryResponse> {
    try {
      const res = await apiClient.post('/enquiries/whatsapp', payload)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.post('/enquiries', payload)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Guest Repair Booking (No Login Required)
   * POST /public/repairs/book
   */
  async bookRepair(payload: GuestRepairBookingPayload): Promise<GuestRepairBookingResponse> {
    const res = await apiClient.post('/public/repairs/book', payload)
    return res.data?.data || res.data
  },

  /**
   * Track Repair Status Online (Milestone Progress Bar)
   * GET /public/repairs/track?ticketId=... or ?phone=...
   */
  async trackRepair(params: TrackRepairParams): Promise<RepairTrackingResult[]> {
    const res = await apiClient.get('/public/repairs/track', { params })
    const data = res.data
    if (Array.isArray(data?.data)) return data.data
    if (data?.data) return [data.data]
    if (Array.isArray(data)) return data
    return []
  },
}

export default publicService
