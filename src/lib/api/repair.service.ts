import apiClient from './client'

export type RepairJobStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUOTED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NOT_REPAIRABLE'

export interface RepairAuditUpdate {
  id?: string
  status: RepairJobStatus
  note: string
  estimatedCostPaise?: number
  createdByName?: string
  createdAt?: string
}

export interface RepairJob {
  id: string
  ticketId?: string
  referenceNumber?: string
  shopId?: string
  customerId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  brand?: string
  model?: string
  deviceId?: string
  problemDescription: string
  status: RepairJobStatus
  estimatedCostPaise?: number
  finalCostPaise?: number
  isSellable?: boolean
  assignedToUserId?: string
  technicianNotes?: string
  updates?: RepairAuditUpdate[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateRepairJobInput {
  customerName: string
  customerPhone: string
  customerEmail?: string
  brand?: string
  model?: string
  deviceId?: string
  problemDescription: string
  estimatedCostPaise?: number
  isSellable?: boolean
  repairCustomerId?: string
}

export interface UpdateRepairJobInput {
  status?: RepairJobStatus
  estimatedCostPaise?: number
  finalCostPaise?: number
  note?: string
  isSellable?: boolean
  assignedToUserId?: string
}

export interface AddDiagnosticUpdateInput {
  status: RepairJobStatus
  note: string
  estimatedCostPaise?: number
}

export interface RepairCustomerItem {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  totalRepairs?: number
  createdAt?: string
}

export const repairService = {
  /**
   * List Store Repair Tickets
   * GET /seller/admin/repair-jobs or /seller/repair-jobs
   */
  async getRepairJobs(params?: {
    status?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ items: RepairJob[]; total?: number }> {
    try {
      const res = await apiClient.get('/seller/admin/repair-jobs', { params })
      const data = res.data
      return {
        items: Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [],
        total: data?.meta?.total,
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get('/seller/repair-jobs', { params })
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
   * Get Repair Ticket Details & Audit History
   * GET /seller/admin/repair-jobs/:jobId or /seller/repair-jobs/:jobId
   */
  async getRepairJobById(jobId: string): Promise<RepairJob> {
    try {
      const res = await apiClient.get(`/seller/admin/repair-jobs/${jobId}`)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get(`/seller/repair-jobs/${jobId}`)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Submit Local Repair Job for Customer Ticket
   * POST /seller/admin/repair-jobs or /seller/repair-jobs
   */
  async createRepairJob(payload: CreateRepairJobInput): Promise<RepairJob> {
    try {
      const res = await apiClient.post('/seller/admin/repair-jobs', payload)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.post('/seller/repair-jobs', payload)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Update Repair Diagnostic Status & Quote
   * PATCH /seller/admin/repair-jobs/:jobId or /seller/repair-jobs/:jobId
   */
  async updateRepairJob(jobId: string, payload: UpdateRepairJobInput): Promise<RepairJob> {
    try {
      const res = await apiClient.patch(`/seller/admin/repair-jobs/${jobId}`, payload)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.patch(`/seller/repair-jobs/${jobId}`, payload)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Append Diagnostic Audit Note to Ticket
   * POST /seller/admin/repair-jobs/:jobId/updates or /seller/repair-jobs/:jobId/updates
   */
  async addDiagnosticUpdate(
    jobId: string,
    payload: AddDiagnosticUpdateInput
  ): Promise<RepairAuditUpdate> {
    try {
      const res = await apiClient.post(`/seller/admin/repair-jobs/${jobId}/updates`, payload)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.post(`/seller/repair-jobs/${jobId}/updates`, payload)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * List Shop Repair Customers
   * GET /seller/repair-customers
   */
  async getRepairCustomers(params?: {
    search?: string
    page?: number
    limit?: number
  }): Promise<RepairCustomerItem[]> {
    const res = await apiClient.get('/seller/repair-customers', { params })
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Create Repair Customer
   * POST /seller/repair-customers
   */
  async createRepairCustomer(payload: {
    name: string
    phone: string
    email?: string
    address?: string
    notes?: string
  }): Promise<RepairCustomerItem> {
    const res = await apiClient.post('/seller/repair-customers', payload)
    return res.data?.data || res.data
  },
}

export default repairService
