import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../db'
import {
  authenticateRequest,
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../auth'
import { loginSchema, registerSchema } from '../schemas'
import { checkRateLimit, getClientIp } from '../rateLimiter'

export async function handleAuthRoutes(req: NextApiRequest, res: NextApiResponse, path: string) {
  const method = req.method

  if (path === 'auth/register' && method === 'POST') {
    const clientIp = getClientIp(req)
    const rateCheck = checkRateLimit(`register:${clientIp}`, 10, 3600000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many registration requests. Please try again later.',
        },
      })
    }

    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration parameters',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const { email, password, name, phone, role, shopName } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'Email address is already registered' },
      })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: role === 'ADMIN' || role === 'PLATFORM_ADMIN' ? 'PLATFORM_ADMIN' : role,
        status: role === 'SELLER' ? 'PENDING_VERIFICATION' : 'ACTIVE',
      },
    })

    let shop = null
    if (role === 'SELLER' || role === 'SUPER_SELLER') {
      shop = await prisma.shop.create({
        data: {
          ownerUserId: user.id,
          name: shopName || `${name}'s Mobile Shop`,
          type: role === 'SUPER_SELLER' ? 'SUPER_SELLER' : 'ACCESSORY_SELLER',
          address: parsed.data.address || 'Central Bangalore',
          latitude: parsed.data.latitude || 12.9716,
          longitude: parsed.data.longitude || 77.5946,
          isActive: true,
          isVerified: false,
        },
      })
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role })

    return res.status(201).json({
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        shop: shop ? { id: shop.id, name: shop.name, type: shop.type } : null,
        tokens: { accessToken, refreshToken },
      },
    })
  }

  if (path === 'auth/login' && method === 'POST') {
    const clientIp = getClientIp(req)
    const rateCheck = checkRateLimit(`login:${clientIp}`, 15, 60000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many login attempts. Please wait a moment.',
        },
      })
    }

    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password required',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({
      where: { email },
      include: { ownedShops: { where: { isActive: true }, take: 1 } },
    })

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'NOT_REGISTERED',
          message: 'No registered user found with this email. Please register first.',
        },
      })
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended. Please contact support.',
        },
      })
    }

    const validPassword = await comparePassword(password, user.passwordHash)
    if (!validPassword) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect password. Please try again.' },
      })
    }

    const shop = user.ownedShops[0] || null
    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role })

    return res.status(200).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        shop: shop ? { id: shop.id, name: shop.name, type: shop.type } : null,
        tokens: { accessToken, refreshToken },
      },
    })
  }

  if (path === 'auth/super-seller/register' && method === 'POST') {
    const clientIp = getClientIp(req)
    const rateCheck = checkRateLimit(`register:${clientIp}`, 10, 3600000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many registration requests. Please try again later.',
        },
      })
    }

    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration parameters',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const { email, password, name, phone, shopName, address, latitude, longitude } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'Email address is already registered' },
      })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'SUPER_SELLER',
        status: 'ACTIVE',
      },
    })

    const shop = await prisma.shop.create({
      data: {
        ownerUserId: user.id,
        name: shopName || `${name}'s Super Store`,
        type: 'SUPER_SELLER',
        address: address || 'Central Bangalore',
        latitude: latitude || 12.9716,
        longitude: longitude || 77.5946,
        isActive: true,
        isVerified: true,
      },
    })

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role })

    return res.status(201).json({
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        shop: { id: shop.id, name: shop.name, type: shop.type },
        tokens: { accessToken, refreshToken },
      },
    })
  }

  if (path === 'auth/super-seller/login' && method === 'POST') {
    const clientIp = getClientIp(req)
    const rateCheck = checkRateLimit(`login:${clientIp}`, 15, 60000)
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many login attempts. Please wait a moment.',
        },
      })
    }

    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password required',
          fields: parsed.error.flatten().fieldErrors,
        },
      })
    }

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedShops: { where: { isActive: true }, take: 1 },
        shop: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' },
      })
    }

    if (user.role !== 'SUPER_SELLER' && user.role !== 'PLATFORM_ADMIN') {
      return res.status(403).json({
        error: {
          code: 'ROLE_FORBIDDEN',
          message: 'This portal is reserved for Super Sellers. Please use standard login.',
        },
      })
    }

    const isMatch = await comparePassword(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' },
      })
    }

    const directlyOwnedShop = user.ownedShops[0] || null
    const shop = directlyOwnedShop || user.shop || null

    const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role })

    return res.status(200).json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        shop: shop ? { id: shop.id, name: shop.name, type: shop.type } : null,
        tokens: { accessToken, refreshToken },
      },
    })
  }

  if (path === 'auth/refresh' && method === 'POST') {
    const { refreshToken } = req.body || {}
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: { code: 'TOKEN_REQUIRED', message: 'Refresh token required' } })
    }

    const payload = verifyRefreshToken(refreshToken)
    if (!payload) {
      return res
        .status(401)
        .json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.status === 'SUSPENDED') {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User inactive' } })
    }

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return res.status(200).json({
      data: { tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } },
    })
  }

  if (path === 'auth/logout' && method === 'POST') {
    return res.status(200).json({ data: { message: 'Logged out successfully' } })
  }

  if (path === 'auth/me' && method === 'GET') {
    const auth = await authenticateRequest(req)
    if (!auth) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
    }
    return res.status(200).json({ data: auth })
  }

  return null
}
