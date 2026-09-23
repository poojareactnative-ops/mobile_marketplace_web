import { prisma } from '../db'

// Haversine formula — returns distance in km between two lat/lng points
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function getPublicProducts(params: {
  query?: string
  categoryId?: string
  shopId?: string
  condition?: string
  limit?: number
  page?: number
  lat?: number
  lng?: number
}) {
  const limit = Math.min(Math.max(params.limit || 20, 1), 50)
  const page = Math.max(params.page || 1, 1)
  const skip = (page - 1) * limit
  const hasLocation = typeof params.lat === 'number' && typeof params.lng === 'number'

  const where: any = {
    status: 'ACTIVE',
  }

  if (params.query) {
    where.OR = [
      { name: { contains: params.query } },
      { brand: { contains: params.query } },
      { modelCompatibility: { contains: params.query } },
      { description: { contains: params.query } },
    ]
  }

  if (params.categoryId) {
    where.categoryId = params.categoryId
  }

  if (params.shopId) {
    where.shopId = params.shopId
  }

  if (params.condition) {
    where.condition = params.condition
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        shop: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
            rating: true,
            reviewCount: true,
            isVerified: true,
            phone: true,
            latitude: true,
            longitude: true,
            ownerUser: {
              select: { id: true, role: true },
            },
          },
        },
      },
      // When location is provided we fetch all then sort in-memory for accurate distance.
      // When not, use DB-level pagination for efficiency.
      orderBy: hasLocation ? undefined : { createdAt: 'desc' },
      skip: hasLocation ? undefined : skip,
      take: hasLocation ? undefined : limit,
    }),
  ])

  let mapped = products.map((p) => {
    const isSuperSellerOrAdmin =
      p.shop?.type === 'SUPER_SELLER' ||
      p.shop?.ownerUser?.role === 'SUPER_SELLER' ||
      p.shop?.ownerUser?.role === 'ADMIN' ||
      p.shop?.ownerUser?.role === 'PLATFORM_ADMIN' ||
      p.shop?.ownerUser?.role === 'SELLER_ADMIN'

    let distanceKm: number | null = null
    if (hasLocation && p.shop?.latitude != null && p.shop?.longitude != null) {
      distanceKm = Math.round(haversineKm(params.lat!, params.lng!, p.shop.latitude, p.shop.longitude) * 10) / 10
    }

    return {
      ...p,
      distanceKm,
      isSuperSellerOrAdmin: Boolean(isSuperSellerOrAdmin),
      canReceiveEnquiries: Boolean(isSuperSellerOrAdmin),
      priceFormatted: `₹${(p.pricePaise / 100).toLocaleString('en-IN')}`,
      compareAtPriceFormatted: p.compareAtPricePaise
        ? `₹${(p.compareAtPricePaise / 100).toLocaleString('en-IN')}`
        : null,
    }
  })

  // Sort by distance when location available, then paginate
  if (hasLocation) {
    mapped.sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
    mapped = mapped.slice(skip, skip + limit)
  }

  return {
    products: mapped,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      locationSorted: hasLocation,
    },
  }
}

export async function getPublicRunningOffers(params: { lat?: number; lng?: number } = {}) {
  const hasLocation = typeof params.lat === 'number' && typeof params.lng === 'number'
  const now = new Date()

  const offers = await prisma.offer.findMany({
    where: {
      status: 'ACTIVE',
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          type: true,
          isVerified: true,
          rating: true,
          latitude: true,
          longitude: true,
          ownerUser: {
            select: { id: true, role: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = offers.map((o) => {
    let distanceKm: number | null = null
    if (hasLocation && o.shop?.latitude != null && o.shop?.longitude != null) {
      distanceKm = Math.round(haversineKm(params.lat!, params.lng!, o.shop.latitude, o.shop.longitude) * 10) / 10
    }
    return { ...o, distanceKm }
  })

  if (hasLocation) {
    mapped.sort((a, b) => {
      if (a.distanceKm == null) return 1
      if (b.distanceKm == null) return -1
      return a.distanceKm - b.distanceKm
    })
  }

  return { offers: mapped, locationSorted: hasLocation }
}

export async function getPublicProductById(idOrSku: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: idOrSku },
        { sku: idOrSku },
      ],
      status: 'ACTIVE',
    },
    include: {
      images: { orderBy: { position: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
      shop: {
        select: {
          id: true,
          name: true,
          type: true,
          address: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          phone: true,
          ownerUser: {
            select: { id: true, role: true, name: true },
          },
        },
      },
    },
  })

  if (!product) return null

  const isSuperSellerOrAdmin =
    product.shop?.type === 'SUPER_SELLER' ||
    product.shop?.ownerUser?.role === 'SUPER_SELLER' ||
    product.shop?.ownerUser?.role === 'ADMIN' ||
    product.shop?.ownerUser?.role === 'PLATFORM_ADMIN' ||
    product.shop?.ownerUser?.role === 'SELLER_ADMIN'

  return {
    ...product,
    images: product.images.map((img) => img.url),
    imageObjects: product.images,
    priceFormatted: `₹${(product.pricePaise / 100).toLocaleString('en-IN')}`,
    compareAtPriceFormatted: product.compareAtPricePaise
      ? `₹${(product.compareAtPricePaise / 100).toLocaleString('en-IN')}`
      : null,
    isSuperSellerOrAdmin: Boolean(isSuperSellerOrAdmin),
    canReceiveEnquiries: Boolean(isSuperSellerOrAdmin),
  }
}

export async function getPublicShopById(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: { images: true, category: true },
        take: 20,
        orderBy: { createdAt: 'desc' },
      },
      offers: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!shop) {
    throw new Error('Shop not found')
  }

  return shop
}

export async function getPublicOfferById(offerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          isVerified: true,
        },
      },
    },
  })

  if (!offer) {
    throw new Error('Offer not found')
  }

  return offer
}

export async function createPublicRepairBooking(data: {
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  brand: string
  model: string
  problemDescription: string
  preferredShopId?: string
}) {
  let targetShopId = data.preferredShopId
  if (!targetShopId) {
    const repairShop = await prisma.shop.findFirst({
      where: { type: 'SUPER_SELLER', isActive: true },
    })
    targetShopId = repairShop?.id
  }

  if (!targetShopId) {
    const anyShop = await prisma.shop.findFirst({ where: { isActive: true } })
    targetShopId = anyShop?.id
  }

  if (!targetShopId) {
    throw new Error('No active shops available for repair booking.')
  }

  let customer = await prisma.repairCustomer.findFirst({
    where: { shopId: targetShopId, phone: data.customerPhone },
  })

  if (!customer) {
    customer = await prisma.repairCustomer.create({
      data: {
        shopId: targetShopId,
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail || null,
        address: data.customerAddress || null,
      },
    })
  }

  const repairJob = await prisma.repairJob.create({
    data: {
      shopId: targetShopId,
      customerId: customer.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      brand: data.brand,
      model: data.model,
      problemDescription: data.problemDescription,
      status: 'SUBMITTED',
      updates: {
        create: {
          status: 'SUBMITTED',
          note: 'Public online repair booking submitted by customer.',
        },
      },
    },
    include: {
      shop: { select: { id: true, name: true, phone: true, address: true } },
      updates: true,
    },
  })

  return repairJob
}

export async function trackRepairJob(query: { ticketId?: string; phone?: string }) {
  if (!query.ticketId && !query.phone) {
    throw new Error('Please provide either a Ticket ID or a Phone Number.')
  }

  const where: any = {}
  if (query.ticketId) {
    where.id = query.ticketId
  } else if (query.phone) {
    where.customerPhone = query.phone
  }

  const jobs = await prisma.repairJob.findMany({
    where,
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          openingHours: true,
        },
      },
      updates: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return jobs
}
