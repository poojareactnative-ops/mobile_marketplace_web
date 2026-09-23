import prisma from '../db'

export async function getSellerProducts(
  shopId: string,
  params: {
    page?: number
    limit?: number
    search?: string
    category?: string
    stockFilter?: string
  }
) {
  const page = Math.max(1, params.page || 1)
  const limit = Math.min(100, Math.max(1, params.limit || 20))
  const skip = (page - 1) * limit

  const where: any = shopId === 'ALL' ? {} : { shopId }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { brand: { contains: params.search } },
      { sku: { contains: params.search } },
      { description: { contains: params.search } },
    ]
  }

  if (params.category && params.category !== 'All') {
    where.category = { name: params.category }
  }

  if (params.stockFilter && params.stockFilter !== 'All') {
    if (params.stockFilter === 'In Stock') where.stock = { gt: 5 }
    else if (params.stockFilter === 'Low Stock') where.stock = { gt: 0, lte: 5 }
    else if (params.stockFilter === 'Out of Stock') where.stock = { equals: 0 }
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        shop: {
          select: {
            id: true,
            name: true,
            type: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ])

  return {
    data: products.map((p) => ({
      id: p.id,
      shopId: p.shopId,
      name: p.name,
      brand: p.brand || '',
      sku: p.sku || '',
      modelCompatibility: p.modelCompatibility || '',
      condition: p.condition || 'New',
      warranty: p.warranty || '',
      pricePaise: p.pricePaise,
      price: (p.pricePaise / 100).toString(),
      priceFormatted: `₹${(p.pricePaise / 100).toLocaleString('en-IN')}`,
      oldPrice: p.compareAtPricePaise ? (p.compareAtPricePaise / 100).toString() : '',
      discount: p.discountPercent || 0,
      stock: p.stock,
      status: p.status,
      category: p.category?.name || 'Uncategorized',
      features: p.features || '',
      tags: p.tags || '',
      description: p.description || '',
      images: p.images.map((i) => i.url),
      shop: p.shop,
      rating: 4.8,
      reviews: 12,
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getSellerProductById(shopId: string, productId: string) {
  const where: any = { id: productId }
  if (shopId !== 'ALL') {
    where.shopId = shopId
  }

  const p = await prisma.product.findFirst({
    where,
    include: {
      images: { orderBy: { position: 'asc' } },
      category: true,
      shop: {
        select: {
          id: true,
          name: true,
          type: true,
          phone: true,
          address: true,
          isVerified: true,
          ownerUser: {
            select: { id: true, role: true, name: true, email: true },
          },
        },
      },
      enquiries: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          message: true,
          status: true,
          createdAt: true,
        },
      },
    },
  })

  if (!p) return null

  const isSuperSellerOrAdmin =
    p.shop?.type === 'SUPER_SELLER' ||
    p.shop?.ownerUser?.role === 'SUPER_SELLER' ||
    p.shop?.ownerUser?.role === 'ADMIN' ||
    p.shop?.ownerUser?.role === 'PLATFORM_ADMIN' ||
    p.shop?.ownerUser?.role === 'SELLER_ADMIN'

  return {
    id: p.id,
    shopId: p.shopId,
    name: p.name,
    brand: p.brand || '',
    sku: p.sku || '',
    modelCompatibility: p.modelCompatibility || '',
    condition: p.condition || 'New',
    warranty: p.warranty || '',
    pricePaise: p.pricePaise,
    price: (p.pricePaise / 100).toString(),
    priceFormatted: `₹${(p.pricePaise / 100).toLocaleString('en-IN')}`,
    oldPrice: p.compareAtPricePaise ? (p.compareAtPricePaise / 100).toString() : '',
    compareAtPricePaise: p.compareAtPricePaise,
    discountPercent: p.discountPercent || 0,
    stock: p.stock,
    status: p.status,
    categoryId: p.categoryId,
    category: p.category?.name || 'Uncategorized',
    features: p.features || '',
    tags: p.tags || '',
    description: p.description || '',
    images: p.images.map((i) => i.url),
    rawImages: p.images,
    shop: p.shop,
    enquiries: p.enquiries,
    isSuperSellerOrAdmin: Boolean(isSuperSellerOrAdmin),
    canReceiveEnquiries: Boolean(isSuperSellerOrAdmin),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export async function createSellerProduct(shopId: string, data: any) {
  let categoryId = data.categoryId

  if (data.category && !categoryId) {
    const slug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const cat = await prisma.category.upsert({
      where: { slug },
      create: { name: data.category, slug, type: 'ACCESSORY' },
      update: {},
    })
    categoryId = cat.id
  }

  const product = await prisma.product.create({
    data: {
      shopId,
      categoryId,
      name: data.name,
      brand: data.brand || null,
      sku: data.sku || null,
      modelCompatibility: data.modelCompatibility || null,
      condition: data.condition || 'New',
      warranty: data.warranty || null,
      pricePaise: data.pricePaise,
      compareAtPricePaise: data.compareAtPricePaise || null,
      discountPercent: data.discountPercent || 0,
      stock: data.stock || 0,
      status: data.status || 'ACTIVE',
      features: data.features || null,
      tags: data.tags || null,
      description: data.description || null,
      images: {
        create: (data.images || []).map((img: string | { url: string }, index: number) => ({
          url: typeof img === 'string' ? img : img.url,
          position: index,
        })),
      },
    },
    include: {
      images: true,
      category: true,
    },
  })

  return product
}

export async function updateSellerProduct(shopId: string, productId: string, data: any) {
  const existing = await prisma.product.findFirst({
    where: {
      id: productId,
      ...(shopId === 'ALL' ? {} : { shopId }),
    },
  })

  if (!existing) {
    throw new Error('PRODUCT_NOT_FOUND_OR_UNAUTHORIZED')
  }

  let categoryId = data.categoryId
  if (data.category && !categoryId) {
    const slug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const cat = await prisma.category.upsert({
      where: { slug },
      create: { name: data.category, slug, type: 'ACCESSORY' },
      update: {},
    })
    categoryId = cat.id
  }

  if (data.images) {
    await prisma.productImage.deleteMany({ where: { productId } })
    await prisma.productImage.createMany({
      data: data.images.map((img: string | { url: string }, index: number) => ({
        productId,
        url: typeof img === 'string' ? img : img.url,
        position: index,
      })),
    })
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name ?? undefined,
      brand: data.brand ?? undefined,
      sku: data.sku ?? undefined,
      modelCompatibility: data.modelCompatibility ?? undefined,
      condition: data.condition ?? undefined,
      warranty: data.warranty ?? undefined,
      pricePaise: data.pricePaise ?? undefined,
      compareAtPricePaise: data.compareAtPricePaise ?? undefined,
      discountPercent: data.discountPercent ?? undefined,
      stock: data.stock ?? undefined,
      status: data.status ?? undefined,
      categoryId: categoryId ?? undefined,
      features: data.features ?? undefined,
      tags: data.tags ?? undefined,
      description: data.description ?? undefined,
    },
    include: {
      images: true,
      category: true,
    },
  })

  return updated
}

export async function deleteSellerProduct(shopId: string, productId: string) {
  const existing = await prisma.product.findFirst({
    where: {
      id: productId,
      ...(shopId === 'ALL' ? {} : { shopId }),
    },
  })

  if (!existing) {
    throw new Error('PRODUCT_NOT_FOUND_OR_UNAUTHORIZED')
  }

  await prisma.productImage.deleteMany({ where: { productId } })
  await prisma.product.delete({ where: { id: productId } })
  return true
}
