import apiClient from './client'

export interface StoreAdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'SELLER_ADMIN' | string
  shopId: string
  status: 'ACTIVE' | 'SUSPENDED' | string
  createdAt?: string
  updatedAt?: string
}

export interface CreateStoreAdminInput {
  name: string
  email: string
  password: string
  phone: string
}

export interface UpdateStoreAdminStatusInput {
  status: 'ACTIVE' | 'SUSPENDED'
}

export const superSellerService = {
  /**
   * List Store Admins for Current Shop
   * GET /super-seller/admins (fallback to /super-seller/sellers)
   */
  async getStoreAdmins(): Promise<StoreAdminUser[]> {
    try {
      const res = await apiClient.get('/super-seller/admins')
      const data = res.data
      return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.get('/super-seller/sellers')
        const data = fallback.data
        return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      }
      throw err
    }
  },

  /**
   * Create an Admin (SELLER_ADMIN) for this Shop
   * POST /super-seller/admins (fallback to /super-seller/sellers)
   */
  async createStoreAdmin(payload: CreateStoreAdminInput): Promise<{
    success: boolean
    message: string
    data: StoreAdminUser
  }> {
    try {
      const res = await apiClient.post('/super-seller/admins', payload)
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.post('/super-seller/sellers', payload)
        return fallback.data
      }
      throw err
    }
  },

  /**
   * Suspend or Reactivate Store Admin
   * PATCH /super-seller/admins/:adminId
   */
  async updateStoreAdminStatus(
    adminId: string,
    status: 'ACTIVE' | 'SUSPENDED'
  ): Promise<{ success: boolean; message?: string; data?: StoreAdminUser }> {
    try {
      const res = await apiClient.patch(`/super-seller/admins/${adminId}`, { status })
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.patch(`/super-seller/sellers/${adminId}`, { status })
        return fallback.data
      }
      throw err
    }
  },

  /**
   * Remove Store Admin from Shop
   * DELETE /super-seller/admins/:adminId
   */
  async deleteStoreAdmin(adminId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.delete(`/super-seller/admins/${adminId}`)
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallback = await apiClient.delete(`/super-seller/sellers/${adminId}`)
        return fallback.data
      }
      throw err
    }
  },
}

export default superSellerService
