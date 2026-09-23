import fs from 'fs'
import path from 'path'
import { prisma, assert, mockReq } from './test-utils'
import { hashPassword, signAccessToken } from '../src/server/auth'
import {
  createSellerProduct,
  getSellerProductById,
  getSellerProducts,
  updateSellerProduct,
} from '../src/server/services/seller.service'
import { getPublicProductById } from '../src/server/services/public.service'

export async function runSuite3() {
  console.log('\n--- SECTION 14-16: PRODUCT CRUD, CATEGORIES & IMAGE UPLOADS ---\n')

  const poojaShop = await prisma.shop.findFirst({ where: { name: { contains: 'Pooja' } } })
  const rajShop = await prisma.shop.findFirst({ where: { name: { contains: 'Rapid' } } })
  assert(!!poojaShop && !!rajShop, 'Pooja and Raj shops exist')

  // 14. Complete Product Module CRUD Full Life-Cycle
  console.log('14. Complete Product Module CRUD Full Life-Cycle:')

  // 14.1 Create Product with Rich Attributes & Image Relations
  const crudProduct = await createSellerProduct(poojaShop!.id, {
    name: 'HyperFast 100W Braided Cable',
    brand: 'VoltPulse',
    sku: 'VP-CAB-100W',
    modelCompatibility: 'MacBook, iPad, USB-C Android',
    condition: 'New',
    warranty: '1 Year Full Replacement',
    pricePaise: 89900,
    compareAtPricePaise: 129900,
    discountPercent: 31,
    stock: 42,
    status: 'ACTIVE',
    category: 'Charging Cables',
    features: '100W Power Delivery\nBraided Nylon\nGold-Plated Connectors',
    tags: 'cable, usbc, fastcharging',
    description: 'Ultra-tough 100W PD braided nylon charging cable.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
    ],
  })
  assert(!!crudProduct.id, 'Product created with generated ID')
  assert(crudProduct.images.length === 2, 'Product images created in database with position ordering')
  assert(crudProduct.condition === 'New', 'Product condition saved correctly')
  assert(crudProduct.warranty === '1 Year Full Replacement', 'Product warranty saved correctly')

  // 14.2 Single Product Read via getSellerProductById & Multi-Tenant Scoping
  const poojaFetched = await getSellerProductById(poojaShop!.id, crudProduct.id)
  assert(poojaFetched?.id === crudProduct.id, 'Owner shop retrieves own product with full relation graph')
  assert(poojaFetched?.priceFormatted === '₹899', 'Single product read formats price in INR')
  assert(poojaFetched?.shop?.name?.includes('Pooja'), 'Single product read includes fulfilling shop details')
  assert(poojaFetched?.images.length === 2, 'Single product read includes all image URLs')

  const unauthorizedFetched = await getSellerProductById(rajShop!.id, crudProduct.id)
  assert(unauthorizedFetched === null, 'Other shop cannot access product via tenant-scoped getSellerProductById')

  const adminFetched = await getSellerProductById('ALL', crudProduct.id)
  assert(adminFetched?.id === crudProduct.id, 'Admin retrieves any shop product using shopId = ALL')

  // 14.3 Public Product Read via Service & API Router
  const publicProduct = await getPublicProductById(crudProduct.id)
  assert(publicProduct?.id === crudProduct.id, 'Public product query retrieves active product')
  assert(publicProduct?.canReceiveEnquiries === true, 'Public product indicates enquiry eligibility')

  const publicApiRes = await mockReq(`public/products/${crudProduct.id}`, 'GET', null)
  assert(publicApiRes.status === 200, 'Public API endpoint GET /public/products/:id returns 200 OK')
  assert(publicApiRes.body?.data?.name === 'HyperFast 100W Braided Cable', 'Public API endpoint returns product payload')

  // 14.4 Product Listing & Filtering
  const searchResults = await getSellerProducts(poojaShop!.id, { search: 'HyperFast' })
  assert(searchResults.data.some((p) => p.id === crudProduct.id), 'getSellerProducts filters products by search keyword')

  const categoryResults = await getSellerProducts(poojaShop!.id, { category: 'Charging Cables' })
  assert(categoryResults.data.some((p) => p.id === crudProduct.id), 'getSellerProducts filters products by category')

  const inStockResults = await getSellerProducts(poojaShop!.id, { stockFilter: 'In Stock' })
  assert(inStockResults.data.some((p) => p.id === crudProduct.id), 'getSellerProducts correctly includes product in In Stock filter')

  // 14.5 Product Update: Price, Stock, and Status Mutability
  const updatedCrudProduct = await updateSellerProduct(poojaShop!.id, crudProduct.id, {
    pricePaise: 99900,
    stock: 0,
    status: 'OUT_OF_STOCK',
  })
  assert(updatedCrudProduct.pricePaise === 99900, 'Product price updated to 99900 paise')
  assert(updatedCrudProduct.stock === 0, 'Product stock updated to 0 units')
  assert(updatedCrudProduct.status === 'OUT_OF_STOCK', 'Product status updated to OUT_OF_STOCK')

  const outOfStockResults = await getSellerProducts(poojaShop!.id, { stockFilter: 'Out of Stock' })
  assert(outOfStockResults.data.some((p) => p.id === crudProduct.id), 'Product with 0 stock now surfaces in Out of Stock filter')

  // 14.6 Admin API Endpoints via Router (GET, PATCH, DELETE)
  const adminUser = await prisma.user.findFirst({ where: { role: 'PLATFORM_ADMIN' } })
  assert(!!adminUser, 'Platform Admin user exists in database')

  const adminToken = signAccessToken({
    userId: adminUser!.id,
    email: adminUser!.email,
    role: adminUser!.role,
  })

  const adminGetRes = await mockReq(
    `admin/products/${crudProduct.id}`,
    'GET',
    null,
    { authorization: `Bearer ${adminToken}` }
  )
  assert(adminGetRes.status === 200, 'GET /admin/products/:id returns 200 OK for Admin')

  const adminPatchRes = await mockReq(
    `admin/products/${crudProduct.id}`,
    'PATCH',
    { pricePaise: 79900, stock: 15, status: 'ACTIVE' },
    { authorization: `Bearer ${adminToken}` }
  )
  assert(adminPatchRes.status === 200, 'PATCH /admin/products/:id successfully updates product')
  assert(adminPatchRes.body?.data?.pricePaise === 79900, 'PATCH /admin/products/:id reflects new price')

  const adminDeleteRes = await mockReq(
    `admin/products/${crudProduct.id}`,
    'DELETE',
    null,
    { authorization: `Bearer ${adminToken}` }
  )
  assert(adminDeleteRes.status === 204, 'DELETE /admin/products/:id returns 204 No Content')

  // 14.7 Verify Cascaded Image & Product Removal
  const deletedDbProduct = await prisma.product.findUnique({ where: { id: crudProduct.id } })
  assert(deletedDbProduct === null, 'Product row removed from database after deletion')

  const orphanImagesCount = await prisma.productImage.count({ where: { productId: crudProduct.id } })
  assert(orphanImagesCount === 0, 'Product images cascaded and deleted cleanly from database')

  const deletedPublicCheck = await getPublicProductById(crudProduct.id)
  assert(deletedPublicCheck === null, 'Deleted product is not returned by public catalog query')

  // 15. Super Seller Category Creation & Role Authorization
  console.log('\n15. Super Seller Category Creation & Product Dropdown Integration:')
  const poojaUserRecord = await prisma.user.findUnique({ where: { email: 'pooja@mobile.com' } })
  assert(!!poojaUserRecord, 'Pooja Super Seller user exists in database')

  const superSellerToken = signAccessToken({
    userId: poojaUserRecord!.id,
    email: poojaUserRecord!.email,
    role: poojaUserRecord!.role,
  })

  const custUser = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } })
  assert(!!custUser, 'Customer user exists in database')
  const custCategoryRes = await mockReq(
    'categories',
    'POST',
    { name: 'Unauthorized Customer Category', type: 'ACCESSORY' },
    { authorization: `Bearer ${signAccessToken({ userId: custUser!.id, email: custUser!.email, role: custUser!.role })}` }
  )
  assert(
    custCategoryRes.status === 403 && custCategoryRes.body?.error?.code === 'FORBIDDEN',
    'Regular customer cannot create categories (rejected with 403 FORBIDDEN)'
  )

  const regSeller = await prisma.user.create({
    data: {
      name: 'Regular Store Owner',
      email: `reg_seller_${Date.now()}@test.com`,
      passwordHash: await hashPassword('seller123'),
      role: 'SELLER',
      status: 'ACTIVE',
    },
  })
  const regularSellerCategoryRes = await mockReq(
    'categories',
    'POST',
    { name: 'Regular Seller Category', type: 'ACCESSORY' },
    { authorization: `Bearer ${signAccessToken({ userId: regSeller.id, email: regSeller.email, role: regSeller.role })}` }
  )
  assert(
    regularSellerCategoryRes.status === 403 && regularSellerCategoryRes.body?.error?.code === 'FORBIDDEN',
    'Regular seller cannot create categories (rejected with 403 FORBIDDEN)'
  )

  const ssCategoryRes = await mockReq(
    'categories',
    'POST',
    { name: 'Magnetic Wireless Chargers', type: 'ACCESSORY' },
    { authorization: `Bearer ${superSellerToken}` }
  )
  assert(ssCategoryRes.status === 201, 'Super Seller can create product category via POST /api/v1/categories')
  assert(ssCategoryRes.body?.data?.name === 'Magnetic Wireless Chargers', 'Created category has correct name')
  assert(ssCategoryRes.body?.data?.slug === 'magnetic-wireless-chargers', 'Created category has auto-generated slug')
  assert(ssCategoryRes.body?.data?.type === 'ACCESSORY', 'Created category has type ACCESSORY')

  const rajUser = await prisma.user.findUnique({ where: { email: 'raj@rapids.com' } })
  assert(!!rajUser && rajUser.role === 'SUPER_SELLER', 'Raj Super Seller user exists')
  const rajToken = signAccessToken({ userId: rajUser!.id, email: rajUser!.email, role: rajUser!.role })
  const rajCatRes = await mockReq(
    'categories',
    'POST',
    { name: 'Ultra Battery Packs', type: 'ACCESSORY' },
    { authorization: `Bearer ${rajToken}` }
  )
  assert(rajCatRes.status === 201, 'User with direct SUPER_SELLER role can create categories via POST /api/v1/categories')

  const magsafeProduct = await createSellerProduct(poojaShop!.id, {
    name: 'MagSafe Puck 15W',
    brand: 'HyperFast',
    pricePaise: 149900,
    stock: 20,
    category: 'Magnetic Wireless Chargers',
  })
  assert(magsafeProduct.categoryId === ssCategoryRes.body.data.id, 'Product created using newly created category links to correct categoryId')

  const adminCategoryRes = await mockReq(
    'categories',
    'POST',
    { name: 'OLED Replacement Screens', type: 'REPAIR' },
    { authorization: `Bearer ${adminToken}` }
  )
  assert(adminCategoryRes.status === 201, 'Platform Admin can create category via POST /api/v1/categories')
  assert(adminCategoryRes.body?.data?.type === 'REPAIR', 'Admin created category has type REPAIR')

  const getCategoriesRes = await mockReq('categories', 'GET', null)
  assert(getCategoriesRes.status === 200, 'GET /categories returns 200 OK')
  const foundMagCat = getCategoriesRes.body?.data?.find((c: any) => c.slug === 'magnetic-wireless-chargers')
  assert(!!foundMagCat, 'GET /categories includes newly created category')
  assert(foundMagCat._count?.products >= 1, 'Category product count accurately reflects linked products')

  // Clean up Section 15
  await prisma.product.delete({ where: { id: magsafeProduct.id } })
  await prisma.category.deleteMany({
    where: { slug: { in: ['magnetic-wireless-chargers', 'oled-replacement-screens', 'ultra-battery-packs'] } },
  })
  await prisma.user.delete({ where: { id: regSeller.id } })

  // 16. Original Product Image Upload & Persistence
  console.log('\n16. Original Product Image Upload & Persistence:')
  const sampleBase64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

  const uploadRes = await mockReq(
    'uploads',
    'POST',
    {
      file: sampleBase64,
      filename: 'original_camera_lens.png',
      contentType: 'image/png',
    },
    { authorization: `Bearer ${superSellerToken}` }
  )
  assert(uploadRes.status === 201, 'POST /uploads returns 201 Created')
  assert(typeof uploadRes.body?.data?.url === 'string', 'Upload returns public URL string')
  assert(uploadRes.body.data.url.startsWith('/uploads/products/'), 'Image URL points to /uploads/products directory')

  const absoluteUploadedFilePath = path.join(process.cwd(), 'public', uploadRes.body.data.url)
  assert(fs.existsSync(absoluteUploadedFilePath), 'Original image file exists on disk in public folder')
  const uploadedFileSize = fs.statSync(absoluteUploadedFilePath).size
  assert(uploadedFileSize > 0, 'Original image file is non-empty')

  const originalImageProduct = await createSellerProduct(poojaShop!.id, {
    name: 'Camera Lens Shield HD',
    brand: 'ProShield',
    pricePaise: 49900,
    stock: 25,
    images: [uploadRes.body.data.url],
  })
  assert(originalImageProduct.images.length === 1, 'Product created with 1 uploaded image')

  const fetchedSellerProd = await getSellerProductById(poojaShop!.id, originalImageProduct.id)
  assert(fetchedSellerProd?.images[0] === uploadRes.body.data.url, 'Seller product details contains original uploaded image URL')

  const fetchedPublicProd = await getPublicProductById(originalImageProduct.id)
  assert(fetchedPublicProd?.images[0] === uploadRes.body.data.url, 'Public product details contains original uploaded image URL')

  // Clean up Section 16
  await prisma.product.delete({ where: { id: originalImageProduct.id } })
  if (fs.existsSync(absoluteUploadedFilePath)) {
    fs.unlinkSync(absoluteUploadedFilePath)
  }
}
