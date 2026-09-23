import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Configure MySQL connection pool
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'hyperlocal_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// ============================================================================
// 1. SUPER SELLER AUTHENTICATION & REGISTRATION (MYSQL)
// ============================================================================

export async function registerSuperSellerMySql(data: {
  name: string
  email: string
  password: string
  phone?: string | null
  shopName?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}) {
  const connection = await mysqlPool.getConnection()
  try {
    await connection.beginTransaction()

    // 1. Check if email exists
    const [existing]: any = await connection.execute(
      'SELECT id, email FROM users WHERE email = ? LIMIT 1',
      [data.email]
    )

    if (existing && existing.length > 0) {
      throw new Error('EMAIL_ALREADY_REGISTERED')
    }

    // 2. Hash password & insert Super Seller User
    const userId = crypto.randomUUID()
    const passwordHash = await bcrypt.hash(data.password, 10)

    await connection.execute(
      `INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'SUPER_SELLER', 'ACTIVE', NOW(), NOW())`,
      [userId, data.name, data.email, data.phone || null, passwordHash]
    )

    // 3. Create Super Seller Storefront Shop
    const shopId = crypto.randomUUID()
    const shopName = data.shopName || `${data.name}'s Super Store`
    const address = data.address || 'Central Bangalore'
    const lat = data.latitude || 12.9716
    const lng = data.longitude || 77.5946

    await connection.execute(
      `INSERT INTO shops (id, owner_user_id, name, type, description, phone, address, latitude, longitude, is_active, is_verified, opening_hours, created_at, updated_at)
       VALUES (?, ?, ?, 'SUPER_SELLER', ?, ?, ?, ?, ?, 1, 1, '9:00 AM - 9:00 PM', NOW(), NOW())`,
      [shopId, userId, shopName, 'Verified Super Seller Storefront', data.phone || null, address, lat, lng]
    )

    await connection.commit()

    return {
      user: { id: userId, name: data.name, email: data.email, role: 'SUPER_SELLER' },
      shop: { id: shopId, name: shopName, type: 'SUPER_SELLER' },
    }
  } catch (err) {
    await connection.rollback()
    throw err
  } finally {
    connection.release()
  }
}

export async function loginSuperSellerMySql(email: string, passwordPlain: string) {
  const [rows]: any = await mysqlPool.execute(
    `SELECT 
       u.id,
       u.name,
       u.email,
       u.phone,
       u.password_hash,
       u.role,
       u.status,
       s.id AS shop_id,
       s.name AS shop_name,
       s.type AS shop_type,
       s.is_verified AS shop_verified
     FROM users u
     LEFT JOIN shops s ON (s.owner_user_id = u.id AND s.is_active = 1)
     WHERE u.email = ? 
       AND (u.role = 'SUPER_SELLER' OR u.role = 'PLATFORM_ADMIN')
       AND u.status != 'SUSPENDED'
     LIMIT 1`,
    [email]
  )

  if (!rows || rows.length === 0) {
    return null
  }

  const userRecord = rows[0]
  const isMatch = await bcrypt.compare(passwordPlain, userRecord.password_hash)
  if (!isMatch) {
    return null
  }

  return {
    user: {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone,
      role: userRecord.role,
      status: userRecord.status,
    },
    shop: userRecord.shop_id
      ? {
          id: userRecord.shop_id,
          name: userRecord.shop_name,
          type: userRecord.shop_type,
          isVerified: Boolean(userRecord.shop_verified),
        }
      : null,
  }
}

// ============================================================================
// 2. SUPER SELLER CREATES SELLER (ADMIN) (MYSQL)
// ============================================================================

export async function createSellerAdminBySuperSellerMySql(
  superSellerUserId: string,
  sellerData: {
    name: string
    email: string
    password: string
    phone?: string | null
    role?: 'SELLER' | 'SELLER_ADMIN'
    shopId?: string | null
  }
) {
  // 1. Verify that the caller is an active Super Seller and retrieve their shop
  const [authRows]: any = await mysqlPool.execute(
    `SELECT u.id, u.role, s.id AS shop_id, s.name AS shop_name
     FROM users u
     JOIN shops s ON s.owner_user_id = u.id
     WHERE u.id = ? 
       AND (u.role = 'SUPER_SELLER' OR u.role = 'PLATFORM_ADMIN')
       AND s.is_active = 1
     LIMIT 1`,
    [superSellerUserId]
  )

  if (!authRows || authRows.length === 0) {
    throw new Error('FORBIDDEN_NOT_SUPER_SELLER')
  }

  const superSellerShopId = sellerData.shopId || authRows[0].shop_id

  // 2. Check if email already registered
  const [existing]: any = await mysqlPool.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [sellerData.email]
  )

  if (existing && existing.length > 0) {
    throw new Error('EMAIL_ALREADY_REGISTERED')
  }

  // 3. Create new Seller / Seller Admin linked to Super Seller's shop
  const newUserId = crypto.randomUUID()
  const passwordHash = await bcrypt.hash(sellerData.password, 10)
  const role = sellerData.role || 'SELLER_ADMIN'

  await mysqlPool.execute(
    `INSERT INTO users (id, name, email, phone, password_hash, role, status, shop_id, created_by_user_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, NOW(), NOW())`,
    [
      newUserId,
      sellerData.name,
      sellerData.email,
      sellerData.phone || null,
      passwordHash,
      role,
      superSellerShopId,
      superSellerUserId,
    ]
  )

  return {
    id: newUserId,
    name: sellerData.name,
    email: sellerData.email,
    phone: sellerData.phone || null,
    role,
    status: 'ACTIVE',
    shopId: superSellerShopId,
    createdByUserId: superSellerUserId,
  }
}

export async function getStaffSellersBySuperSellerMySql(superSellerUserId: string, shopId?: string | null) {
  const [rows]: any = await mysqlPool.execute(
    `SELECT 
       u.id,
       u.name,
       u.email,
       u.phone,
       u.role,
       u.status,
       u.shop_id,
       s.name AS shop_name,
       u.created_at
     FROM users u
     LEFT JOIN shops s ON u.shop_id = s.id
     WHERE (u.created_by_user_id = ? OR u.shop_id = ?)
       AND u.role IN ('SELLER', 'SELLER_ADMIN')
     ORDER BY u.created_at DESC`,
    [superSellerUserId, shopId || superSellerUserId]
  )

  return rows
}

// ============================================================================
// 3. NORMAL USER PRODUCT & RUNNING OFFER ENQUIRIES (MYSQL)
// ============================================================================

export async function getRunningOffersMySql() {
  const [rows]: any = await mysqlPool.execute(
    `SELECT 
       o.id AS offer_id,
       o.title,
       o.text,
       o.description,
       o.discount_type,
       o.discount_value,
       o.code,
       o.theme_color,
       o.starts_at,
       o.ends_at,
       s.id AS shop_id,
       s.name AS shop_name,
       s.phone AS shop_phone,
       s.address AS shop_address,
       s.type AS shop_type,
       s.rating AS shop_rating,
       u.role AS shop_owner_role
     FROM offers o
     JOIN shops s ON o.shop_id = s.id
     JOIN users u ON s.owner_user_id = u.id
     WHERE o.status = 'ACTIVE'
       AND (o.ends_at IS NULL OR o.ends_at > NOW())
       AND (s.type = 'SUPER_SELLER' OR u.role IN ('SUPER_SELLER', 'PLATFORM_ADMIN', 'SELLER_ADMIN'))
     ORDER BY o.created_at DESC`
  )

  return rows
}

export async function createProductEnquiryMySql(data: {
  shopId?: string | null
  productId: string
  customerUserId?: string | null
  customerName: string
  customerPhone: string
  message: string
}) {
  // 1. Verify product belongs to Super Seller or Admin
  const [prodRows]: any = await mysqlPool.execute(
    `SELECT 
       p.id AS product_id,
       p.name AS product_name,
       s.id AS shop_id,
       s.type AS shop_type,
       u.role AS uploader_role
     FROM products p
     JOIN shops s ON p.shop_id = s.id
     JOIN users u ON s.owner_user_id = u.id
     WHERE p.id = ? 
       AND p.status = 'ACTIVE'
       AND (s.type = 'SUPER_SELLER' OR u.role IN ('SUPER_SELLER', 'PLATFORM_ADMIN', 'SELLER_ADMIN'))
     LIMIT 1`,
    [data.productId]
  )

  if (!prodRows || prodRows.length === 0) {
    throw new Error('PRODUCT_NOT_FOUND_OR_NOT_SUPER_SELLER')
  }

  const shopId = prodRows[0].shop_id
  const enquiryId = crypto.randomUUID()

  await mysqlPool.execute(
    `INSERT INTO enquiries (id, shop_id, product_id, offer_id, customer_user_id, customer_name, customer_phone, message, status, created_at, updated_at)
     VALUES (?, ?, ?, NULL, ?, ?, ?, ?, 'NEW', NOW(), NOW())`,
    [
      enquiryId,
      shopId,
      data.productId,
      data.customerUserId || null,
      data.customerName,
      data.customerPhone,
      data.message,
    ]
  )

  return {
    id: enquiryId,
    shopId,
    productId: data.productId,
    offerId: null,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    message: data.message,
    status: 'NEW',
    type: 'PRODUCT',
  }
}

export async function createOfferEnquiryMySql(data: {
  offerId: string
  customerUserId?: string | null
  customerName: string
  customerPhone: string
  message: string
}) {
  // 1. Verify offer is currently ACTIVE and belongs to a Super Seller or Admin
  const [offerRows]: any = await mysqlPool.execute(
    `SELECT 
       o.id AS offer_id,
       o.title AS offer_title,
       o.code AS offer_code,
       o.status AS offer_status,
       s.id AS shop_id,
       s.type AS shop_type,
       u.role AS uploader_role
     FROM offers o
     JOIN shops s ON o.shop_id = s.id
     JOIN users u ON s.owner_user_id = u.id
     WHERE o.id = ? 
       AND o.status = 'ACTIVE'
       AND (o.ends_at IS NULL OR o.ends_at > NOW())
       AND (s.type = 'SUPER_SELLER' OR u.role IN ('SUPER_SELLER', 'PLATFORM_ADMIN', 'SELLER_ADMIN'))
     LIMIT 1`,
    [data.offerId]
  )

  if (!offerRows || offerRows.length === 0) {
    throw new Error('OFFER_NOT_FOUND_OR_EXPIRED')
  }

  const shopId = offerRows[0].shop_id
  const enquiryId = crypto.randomUUID()

  await mysqlPool.execute(
    `INSERT INTO enquiries (id, shop_id, product_id, offer_id, customer_user_id, customer_name, customer_phone, message, status, created_at, updated_at)
     VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 'NEW', NOW(), NOW())`,
    [
      enquiryId,
      shopId,
      data.offerId,
      data.customerUserId || null,
      data.customerName,
      data.customerPhone,
      data.message,
    ]
  )

  return {
    id: enquiryId,
    shopId,
    productId: null,
    offerId: data.offerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    message: data.message,
    status: 'NEW',
    type: 'OFFER',
  }
}

// ============================================================================
// 4. SELLER ENQUIRIES FETCH & UPDATE (MYSQL)
// ============================================================================

export async function getShopEnquiriesMySql(shopId: string) {
  const [rows]: any = await mysqlPool.execute(
    `SELECT 
       e.id,
       e.customer_name,
       e.customer_phone,
       e.message,
       e.status,
       e.response_note,
       e.responded_at,
       e.created_at,
       p.id AS product_id,
       p.name AS product_name,
       p.price_paise AS product_price_paise,
       o.id AS offer_id,
       o.title AS offer_title,
       o.code AS offer_code,
       o.discount_type,
       o.discount_value,
       CASE 
         WHEN e.offer_id IS NOT NULL THEN 'OFFER'
         WHEN e.product_id IS NOT NULL THEN 'PRODUCT'
         ELSE 'GENERAL'
       END AS enquiry_type
     FROM enquiries e
     LEFT JOIN products p ON e.product_id = p.id
     LEFT JOIN offers o ON e.offer_id = o.id
     WHERE e.shop_id = ?
     ORDER BY e.created_at DESC`,
    [shopId]
  )

  return rows.map((r: any) => ({
    id: r.id,
    name: r.customer_name || 'Anonymous',
    phone: r.customer_phone || '—',
    interest: r.offer_title ? `Offer: ${r.offer_title}${r.offer_code ? ` (${r.offer_code})` : ''}` : (r.product_name || 'General Inquiry'),
    type: r.enquiry_type,
    message: r.message,
    status: r.status,
    responseNote: r.response_note,
    respondedAt: r.responded_at,
    product: r.product_id ? { id: r.product_id, name: r.product_name, pricePaise: r.product_price_paise } : null,
    offer: r.offer_id ? { id: r.offer_id, title: r.offer_title, code: r.offer_code, discountType: r.discount_type, discountValue: r.discount_value } : null,
    date: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : '',
  }))
}

export async function updateEnquiryStatusMySql(
  shopId: string,
  enquiryId: string,
  status: 'NEW' | 'RESPONDED' | 'CLOSED',
  responseNote?: string | null
) {
  await mysqlPool.execute(
    `UPDATE enquiries 
     SET status = ?, response_note = ?, responded_at = NOW(), updated_at = NOW()
     WHERE id = ? AND shop_id = ?`,
    [status, responseNote || null, enquiryId, shopId]
  )

  return { id: enquiryId, status, responseNote }
}
