import { prisma } from '../db'
import { hashPassword } from '../auth'

export async function getPlatformOverview() {
  const [
    totalShops,
    verifiedShops,
    totalProducts,
    totalOrders,
    orderAggregate,
    totalRepairs,
    pendingRepairs,
    totalUsers,
    recentShops,
    recentRepairs,
  ] = await Promise.all([
    prisma.shop.count(),
    prisma.shop.count({ where: { isVerified: true } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalPaise: true } }),
    prisma.repairJob.count(),
    prisma.repairJob.count({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'APPROVED', 'IN_PROGRESS'] },
      },
    }),
    prisma.user.count(),
    prisma.shop.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        ownerUser: { select: { name: true, email: true } },
        _count: { select: { products: true, repairJobs: true } },
      },
    }),
    prisma.repairJob.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        shop: { select: { name: true } },
      },
    }),
  ])

  return {
    metrics: {
      totalGmvPaise: orderAggregate._sum.totalPaise || 0,
      totalShops,
      verifiedShops,
      totalProducts,
      totalOrders,
      totalRepairs,
      pendingRepairs,
      totalUsers,
    },
    recentShops,
    recentRepairs,
  }
}

export async function getAllShops(query?: { search?: string; isVerified?: boolean; type?: string }) {
  const where: any = {}
  if (query?.search) {
    where.OR = [
      { name: { contains: query.search } },
      { address: { contains: query.search } },
      { phone: { contains: query.search } },
    ]
  }
  if (query?.isVerified !== undefined) {
    where.isVerified = query.isVerified
  }
  if (query?.type) {
    where.type = query.type
  }

  const shops = await prisma.shop.findMany({
    where,
    include: {
      ownerUser: { select: { id: true, name: true, email: true, phone: true } },
      _count: { select: { products: true, repairJobs: true, orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return shops
}

export async function toggleShopVerification(shopId: string, isVerified: boolean) {
  return prisma.shop.update({
    where: { id: shopId },
    data: { isVerified },
  })
}

export async function toggleShopActive(shopId: string, isActive: boolean) {
  return prisma.shop.update({
    where: { id: shopId },
    data: { isActive },
  })
}

export async function getAllUsers(role?: string) {
  const where: any = {}
  if (role) {
    where.role = role
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      ownedShops: { select: { id: true, name: true, type: true } },
      _count: { select: { orders: true, enquiries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllPlatformRepairs(status?: string) {
  const where: any = {}
  if (status) {
    where.status = status
  }

  return prisma.repairJob.findMany({
    where,
    include: {
      shop: { select: { id: true, name: true, phone: true } },
      updates: { take: 1, orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createAdminUser(data: { name: string; email: string; phone?: string; password?: string }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    throw new Error('User with this email already exists')
  }

  const defaultPassword = data.password || 'admin123'
  const passwordHash = await hashPassword(defaultPassword)

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })
}
