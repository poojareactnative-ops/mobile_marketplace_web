import apiClient from './client'

export interface LocalCustomer {
  id: string
  shopId?: string
  shop_id?: string
  createdByAdminId?: string
  created_by_admin_id?: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  notes?: string | null
  totalOrdersCount?: number
  total_orders_count?: number
  totalRepairsCount?: number
  total_repairs_count?: number
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

export interface LocalCustomerInput {
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
}

export interface CreateRepairJobPayload {
  customerName: string
  customerPhone: string
  customerId?: string
  brand?: string
  model?: string
  problemDescription: string
  estimatedCostPaise?: number
}

export interface UpdateRepairJobPayload {
  status?: string
  estimatedCostPaise?: number
  note?: string
}

export const customersService = {
  /**
   * List Local Customers for Current Shop
   * GET /seller/admin/customers?search=...
   */
  async getLocalCustomers(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<LocalCustomer[]> {
    const res = await apiClient.get('/seller/admin/customers', { params })
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Get single Local Customer details & history
   * GET /seller/admin/customers/:id
   */
  async getLocalCustomer(id: string): Promise<LocalCustomer> {
    const res = await apiClient.get(`/seller/admin/customers/${id}`)
    return res.data?.data || res.data
  },

  /**
   * Register / Log Walk-In Customer
   * POST /seller/admin/customers
   */
  async createLocalCustomer(payload: LocalCustomerInput): Promise<LocalCustomer> {
    const res = await apiClient.post('/seller/admin/customers', {
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || undefined,
      address: payload.address?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
    })
    return res.data?.data || res.data
  },

  /**
   * Update Local Customer
   * PATCH /seller/admin/customers/:id
   */
  async updateLocalCustomer(
    id: string,
    payload: Partial<LocalCustomerInput>
  ): Promise<LocalCustomer> {
    const res = await apiClient.patch(`/seller/admin/customers/${id}`, payload)
    return res.data?.data || res.data
  },

  /**
   * Delete Local Customer
   * DELETE /seller/admin/customers/:id
   */
  async deleteLocalCustomer(id: string): Promise<any> {
    const res = await apiClient.delete(`/seller/admin/customers/${id}`)
    return res.data
  },

  /**
   * Admin Submits Local Repair Job for Customer
   * POST /seller/admin/repair-jobs
   */
  async createCustomerRepairJob(payload: CreateRepairJobPayload): Promise<any> {
    const res = await apiClient.post('/seller/admin/repair-jobs', {
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      brand: payload.brand?.trim() || undefined,
      model: payload.model?.trim() || undefined,
      problemDescription: payload.problemDescription.trim(),
      estimatedCostPaise: payload.estimatedCostPaise ?? 0,
      customerId: payload.customerId,
    })
    return res.data?.data || res.data
  },

  /**
   * Admin Updates Repair Diagnostic Status & Quote
   * PATCH /seller/admin/repair-jobs/:jobId
   */
  async updateRepairJob(jobId: string, payload: UpdateRepairJobPayload): Promise<any> {
    const res = await apiClient.patch(`/seller/admin/repair-jobs/${jobId}`, payload)
    return res.data?.data || res.data
  },
}

export default customersService
