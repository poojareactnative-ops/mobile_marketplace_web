import { prisma, assert, mockReq } from './test-utils'
import { hashPassword } from '../src/server/auth'
import { getFeaturedProducts } from '../src/server/services/landing.service'
import {
  createSellerProduct,
  deleteSellerProduct,
  updateSellerProduct,
} from '../src/server/services/seller.service'

export async function runSuite2() {
  console.log('\n--- SECTION 11-13: TRENDING PRODUCTS, AUTH GUARD & ENQUIRIES ---\n')

  const poojaShop = await prisma.shop.findFirst({ where: { name: { contains: 'Pooja' } } })
  assert(!!poojaShop, 'Pooja Mobile shop exists')

  // 11. Dynamic Trending Products Flow (Admin & Super-Seller)
  console.log('11. Dynamic Trending Products Flow (Admin & Super-Seller):')
  const trendingProd = await createSellerProduct(poojaShop!.id, {
    name: 'Dynamic Ultra Shield 9H Glass',
    brand: 'ShieldX',
    pricePaise: 49900,
    compareAtPricePaise: 79900,
    discountPercent: 37,
    stock: 25,
    status: 'ACTIVE',
    category: 'Screen Protectors',
    description: 'High durability tempered glass',
  })
  assert(!!trendingProd.id, 'Product created dynamically by Admin / Super-Seller')

  let featuredList = await getFeaturedProducts(10)
  assert(featuredList.length > 0, 'Featured products returned from database')
  assert(
    featuredList[0].id === trendingProd.id,
    'Newly uploaded product immediately appears at top (index 0) of Trending Accessories'
  )
  assert(
    featuredList[0].priceFormatted === '₹499',
    'Trending product displays formatted INR price'
  )
  assert(
    featuredList[0].discountPercent === 37,
    'Trending product displays dynamic discount percentage'
  )

  await updateSellerProduct('ALL', trendingProd.id, {
    name: 'Dynamic Ultra Shield 9H Glass PRO Max',
    pricePaise: 59900,
  })
  featuredList = await getFeaturedProducts(10)
  assert(
    featuredList[0].name === 'Dynamic Ultra Shield 9H Glass PRO Max',
    'Product name update is immediately reflected in Trending Accessories'
  )
  assert(
    featuredList[0].price === 599,
    'Product price update is immediately reflected in Trending Accessories'
  )

  const categoryFilterList = await getFeaturedProducts(10, trendingProd.categoryId)
  assert(
    categoryFilterList.some((p) => p.id === trendingProd.id),
    'Featured products dynamically filter by selected category'
  )

  const searchFilterList = await getFeaturedProducts(10, undefined, 'Ultra Shield')
  assert(
    searchFilterList.some((p) => p.id === trendingProd.id),
    'Featured products dynamically filter by live search query'
  )

  const sortedByPriceAsc = await getFeaturedProducts(10, undefined, undefined, 'price_asc')
  assert(
    sortedByPriceAsc[0].pricePaise <= sortedByPriceAsc[sortedByPriceAsc.length - 1].pricePaise,
    'Featured products dynamically sort by price ascending'
  )

  await deleteSellerProduct('ALL', trendingProd.id)
  featuredList = await getFeaturedProducts(10)
  assert(
    !featuredList.some((p) => p.id === trendingProd.id),
    'Deleted product is immediately removed from Trending Accessories'
  )

  // 12. Only Registered User Can Login Security Assertion
  console.log('\n12. Registered User Authentication Guard:')

  const unregRes = await mockReq('auth/login', 'POST', {
    email: 'unregistered_random_user_999@example.com',
    password: 'Password123!',
  })
  assert(
    unregRes.status === 401 && unregRes.body?.error?.code === 'NOT_REGISTERED',
    'Unregistered user login is rejected with NOT_REGISTERED error'
  )

  const wrongPassRes = await mockReq('auth/login', 'POST', {
    email: 'pooja@mobile.com',
    password: 'wrong_password_xyz',
  })
  assert(
    wrongPassRes.status === 401 && wrongPassRes.body?.error?.code === 'INVALID_CREDENTIALS',
    'Registered user with wrong password is rejected with INVALID_CREDENTIALS error'
  )

  const newEmail = `reguser_${Date.now()}@example.com`
  const registerRes = await mockReq('auth/register', 'POST', {
    name: 'Rohan Sharma',
    email: newEmail,
    password: 'SecurePassword123',
    phone: '9876543210',
    shopName: 'Rohan Mobile World',
    role: 'SUPER_SELLER',
  })
  assert(registerRes.status === 201 && !!registerRes.body?.data?.tokens?.accessToken, 'New seller registers successfully')

  const loginSuccessRes = await mockReq('auth/login', 'POST', {
    email: newEmail,
    password: 'SecurePassword123',
  })
  assert(
    loginSuccessRes.status === 200 &&
    loginSuccessRes.body?.data?.user?.email === newEmail &&
    !!loginSuccessRes.body?.data?.tokens?.accessToken,
    'Newly registered user logs in successfully with matching credentials'
  )

  // 13. Admin, Super Seller & Restricted Enquiry Tests
  console.log('\n13. Admin & Super Seller Auth and Enquiry Restrictions:')
  
  const adminLoginRes = await mockReq('auth/login', 'POST', {
    email: 'admin@hyperlocal.com',
    password: 'password123',
  })
  assert(
    adminLoginRes.status === 200 && adminLoginRes.body?.data?.user?.role === 'PLATFORM_ADMIN',
    'Platform Administrator logs in and receives PLATFORM_ADMIN role'
  )

  const superSellerLoginRes = await mockReq('auth/login', 'POST', {
    email: 'raj@rapids.com',
    password: 'password123',
  })
  assert(
    superSellerLoginRes.status === 200 && superSellerLoginRes.body?.data?.user?.role === 'SUPER_SELLER',
    'Super Seller logs in and receives SUPER_SELLER role'
  )

  const customerLoginRes = await mockReq('auth/login', 'POST', {
    email: 'customer@demo.com',
    password: 'password123',
  })
  assert(
    customerLoginRes.status === 200 && customerLoginRes.body?.data?.user?.role === 'CUSTOMER',
    'Normal Customer logs in and receives CUSTOMER role'
  )

  const regularSellerUser = await prisma.user.create({
    data: {
      name: 'Regular Store Owner',
      email: `regular_${Date.now()}@test.com`,
      passwordHash: await hashPassword('testpass123'),
      role: 'SELLER',
      status: 'ACTIVE',
    },
  })
  const regularShop = await prisma.shop.create({
    data: {
      ownerUserId: regularSellerUser.id,
      name: 'Standard Accessory Stand',
      type: 'ACCESSORY_SELLER',
      latitude: 12.9716,
      longitude: 77.5946,
      isActive: true,
    },
  })
  const regularProduct = await prisma.product.create({
    data: {
      shopId: regularShop.id,
      name: 'Generic Phone Grip',
      pricePaise: 9900,
      status: 'ACTIVE',
    },
  })

  const rejectedEnquiryRes = await mockReq('enquiries', 'POST', {
    productId: regularProduct.id,
    customerName: 'Amit Sharma',
    customerPhone: '9876543210',
    message: 'Is this available?',
  })
  assert(
    rejectedEnquiryRes.status === 403 && rejectedEnquiryRes.body?.error?.code === 'UNAUTHORIZED_ENQUIRY',
    'Enquiries for non-Super Seller / non-Admin products are strictly rejected with 403 UNAUTHORIZED_ENQUIRY'
  )

  const superSellerProduct = await prisma.product.findFirst({
    where: { shopId: poojaShop!.id, status: 'ACTIVE' },
  })
  assert(!!superSellerProduct, 'Super Seller active product exists')

  const acceptedEnquiryRes = await mockReq('enquiries', 'POST', {
    productId: superSellerProduct!.id,
    customerName: 'Amit Sharma',
    customerPhone: '9876543210',
    message: 'Hi, I would like to buy this from your Super Seller store today.',
  })
  assert(
    acceptedEnquiryRes.status === 201 && !!acceptedEnquiryRes.body?.data?.id,
    'Normal user can send product enquiry for items uploaded by Super Seller / Admin'
  )

  // Clean up section 12 & 13 test records
  if (acceptedEnquiryRes.body?.data?.id) {
    await prisma.enquiry.delete({ where: { id: acceptedEnquiryRes.body.data.id } })
  }
  await prisma.product.delete({ where: { id: regularProduct.id } })
  await prisma.shop.delete({ where: { id: regularShop.id } })
  await prisma.user.delete({ where: { id: regularSellerUser.id } })

  const registeredUser = await prisma.user.findUnique({ where: { email: newEmail } })
  if (registeredUser) {
    await prisma.shop.deleteMany({ where: { ownerUserId: registeredUser.id } })
    await prisma.user.delete({ where: { id: registeredUser.id } })
  }
}
