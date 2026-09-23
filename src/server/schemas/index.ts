import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable(),
  role: z
    .enum(['CUSTOMER', 'SELLER', 'SELLER_ADMIN', 'SUPER_SELLER', 'ADMIN', 'PLATFORM_ADMIN'])
    .default('CUSTOMER'),
  shopName: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const nearbyShopsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusMeters: z.coerce.number().min(500).max(20000).default(2500),
  type: z.string().optional(),
})

export const productCreateSchema = z.object({
  shopId: z.string().optional().nullable(),
  name: z.string().min(2, 'Product name is required'),
  brand: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  modelCompatibility: z.string().optional().nullable(),
  condition: z.string().default('New'),
  warranty: z.string().optional().nullable(),
  pricePaise: z.number().int().positive('Price must be a positive integer in paise'),
  compareAtPricePaise: z.number().int().optional().nullable(),
  discountPercent: z.number().int().min(0).max(100).optional().default(0),
  stock: z.number().int().min(0).default(0),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED', 'INACTIVE', 'OUT_OF_STOCK']).default('ACTIVE'),
  categoryId: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  features: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  images: z.array(z.string().or(z.object({ url: z.string() }))).optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

export const offerCreateSchema = z.object({
  title: z.string().min(1, 'Offer title is required'),
  text: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENT', 'FLAT', 'BOGO']).default('PERCENT'),
  discountValue: z.number().int().min(0).default(10),
  code: z.string().optional().nullable(),
  themeColor: z.string().default('indigo'),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'DRAFT']).default('ACTIVE'),
})

export const offerUpdateSchema = offerCreateSchema.partial()

export const enquiryCreateSchema = z.object({
  shopId: z.string().optional(),
  productId: z.string().optional().nullable(),
  offerId: z.string().optional().nullable(),
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number required'),
  message: z.string().min(3, 'Message is required'),
})

export const superSellerCreateSellerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable(),
  role: z.enum(['SELLER', 'SELLER_ADMIN']).default('SELLER_ADMIN'),
  shopId: z.string().optional().nullable(),
})

export const enquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'RESPONDED', 'CLOSED']),
  responseNote: z.string().optional().nullable(),
})

export const repairJobCreateSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(10, 'Customer phone number is required'),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  problemDescription: z.string().min(5, 'Problem description is required'),
  estimatedCostPaise: z.number().int().optional().nullable(),
})

export const repairJobUpdateSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'QUOTED',
    'APPROVED',
    'IN_PROGRESS',
    'READY',
    'COMPLETED',
    'CANCELLED',
    'NOT_REPAIRABLE',
  ]).optional(),
  estimatedCostPaise: z.number().int().optional().nullable(),
  isSellable: z.boolean().optional(),
  assignedToUserId: z.string().optional().nullable(),
  note: z.string().optional(),
})

export const repairUpdateSchema = z.object({
  status: z.string(),
  note: z.string().optional(),
  estimatedCostPaise: z.number().int().optional().nullable(),
})

export const repairPaymentSchema = z.object({
  amountPaise: z.number().int().positive('Payment amount in paise is required'),
  method: z.string().optional().default('CASH'),
})

export const shopUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
})

export const repairCustomerCreateSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  address: z.string().optional().nullable(),
})
