import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../db'
import { authenticateRequest } from '../auth'
import {
  enquiryUpdateSchema,
  offerCreateSchema,
  offerUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  repairCustomerCreateSchema,
  repairJobCreateSchema,
  repairJobUpdateSchema,
  repairPaymentSchema,
  repairUpdateSchema,
  shopUpdateSchema,
} from '../schemas'
import { createCategory, getCategories } from '../services/landing.service'
import {
  createSellerOffer,
  createSellerProduct,
  deleteSellerOffer,
  deleteSellerProduct,
  getSellerDashboard,
  getSellerEnquiries,
  getSellerOffers,
  getSellerOrders,
  getSellerProductById,
  getSellerProducts,
  getSellerShopProfile,
  updateSellerEnquiry,
  updateSellerOffer,
  updateSellerProduct,
  updateSellerShopProfile,
} from '../services/seller.service'
import {
  createRepairCustomer,
  createRepairJob,
  createRepairUpdate,
  getRepairCustomers,
  getRepairJobById,
  getRepairJobs,
  recordRepairPayment,
  updateRepairJob,
} from '../services/repair.service'

export async function handleSellerRoutes(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string,
  parts: string[]
) {
  const method = req.method

  const auth = await authenticateRequest(req)
  if (!auth) {
    return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
  }

  let shopId = auth.shop?.id
  if (!shopId && (auth.user.role === 'PLATFORM_ADMIN' || auth.user.role === 'ADMIN')) {
    const reqShop = (req.body?.shopId || req.query?.shopId) as string | undefined
    if (reqShop) {
      shopId = reqShop
    } else {
      const defaultShop = await prisma.shop.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      })
      shopId = defaultShop?.id
    }
  }

  if (!shopId) {
    return res.status(403).json({
      error: { code: 'NO_ACTIVE_SHOP', message: 'User does not have an active seller shop' },
    })
  }

  // 1. Dashboard summary
  if (path === 'seller/dashboard' && method === 'GET') {
    const period = (req.query.period as string) || '30d'
    const summary = await getSellerDashboard(shopId, period)
    return res.status(200).json({ data: summary })
  }

  // Categories
  if (path === 'seller/categories' && method === 'GET') {
    const type = req.query.type as string | undefined
    const categories = await getCategories(type)
    return res.status(200).json({ data: categories })
  }

  if (path === 'seller/categories' && method === 'POST') {
    const isSuperSellerOrAdmin =
      auth.user.role === 'SUPER_SELLER' ||
      auth.user.role === 'ADMIN' ||
      auth.user.role === 'PLATFORM_ADMIN' ||
      auth.user.ownedShopType === 'SUPER_SELLER'

    if (!isSuperSellerOrAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only Super Sellers and Administrators can create product categories',
        },
      })
    }

    const { name, slug, type, imageUrl, isActive } = req.body || {}
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Category name is required' },
      })
    }

    try {
      const category = await createCategory({ name, slug, type, imageUrl, isActive })
      return res.status(201).json({ data: category, message: 'Category created successfully' })
    } catch (err: any) {
      return res.status(400).json({
        error: { code: 'CATEGORY_CREATION_FAILED', message: err.message || 'Failed to create category' },
      })
    }
  }

  // 2. Products CRUD
  if (path === 'seller/products' && method === 'GET') {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    const search = req.query.search as string | undefined
    const category = req.query.category as string | undefined
    const stockFilter = req.query.stockFilter as string | undefined

    const effectiveShopId =
      auth.user.role === 'PLATFORM_ADMIN' || auth.user.role === 'ADMIN'
        ? ((req.query.shopId as string) || 'ALL')
        : shopId

    const result = await getSellerProducts(effectiveShopId, {
      page,
      limit,
      search,
      category,
      stockFilter,
    })
    return res.status(200).json(result)
  }

  if (path === 'seller/products' && method === 'POST') {
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
    const targetShopId =
      (auth.user.role === 'PLATFORM_ADMIN' || auth.user.role === 'ADMIN') && parsed.data.shopId
        ? parsed.data.shopId
        : shopId
    const created = await createSellerProduct(targetShopId, parsed.data)
    return res.status(201).json({ data: created })
  }

  if (path.startsWith('seller/products/') && parts.length === 3) {
    const productId = parts[2]!
    const effectiveShopId =
      auth.user.role === 'PLATFORM_ADMIN' || auth.user.role === 'ADMIN' ? 'ALL' : shopId

    if (method === 'GET') {
      const product = await getSellerProductById(effectiveShopId, productId)
      if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } })
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
      const updated = await updateSellerProduct(effectiveShopId, productId, parsed.data)
      return res.status(200).json({ data: updated })
    }

    if (method === 'DELETE') {
      await deleteSellerProduct(effectiveShopId, productId)
      return res.status(204).end()
    }
  }

  // 3. Offers
  if (path === 'seller/offers' && method === 'GET') {
    const offers = await getSellerOffers(shopId)
    return res.status(200).json({ data: offers })
  }

  if (path === 'seller/offers' && method === 'POST') {
    const parsed = offerCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid offer parameters',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    const offer = await createSellerOffer(shopId, parsed.data)
    return res.status(201).json({ data: offer })
  }

  if (path.startsWith('seller/offers/') && parts.length === 3) {
    const offerId = parts[2]!
    if (method === 'PATCH') {
      const parsed = offerUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid offer update payload',
            fields: parsed.error.flatten().fieldErrors,
          },
        })
      }
      const updated = await updateSellerOffer(shopId, offerId, parsed.data)
      return res.status(200).json({ data: updated })
    }
    if (method === 'DELETE') {
      await deleteSellerOffer(shopId, offerId)
      return res.status(204).end()
    }
  }

  // 4. Enquiries
  if (path === 'seller/enquiries' && method === 'GET') {
    const enquiries = await getSellerEnquiries(shopId)
    return res.status(200).json({ data: enquiries })
  }

  if (path.startsWith('seller/enquiries/') && parts.length === 3 && method === 'PATCH') {
    const enquiryId = parts[2]!
    const parsed = enquiryUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid enquiry update',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    const updated = await updateSellerEnquiry(shopId, enquiryId, parsed.data)
    return res.status(200).json({ data: updated })
  }

  // 5. Orders
  if (path === 'seller/orders' && method === 'GET') {
    const orders = await getSellerOrders(shopId)
    return res.status(200).json({ data: orders })
  }

  // 6. Shop Profile
  if (path === 'seller/shop' && method === 'GET') {
    const profile = await getSellerShopProfile(shopId)
    return res.status(200).json({ data: profile })
  }

  if (path === 'seller/shop' && method === 'PATCH') {
    const parsed = shopUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile payload',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    const updated = await updateSellerShopProfile(shopId, parsed.data)
    return res.status(200).json({ data: updated })
  }

  // 7. Repair Customer & Workflow APIs
  if (path === 'seller/repair-customers' && method === 'GET') {
    const customers = await getRepairCustomers(shopId)
    return res.status(200).json({ data: customers })
  }

  if (path === 'seller/repair-customers' && method === 'POST') {
    const parsed = repairCustomerCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid customer fields',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    const customer = await createRepairCustomer(shopId, parsed.data)
    return res.status(201).json({ data: customer })
  }

  if (path === 'seller/repair-jobs' && method === 'GET') {
    const status = req.query.status as string | undefined
    const jobs = await getRepairJobs(shopId, status)
    return res.status(200).json({ data: jobs })
  }

  if (path === 'seller/repair-jobs' && method === 'POST') {
    const parsed = repairJobCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid repair job fields',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    const job = await createRepairJob(shopId, parsed.data, auth.user.id)
    return res.status(201).json({ data: job })
  }

  if (path.startsWith('seller/repair-jobs/') && parts.length === 3) {
    const jobId = parts[2]!
    const effectiveShopId =
      auth.user.role === 'PLATFORM_ADMIN' || auth.user.role === 'ADMIN' ? 'ALL' : shopId
    if (method === 'GET') {
      const job = await getRepairJobById(effectiveShopId, jobId)
      if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Repair job not found' } })
      return res.status(200).json({ data: job })
    }

    if (method === 'PATCH') {
      const parsed = repairJobUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid repair job update',
            fields: parsed.error.flatten().fieldErrors,
          },
        })
      }
      const updated = await updateRepairJob(effectiveShopId, jobId, parsed.data, auth.user.id)
      return res.status(200).json({ data: updated })
    }
  }

  if (
    path.startsWith('seller/repair-jobs/') &&
    parts.length === 4 &&
    parts[3] === 'updates' &&
    method === 'POST'
  ) {
    const jobId = parts[2]!
    const parsed = repairUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    const update = await createRepairUpdate(shopId, jobId, parsed.data, auth.user.id)
    return res.status(201).json({ data: update })
  }

  if (
    path.startsWith('seller/repair-jobs/') &&
    parts.length === 4 &&
    parts[3] === 'payments' &&
    method === 'POST'
  ) {
    const jobId = parts[2]!
    const parsed = repairPaymentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payment payload',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }
    const payment = await recordRepairPayment(shopId, jobId, parsed.data)
    return res.status(201).json({ data: payment })
  }

  return null
}
