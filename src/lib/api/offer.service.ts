import apiClient from './client'

export type DiscountType = 'PERCENTAGE' | 'FIXED'
export type OfferStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED'

export interface Offer {
  id: string
  title: string
  discountType: DiscountType
  discountValue: number
  startsAt?: string | null
  endsAt?: string | null
  status: OfferStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateOfferInput {
  title: string
  discountType?: 'PERCENTAGE' | 'FIXED' | 'PERCENT' | 'FLAT' | string
  discountValue: number
  startsAt?: string | null
  endsAt?: string | null
  status?: OfferStatus
}

export interface UpdateOfferInput {
  title?: string
  discountType?: 'PERCENTAGE' | 'FIXED' | 'PERCENT' | 'FLAT' | string
  discountValue?: number
  startsAt?: string | null
  endsAt?: string | null
  status?: OfferStatus
}

export interface OfferQuery {
  status?: string
  page?: number
  limit?: number
}

function normalizeDiscountType(val?: string): DiscountType {
  const upper = (val || 'PERCENTAGE').toUpperCase()
  if (upper === 'PERCENT' || upper === 'PERCENTAGE') return 'PERCENTAGE'
  if (upper === 'FLAT' || upper === 'FIXED') return 'FIXED'
  return 'PERCENTAGE'
}

export const offerService = {
  /**
   * List Offers
   * GET /offers?status=...&page=...&limit=...
   */
  async getOffers(query?: OfferQuery): Promise<{ items: Offer[]; total?: number }> {
    const params: Record<string, any> = {}
    if (query?.status && query.status !== 'ALL') {
      params.status = query.status.toUpperCase()
    }
    if (query?.page) params.page = query.page
    if (query?.limit) params.limit = query.limit

    try {
      const res = await apiClient.get('/offers', { params })
      const data = res.data
      return {
        items: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
        total: data?.meta?.total,
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get('/seller/offers', { params })
        const data = fallback.data
        return {
          items: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
          total: data?.meta?.total,
        }
      }
      throw err
    }
  },

  /**
   * Get Offer by ID
   * GET /offers/:id
   */
  async getOfferById(id: string): Promise<Offer> {
    try {
      const res = await apiClient.get(`/offers/${id}`)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get(`/public/offers/${id}`)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Create New Offer
   * POST /offers
   * Complies with createOfferSchema:
   * title: string min 2
   * discountType: 'PERCENTAGE' | 'FIXED'
   * discountValue: int >= 0
   * startsAt?: Date string | null
   * endsAt?: Date string | null
   * status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
   */
  async createOffer(payload: CreateOfferInput): Promise<Offer> {
    const body: Record<string, any> = {
      title: payload.title.trim(),
      discountType: normalizeDiscountType(payload.discountType),
      discountValue: Math.max(0, Math.round(Number(payload.discountValue) || 0)),
      status: payload.status || 'ACTIVE',
    }

    if (payload.startsAt) {
      body.startsAt = new Date(payload.startsAt).toISOString()
    } else {
      body.startsAt = null
    }

    if (payload.endsAt) {
      body.endsAt = new Date(payload.endsAt).toISOString()
    } else {
      body.endsAt = null
    }

    try {
      const res = await apiClient.post('/offers', body)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.post('/seller/offers', body)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Update Offer
   * PATCH /offers/:id
   * Complies with updateOfferSchema
   */
  async updateOffer(id: string, payload: UpdateOfferInput): Promise<Offer> {
    const body: Record<string, any> = {}

    if (payload.title !== undefined) {
      body.title = payload.title.trim()
    }

    if (payload.discountType !== undefined) {
      body.discountType = normalizeDiscountType(payload.discountType)
    }

    if (payload.discountValue !== undefined) {
      body.discountValue = Math.max(0, Math.round(Number(payload.discountValue) || 0))
    }

    if (payload.startsAt !== undefined) {
      body.startsAt = payload.startsAt ? new Date(payload.startsAt).toISOString() : null
    }

    if (payload.endsAt !== undefined) {
      body.endsAt = payload.endsAt ? new Date(payload.endsAt).toISOString() : null
    }

    if (payload.status !== undefined) {
      body.status = payload.status
    }

    try {
      const res = await apiClient.patch(`/offers/${id}`, body)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        try {
          const putRes = await apiClient.put(`/offers/${id}`, body)
          return putRes.data?.data || putRes.data
        } catch {
          const sellerRes = await apiClient.patch(`/seller/offers/${id}`, body)
          return sellerRes.data?.data || sellerRes.data
        }
      }
      throw err
    }
  },

  /**
   * Delete Offer
   * DELETE /offers/:id
   */
  async deleteOffer(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.delete(`/offers/${id}`)
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.delete(`/seller/offers/${id}`)
        return fallback.data
      }
      throw err
    }
  },

  /**
   * Get Active Running Offers for Public Marketplace
   * GET /public/offers/running or /offers?status=ACTIVE
   */
  async getRunningOffers(params?: { lat?: number; lng?: number }): Promise<Offer[]> {
    try {
      const res = await apiClient.get('/public/offers/running', { params })
      const data = res.data
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    } catch {
      const res = await apiClient.get('/offers', { params: { status: 'ACTIVE', ...params } })
      const data = res.data
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    }
  },
}

export default offerService
