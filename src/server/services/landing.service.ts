import prisma from '../db'

function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371000 // Earth radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export async function getLandingPageData() {
  const [sections, testimonials, categories, featuredOffers] = await Promise.all([
    prisma.landingPageSection.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.offer.findMany({
      where: { status: 'ACTIVE' },
      include: {
        shop: {
          select: { id: true, name: true, address: true, rating: true },
        },
      },
      take: 6,
    }),
  ])

  const heroSection = sections.find((s) => s.key === 'hero')
  const topBannerSection = sections.find((s) => s.key === 'top_banner')

  return {
    topBanner: {
      text: topBannerSection?.title || 'Same-day repairs near you',
      subtitle: topBannerSection?.subtitle || 'Explore verified shops within 500m to 5km',
      isVisible: topBannerSection?.isPublished ?? true,
    },
    hero: {
      title: heroSection?.title || 'Mobile repairs and accessories, nearby',
      subtitle: heroSection?.subtitle || 'Compare trusted local sellers, request fast repairs, and get genuine accessories.',
      ctaLabel: heroSection?.ctaLabel || 'Find nearby shops',
      ctaUrl: heroSection?.ctaUrl || '#shops',
    },
    featuredCategories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      type: c.type,
      imageUrl: c.imageUrl,
    })),
    howItWorks: [
      {
        step: '1',
        title: 'Share your location',
        description: 'Allow location detection or specify your search radius to find shops near you.',
        sortOrder: 1,
      },
      {
        step: '2',
        title: 'Compare trusted sellers',
        description: 'Review genuine ratings, verified service badges, pricing, and live inventory.',
        sortOrder: 2,
      },
      {
        step: '3',
        title: 'Instant enquiry or walk-in',
        description: 'Send direct questions to sellers or get directions for immediate service.',
        sortOrder: 3,
      },
    ],
    features: [
      {
        title: 'Verified Local Sellers',
        description: 'Every shop is inspected for quality parts, authentic accessories, and certified technician skills.',
        icon: 'ShieldCheck',
      },
      {
        title: 'Transparent Pricing',
        description: 'Standard repair estimates and real-time accessory prices with zero hidden markups.',
        icon: 'Tag',
      },
      {
        title: 'Fast Turnaround',
        description: 'Over 85% of standard battery and screen repairs are completed on the very same day.',
        icon: 'Zap',
      },
    ],
    testimonials: testimonials.map((t) => ({
      id: t.id,
      authorName: t.authorName,
      role: t.role || 'Verified Customer',
      quote: t.quote,
      rating: t.rating,
    })),
    featuredOffers: featuredOffers.map((o) => ({
      id: o.id,
      title: o.title,
      text: o.text,
      description: o.description,
      code: o.code,
      color: o.themeColor,
      shop: o.shop.name,
      rating: o.shop.rating,
    })),
  }
}

export async function getNearbyShops(params: {
  lat: number
  lng: number
  radiusMeters: number
  type?: string
}) {
  const { lat, lng, radiusMeters, type } = params

  const shops = await prisma.shop.findMany({
    where: {
      isActive: true,
      ...(type ? { type: type.toUpperCase() } : {}),
    },
    select: {
      id: true,
      name: true,
      type: true,
      address: true,
      phone: true,
      latitude: true,
      longitude: true,
      isVerified: true,
      rating: true,
      reviewCount: true,
      openingHours: true,
      description: true,
    },
  })

  const withDistance = shops
    .map((shop) => {
      const distanceMeters = calculateHaversineMeters(lat, lng, shop.latitude, shop.longitude)
      const services =
        shop.type === 'SUPER_SELLER'
          ? ['Screen repair', 'Battery replacement', 'OEM Accessories', 'Diagnostics']
          : ['Phone Cases', 'Fast Chargers', 'Tempered Glass', 'Audio Cables']

      return {
        id: shop.id,
        name: shop.name,
        type: shop.type,
        distanceMeters,
        distanceKm: (distanceMeters / 1000).toFixed(1) + ' km',
        address: shop.address || 'Central Bangalore',
        phone: shop.phone,
        isVerified: shop.isVerified,
        rating: shop.rating,
        reviewCount: shop.reviewCount,
        openingHours: shop.openingHours,
        description: shop.description,
        services,
      }
    })
    .filter((s) => s.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)

  return withDistance
}

export async function getFeaturedProducts(
  limit = 12,
  categoryId?: string | null,
  search?: string | null,
  sortBy?: string | null
) {
  const where: any = { status: 'ACTIVE' }

  if (categoryId && categoryId !== 'ALL') {
    where.categoryId = categoryId
  }

  if (search && search.trim()) {
    const q = search.trim()
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
      { description: { contains: q } },
      { modelCompatibility: { contains: q } },
    ]
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sortBy === 'price_asc') {
    orderBy = { pricePaise: 'asc' }
  } else if (sortBy === 'price_desc') {
    orderBy = { pricePaise: 'desc' }
  } else if (sortBy === 'discount') {
    orderBy = { discountPercent: 'desc' }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          type: true,
          rating: true,
          address: true,
          phone: true,
          isVerified: true,
          ownerUser: {
            select: { id: true, role: true, name: true, email: true },
          },
        },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        orderBy: { position: 'asc' },
        take: 4,
      },
    },
    take: limit,
    orderBy,
  })

  return products.map((p) => {
    const isSuperSellerOrAdmin =
      p.shop?.type === 'SUPER_SELLER' ||
      p.shop?.ownerUser?.role === 'SUPER_SELLER' ||
      p.shop?.ownerUser?.role === 'ADMIN' ||
      p.shop?.ownerUser?.role === 'PLATFORM_ADMIN' ||
      p.shop?.ownerUser?.role === 'SELLER_ADMIN'

    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      sku: p.sku,
      pricePaise: p.pricePaise,
      price: p.pricePaise / 100,
      priceFormatted: `₹${(p.pricePaise / 100).toLocaleString('en-IN')}`,
      compareAtPricePaise: p.compareAtPricePaise,
      oldPrice: p.compareAtPricePaise ? p.compareAtPricePaise / 100 : null,
      compareAtPriceFormatted: p.compareAtPricePaise
        ? `₹${(p.compareAtPricePaise / 100).toLocaleString('en-IN')}`
        : null,
      discountPercent: p.discountPercent || 0,
      discount: p.discountPercent || 0,
      stock: p.stock,
      condition: p.condition,
      warranty: p.warranty,
      description: p.description,
      modelCompatibility: p.modelCompatibility,
      features: p.features,
      tags: p.tags,
      category: p.category?.name || 'Accessories',
      categoryId: p.categoryId,
      seller: p.shop?.name || 'Nearby Shop',
      shopId: p.shop?.id,
      shopType: p.shop?.type || 'SUPER_SELLER',
      uploaderRole: p.shop?.ownerUser?.role || 'SUPER_SELLER',
      isSuperSellerOrAdmin: Boolean(isSuperSellerOrAdmin),
      canReceiveEnquiries: Boolean(isSuperSellerOrAdmin),
      shopAddress: p.shop?.address,
      shopPhone: p.shop?.phone,
      isVerifiedShop: p.shop?.isVerified ?? true,
      rating: p.shop?.rating || 4.8,
      images: p.images && p.images.length > 0 ? p.images.map((img) => img.url) : [],
      createdAt: p.createdAt,
    }
  })
}

export async function getCategories(type?: string) {
  return prisma.category.findMany({
    where: {
      isActive: true,
      ...(type ? { type: type.toUpperCase() } : {}),
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function createCategory(data: {
  name: string
  slug?: string
  type?: string
  imageUrl?: string
  isActive?: boolean
}) {
  const trimmedName = data.name.trim()
  if (!trimmedName) {
    throw new Error('Category name is required')
  }
  const slug = (data.slug?.trim() || trimmedName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `category-${Date.now()}`

  return prisma.category.upsert({
    where: { slug },
    update: {
      name: trimmedName,
      type: (data.type || 'ACCESSORY').toUpperCase(),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
    create: {
      name: trimmedName,
      slug,
      type: (data.type || 'ACCESSORY').toUpperCase(),
      imageUrl: data.imageUrl || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  })
}


export async function getShopDetails(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: { images: true, category: true },
      },
      offers: {
        where: { status: 'ACTIVE' },
      },
    },
  })

  return shop
}
