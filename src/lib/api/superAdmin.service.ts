import apiClient from './client'

export interface SuperSellerRequest {
  id: string
  userId?: string
  shopId?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
  name: string
  email: string
  phone: string
  shopName: string
  shopType?: string
  address: string
  latitude?: number
  longitude?: number
  whatsappNumber?: string | null
  businessDocUrl?: string | null
  openingHours?: string | null
  planType?: string | null
  billingStatus?: 'FREE_TIER' | 'MANUALLY_VERIFIED' | 'PENDING_APPROVAL' | 'EXEMPT' | string
  planTier?: 'STANDARD_FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | string
  grantVerificationBadge?: boolean
  adminNotes?: string | null
  rejectionReason?: string | null
  createdAt?: string
  updatedAt?: string
  user?: {
    id: string
    name: string
    email: string
    phone?: string
    role: string
    status: string
  }
  shop?: {
    id: string
    name: string
    address?: string
    isVerified?: boolean
    isActive?: boolean
  }
}

export interface RequestsMeta {
  totalPending: number
  totalApproved: number
  totalRejected?: number
  total: number
  page?: number
  limit?: number
}

export interface ApproveRequestPayload {
  grantVerificationBadge?: boolean
  planTier?: 'STANDARD_FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | string
  billingStatus?: 'FREE_TIER' | 'MANUALLY_VERIFIED' | 'EXEMPT' | string
  adminNotes?: string
}

export interface RejectRequestPayload {
  rejectionReason: string
}

export interface SubscriptionPlan {
  id?: string
  code: string
  name: string
  pricePaise: number
  durationDays?: number
  maxProducts?: number
  maxAdmins?: number
  featuresJson?: {
    priorityNearbyRanking?: boolean
    whatsappLeadAnalytics?: boolean
    verifiedBadgeIncluded?: boolean
    [key: string]: any
  }
  createdAt?: string
}

export interface PlatformAnalytics {
  period?: string
  summary?: {
    totalShops?: number
    activeShops?: number
    pendingRequests?: number
    totalProducts?: number
    totalVisitors?: number
    totalLeads?: number
    totalRepairs?: number
    estimatedRevenuePaise?: number
  }
  trafficSeries?: Array<{
    date: string
    visitors: number
    leads: number
  }>
  topShops?: Array<{
    id: string
    name: string
    enquiriesCount: number
    productsCount: number
  }>
  [key: string]: any
}

export const superAdminService = {
  /**
   * List Super Seller Onboarding Requests
   * GET /super-admin/requests
   */
  async getRequests(params?: {
    status?: string
    billingStatus?: string
    page?: number
    limit?: number
  }): Promise<{ data: SuperSellerRequest[]; meta?: RequestsMeta }> {
    const res = await apiClient.get('/super-admin/requests', { params })
    const responseData = res.data

    const data: SuperSellerRequest[] = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
      ? responseData
      : []

    const meta: RequestsMeta = responseData?.meta || {
      totalPending: data.filter((r) => r.status === 'PENDING').length,
      totalApproved: data.filter((r) => r.status === 'APPROVED').length,
      totalRejected: data.filter((r) => r.status === 'REJECTED').length,
      total: data.length,
    }

    return { data, meta }
  },

  /**
   * Accept & Approve Super Seller Request (Shop Activation)
   * PATCH /super-admin/requests/{requestId}/approve
   */
  async approveRequest(requestId: string, payload: ApproveRequestPayload): Promise<any> {
    const res = await apiClient.patch(`/super-admin/requests/${requestId}/approve`, payload)
    return res.data
  },

  /**
   * Reject Super Seller Request
   * PATCH /super-admin/requests/{requestId}/reject
   */
  async rejectRequest(requestId: string, payload: RejectRequestPayload): Promise<any> {
    const res = await apiClient.patch(`/super-admin/requests/${requestId}/reject`, payload)
    return res.data
  },

  /**
   * List Subscription Plans
   * GET /super-admin/plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await apiClient.get('/super-admin/plans')
    const responseData = res.data
    return Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
      ? responseData
      : []
  },

  /**
   * Create Subscription Plan
   * POST /super-admin/plans
   */
  async createPlan(payload: SubscriptionPlan): Promise<any> {
    const res = await apiClient.post('/super-admin/plans', payload)
    return res.data
  },

  /**
   * Platform-wide Traffic, Visitor & Lead Analytics
   * GET /super-admin/analytics
   */
  async getAnalytics(period: string = '30d'): Promise<PlatformAnalytics> {
    const res = await apiClient.get('/super-admin/analytics', {
      params: { period },
    })
    return res.data?.data || res.data || {}
  },
}

export default superAdminService
