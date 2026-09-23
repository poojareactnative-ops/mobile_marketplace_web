import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'hyperlocal-secret-jwt-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'hyperlocal-secret-refresh-key'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export interface AuthenticatedContext {
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    role: string
    status: string
    ownedShopType?: string | null
  }
  shop?: {
    id: string
    name: string
    type: string
    isActive: boolean
    isVerified: boolean
  } | null
}

export async function authenticateRequest(req: {
  headers: Record<string, string | string[] | undefined>
}): Promise<AuthenticatedContext | null> {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (!authHeader || typeof authHeader !== 'string') return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  const payload = verifyAccessToken(parts[1])
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      ownedShops: {
        where: { isActive: true },
        take: 1,
      },
      shop: true,
    },
  })

  if (!user || user.status === 'SUSPENDED') return null

  const directlyOwnedShop = user.ownedShops[0] || null
  const assignedShop = user.shop || null
  let shop: any = directlyOwnedShop || assignedShop

  // If user is ADMIN or PLATFORM_ADMIN without direct ownership or assigned shop, fallback to first active shop if applicable
  if (!shop && (user.role === 'ADMIN' || user.role === 'PLATFORM_ADMIN' || user.role === 'SELLER_ADMIN')) {
    shop = await prisma.shop.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      ownedShopType: directlyOwnedShop ? directlyOwnedShop.type : null,
    },
    shop: shop
      ? {
          id: shop.id,
          name: shop.name,
          type: shop.type,
          isActive: shop.isActive,
          isVerified: shop.isVerified,
        }
      : null,
  }
}
