import prisma from '../db'

export * from './sellerProduct.service'

export async function getSellerDashboard(shopId: string, _period = '30d') {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      ownerUser: {
        select: { name: true, email: true },
      },
    },
  })

  if (!shop) {
    throw new Error('SHOP_NOT_FOUND')
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    activeProductsCount,
    lowStockCount,
    ordersCount,
    activeOffersCount,
    newEnquiriesCount,
    revenueAgg,
    recentProducts,
    recentEnquiries,
    ordersInPeriod,
  ] = await Promise.all([
    prisma.product.count({
      where: { shopId, status: 'ACTIVE' },
    }),
    prisma.product.count({
      where: { shopId, status: 'ACTIVE', stock: { lte: 5 } },
    }),
    prisma.order.count({
      where: { shopId },
    }),
    prisma.offer.count({
      where: { shopId, status: 'ACTIVE' },
    }),
    prisma.enquiry.count({
      where: { shopId, status: 'NEW' },
    }),
    prisma.order.aggregate({
      where: {
        shopId,
        status: { in: ['COMPLETED', 'CONFIRMED'] },
      },
      _sum: {
        totalPaise: true,
      },
    }),
    prisma.product.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        pricePaise: true,
        stock: true,
        status: true,
        category: { select: { name: true } },
      },
    }),
    prisma.enquiry.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        message: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: {
        shopId,
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['COMPLETED', 'CONFIRMED'] },
      },
      select: {
        totalPaise: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const totalRevenuePaise = revenueAgg._sum.totalPaise || 0

  const dayBuckets: { [key: string]: number } = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    dayBuckets[key] = 0
  }

  ordersInPeriod.forEach((ord) => {
    const key = ord.createdAt.toISOString().split('T')[0]
    if (dayBuckets[key] !== undefined) {
      dayBuckets[key] += ord.totalPaise
    }
  })

  const chartData = Object.entries(dayBuckets).map(([date, amountPaise]) => ({
    date,
    revenue: amountPaise / 100,
  }))

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      phone: shop.phone,
      address: shop.address,
      type: shop.type,
      isVerified: shop.isVerified,
      owner: shop.ownerUser,
    },
    metrics: {
      totalProducts: activeProductsCount,
      lowStockAlerts: lowStockCount,
      totalOrders: ordersCount,
      activeOffers: activeOffersCount,
      newEnquiries: newEnquiriesCount,
      totalRevenuePaise,
      totalRevenueFormatted: `₹${(totalRevenuePaise / 100).toLocaleString('en-IN')}`,
    },
    chartData,
    recentProducts: recentProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: (p.pricePaise / 100).toString(),
      priceFormatted: `₹${(p.pricePaise / 100).toLocaleString('en-IN')}`,
      stock: p.stock,
      status: p.status,
      category: p.category?.name || 'Uncategorized',
    })),
    recentEnquiries: recentEnquiries.map((e) => ({
      id: e.id,
      customerName: e.customerName || 'Customer',
      customerPhone: e.customerPhone,
      message: e.message,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
    })),
  }
}

export async function getSellerOffers(shopId: string) {
  return prisma.offer.findMany({
    where: { shopId },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSellerOffer(shopId: string, data: any) {
  return prisma.offer.create({
    data: {
      shopId,
      productId: data.productId || null,
      title: data.title,
      description: data.description,
      discountPercent: data.discountPercent,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      status: data.status || 'ACTIVE',
    },
  })
}

export async function updateSellerOffer(shopId: string, offerId: string, data: any) {
  const existing = await prisma.offer.findFirst({
    where: { id: offerId, shopId },
  })
  if (!existing) throw new Error('OFFER_NOT_FOUND')

  return prisma.offer.update({
    where: { id: offerId },
    data: {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      discountPercent: data.discountPercent ?? undefined,
      validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
      validTo: data.validTo ? new Date(data.validTo) : undefined,
      status: data.status ?? undefined,
    },
  })
}

export async function deleteSellerOffer(shopId: string, offerId: string) {
  const existing = await prisma.offer.findFirst({
    where: { id: offerId, shopId },
  })
  if (!existing) throw new Error('OFFER_NOT_FOUND')

  await prisma.offer.delete({ where: { id: offerId } })
  return true
}

export async function getSellerEnquiries(shopId: string) {
  const enquiries = await prisma.enquiry.findMany({
    where: { shopId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: { take: 1, select: { url: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return enquiries.map((e) => ({
    ...e,
    productName: e.product?.name,
    productImage: e.product?.images[0]?.url,
  }))
}

export async function updateSellerEnquiry(shopId: string, enquiryId: string, data: any) {
  const existing = await prisma.enquiry.findFirst({
    where: { id: enquiryId, shopId },
  })
  if (!existing) throw new Error('ENQUIRY_NOT_FOUND')

  return prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      status: data.status,
      response: data.response,
    },
  })
}

export async function getSellerOrders(shopId: string) {
  return prisma.order.findMany({
    where: { shopId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSellerShopProfile(shopId: string) {
  return prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      ownerUser: { select: { id: true, name: true, email: true, phone: true } },
    },
  })
}

export async function updateSellerShopProfile(shopId: string, data: any) {
  return prisma.shop.update({
    where: { id: shopId },
    data: {
      name: data.name ?? undefined,
      phone: data.phone ?? undefined,
      address: data.address ?? undefined,
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      description: data.description ?? undefined,
      upiId: data.upiId ?? undefined,
    },
  })
}
