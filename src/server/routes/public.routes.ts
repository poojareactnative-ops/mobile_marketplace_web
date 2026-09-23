import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '../auth'
import { nearbyShopsQuerySchema } from '../schemas'
import { checkRateLimit, getClientIp } from '../rateLimiter'
import {
  createCategory,
  getCategories,
  getFeaturedProducts,
  getLandingPageData,
  getNearbyShops,
  getShopDetails,
} from '../services/landing.service'
import {
  createPublicRepairBooking,
  getPublicOfferById,
  getPublicProductById,
  getPublicProducts,
  getPublicRunningOffers,
  getPublicShopById,
  trackRepairJob,
} from '../services/public.service'

export async function handlePublicRoutes(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string,
  parts: string[]
) {
  const method = req.method

  if (path === 'public/landing-page' && method === 'GET') {
    const data = await getLandingPageData()
    return res.status(200).json({ data })
  }

  if (path === 'shops/nearby' && method === 'GET') {
    const clientIp = getClientIp(req)
    const rateCheck = checkRateLimit(`nearby:${clientIp}`, 120, 60000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: { code: 'TOO_MANY_REQUESTS', message: 'Search query rate limit reached. Please slow down.' },
      })
    }

    const parsed = nearbyShopsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid coordinate parameters. Valid lat and lng are required.',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const shops = await getNearbyShops(parsed.data)
    return res.status(200).json({ data: shops })
  }

  if (path === 'products/featured' && method === 'GET') {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12
    const categoryId = req.query.categoryId as string | undefined
    const search = (req.query.q || req.query.search) as string | undefined
    const sortBy = req.query.sortBy as string | undefined
    const products = await getFeaturedProducts(limit, categoryId, search, sortBy)
    return res.status(200).json({ data: products })
  }

  if (path === 'categories' && method === 'GET') {
    const type = req.query.type as string | undefined
    const categories = await getCategories(type)
    return res.status(200).json({ data: categories })
  }

  if (path === 'categories' && method === 'POST') {
    const auth = await authenticateRequest(req)
    if (!auth) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
    }

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

  if (path.startsWith('shops/') && method === 'GET') {
    const shopId = parts[1]!
    if (parts.length === 2) {
      const shop = await getShopDetails(shopId)
      if (!shop) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Shop not found' } })
      return res.status(200).json({ data: shop })
    }
    if (parts.length === 3 && parts[2] === 'products') {
      const shop = await getShopDetails(shopId)
      if (!shop) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Shop not found' } })
      return res.status(200).json({ data: shop.products })
    }
  }

  if ((path === 'public/offers/running' || path === 'offers/running') && method === 'GET') {
    const { lat, lng } = req.query
    const userLat = lat ? parseFloat(lat as string) : undefined
    const userLng = lng ? parseFloat(lng as string) : undefined
    const result = await getPublicRunningOffers({ lat: userLat, lng: userLng })
    return res.status(200).json({ data: result.offers, locationSorted: result.locationSorted })
  }

  if (path === 'public/products' && method === 'GET') {
    const { q, categoryId, shopId, condition, limit, page, lat, lng } = req.query
    const userLat = lat ? parseFloat(lat as string) : undefined
    const userLng = lng ? parseFloat(lng as string) : undefined
    const result = await getPublicProducts({
      query: q as string,
      categoryId: categoryId as string,
      shopId: shopId as string,
      condition: condition as string,
      limit: limit ? parseInt(limit as string, 10) : 20,
      page: page ? parseInt(page as string, 10) : 1,
      lat: userLat,
      lng: userLng,
    })
    return res.status(200).json({ data: result.products, meta: result.meta })
  }

  if (
    ((path.startsWith('public/products/') && parts.length === 3) ||
      (path.startsWith('products/') && parts.length === 2 && parts[1] !== 'featured')) &&
    method === 'GET'
  ) {
    const productId = parts.length === 3 ? parts[2]! : parts[1]!
    const product = await getPublicProductById(productId)
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } })
    }
    return res.status(200).json({ data: product })
  }

  if (path.startsWith('public/shops/') && method === 'GET') {
    const shopId = parts[2]
    if (!shopId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Shop ID required' } })
    const shop = await getPublicShopById(shopId)
    return res.status(200).json({ data: shop })
  }

  if (path.startsWith('public/offers/') && method === 'GET') {
    const offerId = parts[2]
    if (!offerId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Offer ID required' } })
    const offer = await getPublicOfferById(offerId)
    return res.status(200).json({ data: offer })
  }

  if (path === 'public/repairs/book' && method === 'POST') {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      brand,
      model,
      problemDescription,
      preferredShopId,
    } = req.body || {}
    if (!customerName || !customerPhone || !brand || !problemDescription) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'Name, phone, brand, and problem description are required.' },
      })
    }
    const job = await createPublicRepairBooking({
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      brand,
      model: model || 'Standard',
      problemDescription,
      preferredShopId,
    })
    return res.status(201).json({ data: job })
  }

  if (path === 'public/repairs/track' && method === 'GET') {
    const { ticketId, phone } = req.query
    if (!ticketId && !phone) {
      return res.status(422).json({
        error: { code: 'VALIDATION_ERROR', message: 'Please provide ticketId or phone parameter.' },
      })
    }
    const jobs = await trackRepairJob({ ticketId: ticketId as string, phone: phone as string })
    return res.status(200).json({ data: jobs })
  }

  return null
}
