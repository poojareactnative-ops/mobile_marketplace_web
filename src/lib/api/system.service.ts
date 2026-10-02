import apiClient from './client'

export interface VisitorTrackingPayload {
  eventType: 'PAGE_VIEW' | 'NEARBY_SEARCH' | 'WHATSAPP_CLICK' | 'REPAIR_BOOK_CLICK' | string
  path?: string
  shopId?: string
  productId?: string
  searchQuery?: string
  radiusMeters?: number
  latitude?: number
  longitude?: number
  metadata?: Record<string, any>
}

export interface VisitorAnalyticsData {
  period: string
  totalPageViews: number
  nearbySearches: number
  whatsappClicks: number
  repairBookings?: number
  breakdownByDate?: Array<{
    date: string
    count: number
  }>
}

export interface SellerApplication {
  id: string
  name: string
  email: string
  phone: string
  shopName: string
  shopType: string
  address: string
  latitude?: number
  longitude?: number
  whatsappNumber?: string
  businessDocUrl?: string
  openingHours?: string
  planType?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
  billingStatus?: string
  rejectionReason?: string
  createdAt: string
  updatedAt?: string
}

export interface SystemShopItem {
  id: string
  name: string
  type?: string
  address?: string
  latitude?: number
  longitude?: number
  whatsappNumber?: string
  openingHours?: string
  isActive: boolean
  isVerified: boolean
  rating?: number
  reviewsCount?: number
  owner?: {
    id: string
    name: string
    email: string
    phone?: string
  }
  createdAt?: string
}

export interface LandingPageSection {
  key: string
  title: string
  subtitle?: string
  body?: string
  imageUrl?: string
  ctaLabel?: string
  ctaUrl?: string
  isPublished: boolean
  sortOrder?: number
}

export const systemService = {
  /**
   * Track Visitor Engagement & Interactions
   * POST /analytics/track-visitor
   */
  async trackVisitor(payload: VisitorTrackingPayload): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.post('/analytics/track-visitor', payload)
      return res.data
    } catch (err) {
      // Analytics tracking shouldn't disrupt UI flows
      console.warn('Visitor tracking error:', err)
      return { success: false }
    }
  },

  /**
   * Platform-wide Visitor & Traffic Analytics
   * GET /system/analytics/visitors or /super-admin/analytics
   */
  async getVisitorAnalytics(
    period: '24h' | '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<VisitorAnalyticsData> {
    try {
      const res = await apiClient.get('/system/analytics/visitors', { params: { period } })
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get('/super-admin/analytics', { params: { period } })
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * List All Seller Applications (System Admin)
   * GET /system/seller-applications (fallback to /super-admin/requests)
   */
  async getSellerApplications(params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{ items: SellerApplication[]; meta?: any }> {
    try {
      const res = await apiClient.get('/system/seller-applications', { params })
      const data = res.data
      return {
        items: Array.isArray(data?.data) ? data.data : [],
        meta: data?.meta,
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get('/super-admin/requests', { params })
        const data = fallback.data
        return {
          items: Array.isArray(data?.data) ? data.data : [],
          meta: data?.meta,
        }
      }
      throw err
    }
  },

  /**
   * Get Seller Application Details by ID (System Admin)
   * GET /system/seller-applications/:id
   */
  async getSellerApplicationById(id: string): Promise<SellerApplication> {
    try {
      const res = await apiClient.get(`/system/seller-applications/${id}`)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get(`/super-admin/requests/${id}`)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Approve Seller Application & Activate Shop (System Admin)
   * PATCH /system/seller-applications/:id/approve (fallback to /super-admin/requests/:id/approve)
   */
  async approveSellerApplication(
    id: string,
    options?: {
      grantVerificationBadge?: boolean
      planTier?: string
      billingStatus?: string
      adminNotes?: string
    }
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await apiClient.patch(`/system/seller-applications/${id}/approve`, options || {})
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.patch(`/super-admin/requests/${id}/approve`, options || {})
        return fallback.data
      }
      throw err
    }
  },

  /**
   * Reject Seller Application (System Admin)
   * PATCH /system/seller-applications/:id/reject (fallback to /super-admin/requests/:id/reject)
   */
  async rejectSellerApplication(
    id: string,
    rejectionReason: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.patch(`/system/seller-applications/${id}/reject`, { rejectionReason })
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.patch(`/super-admin/requests/${id}/reject`, { rejectionReason })
        return fallback.data
      }
      throw err
    }
  },

  /**
   * List All Registered Shops Across Platform (System Admin)
   * GET /system/shops
   */
  async getSystemShops(params?: {
    search?: string
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<{ items: SystemShopItem[]; total?: number }> {
    try {
      const res = await apiClient.get('/system/shops', { params })
      const data = res.data
      return {
        items: Array.isArray(data?.data) ? data.data : [],
        total: data?.meta?.total,
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get('/admin/shops', { params })
        const data = fallback.data
        return {
          items: Array.isArray(data?.data) ? data.data : [],
          total: data?.meta?.total,
        }
      }
      throw err
    }
  },

  /**
   * Update Shop Verification / Active Status (System Admin)
   * PATCH /system/shops/:id
   */
  async updateSystemShop(
    id: string,
    payload: { isActive?: boolean; isVerified?: boolean }
  ): Promise<{ success: boolean; message?: string; data?: SystemShopItem }> {
    try {
      const res = await apiClient.patch(`/system/shops/${id}`, payload)
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        if (payload.isVerified !== undefined) {
          await apiClient.patch(`/admin/shops/${id}/verify`, { isVerified: payload.isVerified })
        }
        if (payload.isActive !== undefined) {
          await apiClient.patch(`/admin/shops/${id}/active`, { isActive: payload.isActive })
        }
        return { success: true }
      }
      throw err
    }
  },

  /**
   * Get All Landing Page Sections (Including Drafts)
   * GET /system/landing-page
   */
  async getLandingPageSections(): Promise<LandingPageSection[]> {
    const res = await apiClient.get('/system/landing-page')
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Create or Update Landing Page Section
   * PATCH /system/landing-page
   */
  async updateLandingPageSection(payload: LandingPageSection): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.patch('/system/landing-page', payload)
    return res.data
  },
}

export default systemService
