import apiClient from './client'

export interface Category {
  id: string
  name: string
  slug: string
  type: string
  isActive: boolean
  iconUrl?: string | null
  imageUrl?: string | null
  description?: string | null
  sortOrder?: number
  _count?: {
    products?: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  type?: string
  isActive?: boolean
  iconUrl?: string
  imageUrl?: string
  description?: string
  sortOrder?: number
}

export interface UpdateCategoryInput {
  name?: string
  slug?: string
  type?: string
  isActive?: boolean
  iconUrl?: string
  imageUrl?: string
  description?: string
  sortOrder?: number
}

export interface ListCategoriesQuery {
  type?: string
  isActive?: boolean | string
  search?: string
}

export const categoryService = {
  /**
   * List Product and Repair Categories
   * GET /categories?type=...&isActive=...
   */
  async getCategories(query?: ListCategoriesQuery): Promise<Category[]> {
    const params: Record<string, any> = {}
    if (query?.type && query.type !== 'ALL') {
      params.type = query.type.toLowerCase()
    }
    if (query?.isActive !== undefined) {
      params.isActive = String(query.isActive)
    }

    const res = await apiClient.get('/categories', { params })
    const data = res.data
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
  },

  /**
   * Get Category by ID
   * GET /categories/:id
   */
  async getCategoryById(id: string): Promise<Category> {
    const res = await apiClient.get(`/categories/${id}`)
    return res.data?.data || res.data
  },

  /**
   * Create New Category
   * POST /categories
   * Validated against createCategorySchema:
   * name: string min 2
   * slug?: string min 2
   * type?: string (default 'accessory')
   * isActive?: boolean (default true)
   */
  async createCategory(payload: CreateCategoryInput): Promise<Category> {
    const body: Record<string, any> = {
      name: payload.name.trim(),
      type: payload.type ? payload.type.toLowerCase() : 'accessory',
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    }

    if (payload.slug && payload.slug.trim()) {
      body.slug = payload.slug.trim()
    }

    if (payload.imageUrl && payload.imageUrl.trim()) {
      body.imageUrl = payload.imageUrl.trim()
    }

    if (payload.iconUrl && payload.iconUrl.trim()) {
      body.iconUrl = payload.iconUrl.trim()
    }

    if (payload.description && payload.description.trim()) {
      body.description = payload.description.trim()
    }

    const res = await apiClient.post('/categories', body)
    return res.data?.data || res.data
  },

  /**
   * Update Existing Category
   * PATCH /categories/:id
   * Validated against updateCategorySchema
   */
  async updateCategory(id: string, payload: UpdateCategoryInput): Promise<Category> {
    const body: Record<string, any> = {}

    if (payload.name !== undefined) {
      body.name = payload.name.trim()
    }

    if (payload.slug !== undefined) {
      body.slug = payload.slug.trim()
    }

    if (payload.type !== undefined) {
      body.type = payload.type.toLowerCase()
    }

    if (payload.isActive !== undefined) {
      body.isActive = payload.isActive
    }

    if (payload.imageUrl !== undefined) {
      body.imageUrl = payload.imageUrl
    }

    if (payload.iconUrl !== undefined) {
      body.iconUrl = payload.iconUrl
    }

    if (payload.description !== undefined) {
      body.description = payload.description
    }

    try {
      const res = await apiClient.patch(`/categories/${id}`, body)
      return res.data?.data || res.data
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 405) {
        const fallback = await apiClient.put(`/categories/${id}`, body)
        return fallback.data?.data || fallback.data
      }
      throw err
    }
  },

  /**
   * Delete Category
   * DELETE /categories/:id
   */
  async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.delete(`/categories/${id}`)
    return res.data
  },
}

export default categoryService
