import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../db'
import { authenticateRequest, hashPassword } from '../auth'
import { superSellerCreateSellerSchema } from '../schemas'

export async function handleTeamRoutes(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string
) {
  const method = req.method

  if (path === 'super-seller/sellers' && method === 'POST') {
    const auth = await authenticateRequest(req)
    if (!auth) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
    }

    if (auth.user.role !== 'SUPER_SELLER' && auth.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only Super Sellers and Platform Admins can create sellers/admins.' },
      })
    }

    const parsed = superSellerCreateSellerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid seller parameters',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const { name, email, password, phone, role, shopId } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'A user with this email address already exists.' },
      })
    }

    const targetShopId = shopId || auth.shop?.id
    if (!targetShopId) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Super Seller must have an associated shop to assign sellers.' },
      })
    }

    const passwordHash = await hashPassword(password)
    const createdSeller = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: role || 'SELLER_ADMIN',
        status: 'ACTIVE',
        shopId: targetShopId,
        createdByUserId: auth.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        shopId: true,
        createdAt: true,
      },
    })

    return res.status(201).json({
      data: createdSeller,
      message: `${createdSeller.role === 'SELLER_ADMIN' ? 'Seller Admin' : 'Seller'} created successfully!`,
    })
  }

  if (path === 'super-seller/sellers' && method === 'GET') {
    const auth = await authenticateRequest(req)
    if (!auth) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
    }

    if (auth.user.role !== 'SUPER_SELLER' && auth.user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Only Super Sellers and Platform Admins can view team sellers.' },
      })
    }

    const sellers = await prisma.user.findMany({
      where: {
        OR: [{ createdByUserId: auth.user.id }, { shopId: auth.shop?.id }],
        role: { in: ['SELLER', 'SELLER_ADMIN'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        shopId: true,
        createdAt: true,
        shop: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ data: sellers })
  }

  return null
}
