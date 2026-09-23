import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../db'
import { authenticateRequest } from '../auth'
import { productCreateSchema, productUpdateSchema } from '../schemas'
import { createCategory, getCategories } from '../services/landing.service'
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerProductById,
  getSellerProducts,
  updateSellerProduct,
} from '../services/seller.service'
import {
  createAdminUser,
  getAllPlatformRepairs,
  getAllShops,
  getAllUsers,
  getPlatformOverview,
  toggleShopActive,
  toggleShopVerification,
} from '../services/admin.service'

export async function handleAdminRoutes(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string,
  parts: string[]
) {
  const method = req.method

  const auth = await authenticateRequest(req)
  if (!auth) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
  }
  if (
    auth.user.role !== 'ADMIN' &&
    auth.user.role !== 'SUPER_SELLER' &&
    auth.user.role !== 'PLATFORM_ADMIN'
  ) {
    return res
      .status(403)
      .json({ error: { code: 'FORBIDDEN', message: 'Administrator access required' } })
  }

  if (path === 'admin/overview' && method === 'GET') {
    const overview = await getPlatformOverview()
    return res.status(200).json({ data: overview })
  }

  if (path === 'admin/categories' && method === 'GET') {
    const type = req.query.type as string | undefined
    const categories = await getCategories(type)
    return res.status(200).json({ data: categories })
  }

  if (path === 'admin/categories' && method === 'POST') {
    const { name, slug, type, imageUrl, isActive } = req.body || {}
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Category name is required' },
      })
    }
    const category = await createCategory({ name, slug, type, imageUrl, isActive })
    return res.status(201).json({ data: category, message: 'Category created successfully' })
  }

  if (path === 'admin/shops' && method === 'GET') {
    const { search, isVerified, type } = req.query
    const shops = await getAllShops({
      search: search as string,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      type: type as string,
    })
    return res.status(200).json({ data: shops })
  }

  if (
    path.startsWith('admin/shops/') &&
    parts.length === 4 &&
    parts[3] === 'verify' &&
    method === 'PATCH'
  ) {
    const targetShopId = parts[2]!
    const { isVerified } = req.body || {}
    const updated = await toggleShopVerification(targetShopId, Boolean(isVerified))
    return res.status(200).json({ data: updated })
  }

  if (
    path.startsWith('admin/shops/') &&
    parts.length === 4 &&
    parts[3] === 'active' &&
    method === 'PATCH'
  ) {
    const targetShopId = parts[2]!
    const { isActive } = req.body || {}
    const updated = await toggleShopActive(targetShopId, Boolean(isActive))
    return res.status(200).json({ data: updated })
  }

  if (path === 'admin/users' && method === 'GET') {
    const role = req.query.role as string | undefined
    const users = await getAllUsers(role)
    return res.status(200).json({ data: users })
  }

  if (path === 'admin/users' && method === 'POST') {
    const { name, email, phone, password } = req.body || {}
    if (!name || !email) {
      return res
        .status(422)
        .json({ error: { code: 'VALIDATION_ERROR', message: 'Name and email required' } })
    }
    const user = await createAdminUser({ name, email, phone, password })
    return res.status(201).json({ data: user })
  }

  if (path === 'admin/repairs' && method === 'GET') {
    const status = req.query.status as string | undefined
    const repairs = await getAllPlatformRepairs(status)
    return res.status(200).json({ data: repairs })
  }

  if (path === 'admin/products' && method === 'GET') {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50
    const search = req.query.search as string | undefined
    const category = req.query.category as string | undefined
    const stockFilter = req.query.stockFilter as string | undefined
    const targetShopId = (req.query.shopId as string) || 'ALL'
    const result = await getSellerProducts(targetShopId, {
      page,
      limit,
      search,
      category,
      stockFilter,
    })
    return res.status(200).json(result)
  }

  if (path === 'admin/products' && method === 'POST') {
    const parsed = productCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid product attributes',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    let targetShopId = parsed.data.shopId
    if (!targetShopId) {
      const firstShop = await prisma.shop.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      })
      targetShopId = firstShop?.id
    }
    if (!targetShopId) {
      return res
        .status(422)
        .json({ error: { code: 'NO_SHOP', message: 'No target shop found for product' } })
    }
    const created = await createSellerProduct(targetShopId, parsed.data)
    return res.status(201).json({ data: created })
  }

  if (path.startsWith('admin/products/') && parts.length === 3) {
    const productId = parts[2]!
    if (method === 'GET') {
      const product = await getSellerProductById('ALL', productId)
      if (!product)
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } })
      return res.status(200).json({ data: product })
    }

    if (method === 'PATCH') {
      const parsed = productUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update payload',
            fields: parsed.error.flatten().fieldErrors,
          },
        })
      }
      const updated = await updateSellerProduct('ALL', productId, parsed.data)
      return res.status(200).json({ data: updated })
    }

    if (method === 'DELETE') {
      await deleteSellerProduct('ALL', productId)
      return res.status(204).end()
    }
  }

  return null
}
