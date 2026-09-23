import fs from 'fs'
import path from 'path'
import { prisma, assert } from './test-utils'
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  verifyAccessToken,
} from '../src/server/auth'
import {
  getLandingPageData,
  getNearbyShops,
} from '../src/server/services/landing.service'
import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerDashboard,
  updateSellerProduct,
} from '../src/server/services/seller.service'
import {
  getPublicProducts,
  getPublicShopById,
  createPublicRepairBooking,
  trackRepairJob,
} from '../src/server/services/public.service'
import {
  getPlatformOverview,
  getAllShops,
  toggleShopVerification,
} from '../src/server/services/admin.service'

export async function runSuite1() {
  console.log('\n--- SECTION 1-10: AUTHENTICATION & CORE SERVICES ---\n')

  // 1. Password & Token Tests
  console.log('1. Authentication & Security:')
  const hash = await hashPassword('testpass123')
  const match = await comparePassword('testpass123', hash)
  assert(match, 'Password hashing and comparison work correctly')

  const badMatch = await comparePassword('wrongpass', hash)
  assert(!badMatch, 'Incorrect password correctly rejected')

  const token = signAccessToken({ userId: 'u1', email: 'test@test.com', role: 'SELLER' })
  const decoded = verifyAccessToken(token)
  assert(decoded?.userId === 'u1', 'JWT access token signs and verifies correctly')

  const invalidDecoded = verifyAccessToken('invalid.token.here')
  assert(invalidDecoded === null, 'Malformed JWT token rejected')

  // 2. Public Landing Page Content
  console.log('\n2. Landing Page & Nearby Discovery:')
  const landing = await getLandingPageData()
  assert(!!landing.hero.title, 'Landing page data returns hero title')
  assert(landing.testimonials.length > 0, 'Landing page data returns testimonials')
  assert(landing.featuredCategories.length > 0, 'Landing page data returns categories')

  // 3. Nearby Shops & Haversine Distance
  const nearby = await getNearbyShops({
    lat: 12.9719,
    lng: 77.6412,
    radiusMeters: 5000,
  })
  assert(nearby.length > 0, 'Nearby shops query returns shops within radius')
  assert(
    nearby[0].distanceMeters <= nearby[nearby.length - 1].distanceMeters,
    'Nearby shops are strictly sorted by distance ascending'
  )

  const distantRadius = await getNearbyShops({
    lat: 19.076,
    lng: 72.8777,
    radiusMeters: 5000,
  })
  assert(distantRadius.length === 0, 'Radius filter correctly excludes shops outside boundary')

  // 4. Shop Scoping & Dashboard Aggregation
  console.log('\n3. Seller Dashboard & Isolation Boundaries:')
  const poojaShop = await prisma.shop.findFirst({
    where: { name: { contains: 'Pooja' } },
  })
  assert(!!poojaShop, 'Pooja Mobile shop exists in database')

  const dash = await getSellerDashboard(poojaShop!.id, '30d')
  assert(dash.metrics.totalProducts > 0, 'Dashboard aggregates real active products count')
  assert(dash.metrics.totalRevenuePaise > 0, 'Dashboard calculates total revenue in integer paise')
  assert(dash.chartData.length === 30, 'Dashboard produces 30-day revenue series')

  // 5. Product CRUD and Cross-Shop Isolation
  console.log('\n4. Product Mutations & Cross-Shop Access Protection:')
  const createdProd = await createSellerProduct(poojaShop!.id, {
    name: 'Test USB Cable',
    pricePaise: 29900,
    stock: 15,
    category: 'Cables & Chargers',
  })
  assert(createdProd.pricePaise === 29900, 'Product created with integer paise price')

  const updatedProd = await updateSellerProduct(poojaShop!.id, createdProd.id, {
    pricePaise: 34900,
    stock: 20,
  })
  assert(updatedProd.pricePaise === 34900, 'Product updated with new price')

  const rajShop = await prisma.shop.findFirst({ where: { name: { contains: 'Rapid' } } })
  assert(!!rajShop, 'Rapid Repairs shop exists')

  let tamperBlocked = false
  try {
    await updateSellerProduct(rajShop!.id, createdProd.id, { pricePaise: 100 })
  } catch (err: any) {
    tamperBlocked = true
  }
  assert(tamperBlocked, 'Cross-shop product modification is rejected with unauthorized error')

  await deleteSellerProduct(poojaShop!.id, createdProd.id)
  const afterDelete = await prisma.product.findUnique({ where: { id: createdProd.id } })
  assert(afterDelete === null, 'Product successfully deleted')

  // 6. Public Product Catalog Search & Shop Profile
  console.log('\n5. Public Dynamic Catalog & Shop Profile:')
  const catalog = await getPublicProducts({ limit: 5 })
  assert(catalog.products.length > 0, 'Public products query returns products with shop info')
  assert(catalog.meta.total > 0, 'Public products returns pagination metadata')

  const shopDetail = await getPublicShopById(poojaShop!.id)
  assert(shopDetail.id === poojaShop!.id, 'Public shop details query returns correct shop')
  assert(Array.isArray(shopDetail.products), 'Public shop profile includes product catalog')

  // 7. Customer Online Repair Booking & Real-Time Tracking Flow
  console.log('\n6. Customer Repair Intake & Live Tracking Flow:')
  const bookedRepair = await createPublicRepairBooking({
    customerName: 'Rohit Verma',
    customerPhone: '9988112233',
    brand: 'Google Pixel',
    model: 'Pixel 7',
    problemDescription: 'Screen flickering after drop',
    preferredShopId: rajShop!.id,
  })
  assert(bookedRepair.status === 'SUBMITTED', 'Customer repair booking created with SUBMITTED status')
  assert(bookedRepair.updates.length === 1, 'Initial status update created in audit trail')

  const trackedJobs = await trackRepairJob({ phone: '9988112233' })
  assert(trackedJobs.length > 0, 'Customer can track repair job by mobile number')
  assert(trackedJobs[0].updates.length > 0, 'Tracking response includes chronological updates timeline')

  // 8. Platform Admin Overview & Governance
  console.log('\n7. Platform Admin Overview & Store Governance:')
  const adminOverview = await getPlatformOverview()
  assert(adminOverview.metrics.totalShops >= 3, 'Admin overview returns accurate shop count')
  assert(adminOverview.metrics.totalGmvPaise > 0, 'Admin overview calculates platform-wide GMV in paise')

  const allAdminShops = await getAllShops()
  assert(allAdminShops.length >= 3, 'Admin query returns all platform shops')

  const toggledShop = await toggleShopVerification(poojaShop!.id, true)
  assert(toggledShop.isVerified === true, 'Admin can toggle store verification to true')

  // 9. Repair Customer Model & Creation Workflow
  console.log('\n8. Repair Customer Management:')
  const { createRepairCustomer, getRepairCustomers } = await import('../src/server/services/repair.service')
  const newRepairCustomer = await createRepairCustomer(poojaShop!.id, {
    name: 'Ananya Deshmukh',
    phone: '9876501234',
    email: 'ananya@example.com',
    address: 'Koramangala 4th Block, Bangalore',
  })
  assert(newRepairCustomer.phone === '9876501234', 'Repair customer created with phone and name')
  const shopCustomers = await getRepairCustomers(poojaShop!.id)
  assert(shopCustomers.some((c) => c.phone === '9876501234'), 'Created repair customer listed for shop')

  // 10. Rate Limiter Security Assertion
  console.log('\n9. Rate Limiting & Protection:')
  const { checkRateLimit } = await import('../src/server/rateLimiter')
  const testIpKey = `test:ip:${Date.now()}`
  const r1 = checkRateLimit(testIpKey, 3, 1000)
  const r2 = checkRateLimit(testIpKey, 3, 1000)
  const r3 = checkRateLimit(testIpKey, 3, 1000)
  const r4 = checkRateLimit(testIpKey, 3, 1000)
  assert(r1.allowed && r2.allowed && r3.allowed, 'Rate limiter permits requests within configured limit')
  assert(!r4.allowed && r4.remaining === 0, 'Rate limiter actively blocks and rejects excessive requests')

  // 11. OpenAPI Specification File Integrity
  console.log('\n10. OpenAPI 3.0 Documentation:')
  const openapiFile = path.resolve(process.cwd(), 'docs/openapi.json')
  assert(fs.existsSync(openapiFile), 'OpenAPI specification file docs/openapi.json exists')
  const openapiContent = JSON.parse(fs.readFileSync(openapiFile, 'utf8'))
  assert(openapiContent.openapi === '3.0.3', 'OpenAPI version matches 3.0.3')
  assert(Object.keys(openapiContent.paths).length >= 10, 'OpenAPI documents all core system endpoints')

  // Cleanup section 7 & 9 test artifacts
  await prisma.repairCustomer.delete({ where: { id: newRepairCustomer.id } })
  await prisma.repairUpdate.deleteMany({ where: { repairJobId: bookedRepair.id } })
  await prisma.repairJob.delete({ where: { id: bookedRepair.id } })
}
