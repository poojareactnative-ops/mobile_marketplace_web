import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../db'
import { authenticateRequest } from '../auth'
import { enquiryCreateSchema } from '../schemas'
import { checkRateLimit, getClientIp } from '../rateLimiter'

export async function handleEnquiryRoutes(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string
) {
  const method = req.method

  if (path === 'enquiries' && method === 'POST') {
    const clientIp = getClientIp(req)
    const rateCheck = checkRateLimit(`enquiry:${clientIp}`, 20, 60000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: { code: 'TOO_MANY_REQUESTS', message: 'Enquiry submission rate limit reached.' },
      })
    }

    const parsed = enquiryCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid enquiry fields',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const auth = await authenticateRequest(req)
    const customerUserId = auth?.user?.id || null

    let shopId = parsed.data.shopId
    let product = null
    let offer = null

    if (parsed.data.offerId) {
      offer = await prisma.offer.findUnique({
        where: { id: parsed.data.offerId },
        include: {
          shop: {
            include: {
              ownerUser: {
                select: { id: true, role: true, name: true, email: true },
              },
            },
          },
        },
      })

      if (!offer) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Offer not found' },
        })
      }

      if (offer.status !== 'ACTIVE') {
        return res.status(400).json({
          error: { code: 'OFFER_INACTIVE', message: 'Enquiries can only be sent for active, running offers.' },
        })
      }

      if (offer.endsAt && new Date(offer.endsAt) < new Date()) {
        return res.status(400).json({
          error: { code: 'OFFER_EXPIRED', message: 'This offer has expired.' },
        })
      }

      shopId = offer.shopId

      const uploaderRole = offer.shop.ownerUser?.role
      const shopType = offer.shop.type
      const isSuperSellerOrAdmin =
        shopType === 'SUPER_SELLER' ||
        uploaderRole === 'SUPER_SELLER' ||
        uploaderRole === 'ADMIN' ||
        uploaderRole === 'PLATFORM_ADMIN' ||
        uploaderRole === 'SELLER_ADMIN'

      if (!isSuperSellerOrAdmin) {
        return res.status(403).json({
          error: {
            code: 'UNAUTHORIZED_ENQUIRY',
            message: 'Offer enquiries can only be sent for offers posted by verified Admins and Super Sellers.',
          },
        })
      }
    } else if (parsed.data.productId) {
      product = await prisma.product.findUnique({
        where: { id: parsed.data.productId },
        include: {
          shop: {
            include: {
              ownerUser: {
                select: { id: true, role: true, name: true, email: true },
              },
            },
          },
        },
      })

      if (!product) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        })
      }

      shopId = product.shopId

      const uploaderRole = product.shop.ownerUser?.role
      const shopType = product.shop.type
      const isSuperSellerOrAdmin =
        shopType === 'SUPER_SELLER' ||
        uploaderRole === 'SUPER_SELLER' ||
        uploaderRole === 'ADMIN' ||
        uploaderRole === 'PLATFORM_ADMIN' ||
        uploaderRole === 'SELLER_ADMIN'

      if (!isSuperSellerOrAdmin) {
        return res.status(403).json({
          error: {
            code: 'UNAUTHORIZED_ENQUIRY',
            message: 'Product enquiries can only be sent for products uploaded by verified Admins and Super Sellers.',
          },
        })
      }
    } else if (shopId) {
      const targetShop = await prisma.shop.findUnique({
        where: { id: shopId },
        include: {
          ownerUser: {
            select: { id: true, role: true },
          },
        },
      })

      if (!targetShop) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Shop not found' },
        })
      }

      const isSuperSellerOrAdminShop =
        targetShop.type === 'SUPER_SELLER' ||
        targetShop.ownerUser?.role === 'SUPER_SELLER' ||
        targetShop.ownerUser?.role === 'ADMIN' ||
        targetShop.ownerUser?.role === 'PLATFORM_ADMIN' ||
        targetShop.ownerUser?.role === 'SELLER_ADMIN'

      if (!isSuperSellerOrAdminShop) {
        return res.status(403).json({
          error: {
            code: 'UNAUTHORIZED_ENQUIRY',
            message: 'Enquiries can only be sent to verified Admins and Super Sellers.',
          },
        })
      }
    } else {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Target product, running offer, or store required to submit enquiry.' },
      })
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        shopId: shopId!,
        productId: product?.id || parsed.data.productId || null,
        offerId: offer?.id || parsed.data.offerId || null,
        customerUserId,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        message: parsed.data.message,
      },
      include: {
        product: { select: { id: true, name: true } },
        offer: { select: { id: true, title: true, code: true } },
      },
    })

    return res.status(201).json({
      data: enquiry,
      message: enquiry.offerId ? 'Running offer enquiry sent successfully!' : 'Product enquiry sent successfully!',
    })
  }

  return null
}
