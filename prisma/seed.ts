import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { testimonialsData, ordersSampleData } from './seedData'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing records...')
  await prisma.repairPayment.deleteMany()
  await prisma.repairUpdate.deleteMany()
  await prisma.repairJob.deleteMany()
  await prisma.repairCustomer.deleteMany()
  await prisma.enquiry.deleteMany()
  await prisma.order.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.shop.deleteMany()
  await prisma.user.deleteMany()
  await prisma.landingPageSection.deleteMany()
  await prisma.testimonial.deleteMany()

  console.log('Seeding users...')
  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Platform Admin
  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@hyperlocal.com',
      phone: '+91 99999 00001',
      passwordHash,
      role: 'PLATFORM_ADMIN',
      status: 'ACTIVE',
    },
  })

  // 2. Seller Pooja (Pooja Mobile)
  const poojaUser = await prisma.user.create({
    data: {
      name: 'Pooja Mourya',
      email: 'pooja@mobile.com',
      phone: '+91 98765 43210',
      passwordHash,
      role: 'SUPER_SELLER',
      status: 'ACTIVE',
    },
  })

  // 3. Super Seller Raj (Rapid Repairs)
  const rajUser = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'raj@rapids.com',
      phone: '+91 91122 33445',
      passwordHash,
      role: 'SUPER_SELLER',
      status: 'ACTIVE',
    },
  })

  // 4. Seller Admin
  const sellerAdminUser = await prisma.user.create({
    data: {
      name: 'Anil Store Manager',
      email: 'anil@mobile.com',
      phone: '+91 98765 00000',
      passwordHash,
      role: 'SELLER_ADMIN',
      status: 'ACTIVE',
    },
  })

  // 5. Customer User
  const customerUser = await prisma.user.create({
    data: {
      name: 'Customer Demo',
      email: 'customer@demo.com',
      phone: '+91 98888 77777',
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  })

  console.log('Seeding shops...')
  const poojaShop = await prisma.shop.create({
    data: {
      ownerUserId: poojaUser.id,
      name: 'Pooja Mobile Care & Accessories',
      type: 'SUPER_SELLER',
      phone: '+91 98765 43210',
      address: '142, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
      latitude: 12.9719,
      longitude: 77.6412,
      isVerified: true,
      isActive: true,
      description: 'Authorized retailer and fast repair specialist in Indiranagar.',
    },
  })

  const rapidShop = await prisma.shop.create({
    data: {
      ownerUserId: rajUser.id,
      name: 'Rapid Repairs & Spares Hub',
      type: 'SUPER_SELLER',
      phone: '+91 91122 33445',
      address: '88, 5th Block, Koramangala, Bengaluru, Karnataka 560095',
      latitude: 12.9352,
      longitude: 77.6245,
      isVerified: true,
      isActive: true,
      description: 'Super Seller Hub: Bulk spares, certified motherboard diagnostics and genuine screens.',
    },
  })

  await prisma.shop.create({
    data: {
      ownerUserId: poojaUser.id,
      name: 'Apex Mobile Tech',
      type: 'REPAIR_SPECIALIST',
      phone: '+91 97766 55443',
      address: 'Shop 12, CMH Road, Indiranagar, Bengaluru, Karnataka 560038',
      latitude: 12.9784,
      longitude: 77.6408,
      isVerified: true,
      isActive: true,
    },
  })

  console.log('Seeding categories...')
  const catScreen = await prisma.category.create({
    data: { name: 'Screen Protectors', slug: 'screen-protectors', type: 'ACCESSORY' },
  })
  const catChargers = await prisma.category.create({
    data: { name: 'Chargers & Cables', slug: 'chargers-cables', type: 'ACCESSORY' },
  })
  const catAudio = await prisma.category.create({
    data: { name: 'Audio & Earphones', slug: 'audio-earphones', type: 'ACCESSORY' },
  })
  const catCases = await prisma.category.create({
    data: { name: 'Cases & Covers', slug: 'cases-covers', type: 'ACCESSORY' },
  })

  console.log('Seeding products...')
  const p1 = await prisma.product.create({
    data: {
      shopId: poojaShop.id,
      categoryId: catScreen.id,
      name: '9H Tempered Glass Screen Guard',
      brand: 'EdgeShield',
      sku: 'ES-TG-IP15',
      modelCompatibility: 'iPhone 15 / 15 Pro',
      condition: 'New',
      warranty: '6 Months',
      pricePaise: 19900,
      compareAtPricePaise: 39900,
      discountPercent: 50,
      stock: 45,
      status: 'ACTIVE',
      features: '9H surface hardness\nAnti-fingerprint oleophobic coating\nHD ultra-clear clarity\nEasy bubble-free alignment kit included',
      tags: 'tempered-glass, screen-guard, iphone-15',
      description: 'Premium ultra-thin 9H tempered glass designed with full edge-to-edge protection.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop', position: 0, altText: 'Tempered Glass' },
        ],
      },
    },
  })

  const p2 = await prisma.product.create({
    data: {
      shopId: poojaShop.id,
      categoryId: catChargers.id,
      name: 'USB-C Fast Charging Cable (1m)',
      brand: 'PowerPulse',
      sku: 'PP-USBC-1M',
      modelCompatibility: 'Universal USB-C Devices',
      condition: 'New',
      warranty: '1 Year',
      pricePaise: 29900,
      compareAtPricePaise: 59900,
      discountPercent: 50,
      stock: 12,
      status: 'ACTIVE',
      features: '60W Power Delivery support\nBraided nylon tangle-free wire\nReinforced aluminum connectors\n480Mbps high-speed data transfer',
      tags: 'usb-c, fast-charging, braided-cable',
      description: 'Durable braided USB-C cable certified for rapid phone and tablet charging.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=800&auto=format&fit=crop', position: 0, altText: 'USB-C Cable' },
        ],
      },
    },
  })

  await prisma.product.create({
    data: {
      shopId: poojaShop.id,
      categoryId: catAudio.id,
      name: 'Wireless ANC Earbuds',
      brand: 'SonicWave',
      sku: 'SW-ANC-202',
      modelCompatibility: 'Bluetooth 5.3 iOS & Android',
      condition: 'New',
      warranty: '1 Year',
      pricePaise: 129900,
      compareAtPricePaise: 249900,
      discountPercent: 48,
      stock: 4,
      status: 'ACTIVE',
      features: 'Active Noise Cancellation\n32 hours total playback\nIPX5 water resistance\nDual environmental mic for crisp calls',
      tags: 'earbuds, bluetooth, anc, audio',
      description: 'Studio-quality wireless earbuds featuring active noise cancellation and ergonomic fit.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=800&auto=format&fit=crop', position: 0, altText: 'Wireless Earbuds' },
        ],
      },
    },
  })

  await prisma.product.create({
    data: {
      shopId: poojaShop.id,
      categoryId: catCases.id,
      name: 'Shockproof Matte Frosted Case',
      brand: 'ArmorShield',
      sku: 'AS-CASE-S24',
      modelCompatibility: 'Samsung Galaxy S24 Ultra',
      condition: 'New',
      warranty: '6 Months',
      pricePaise: 44900,
      compareAtPricePaise: 89900,
      discountPercent: 50,
      stock: 28,
      status: 'ACTIVE',
      features: 'Military-grade drop certified\nRaised bezel camera protection\nSoft-touch non-slip grip\nWireless charging compatible',
      tags: 'case, cover, shockproof, samsung',
      description: 'Sleek frosted protective case with air-cushioned shock absorbing corners.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop', position: 0, altText: 'Phone Case' },
        ],
      },
    },
  })

  await prisma.product.create({
    data: {
      shopId: rapidShop.id,
      categoryId: catChargers.id,
      name: '65W GaN Dual Port Charger',
      brand: 'VoltFast',
      sku: 'VF-GAN-65',
      modelCompatibility: 'Laptops, Tablets, Phones',
      condition: 'New',
      warranty: '2 Years',
      pricePaise: 189900,
      compareAtPricePaise: 299900,
      discountPercent: 37,
      stock: 19,
      status: 'ACTIVE',
      description: 'Ultra-compact GaN fast wall charger supporting dual simultaneous charging.',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop', position: 0, altText: 'GaN Charger' },
        ],
      },
    },
  })

  console.log('Seeding offers...')
  await prisma.offer.createMany({
    data: [
      {
        shopId: poojaShop.id,
        title: '10% OFF',
        text: 'Screen Protectors',
        description: 'Get 10% instant discount on premium tempered glass.',
        discountType: 'PERCENT',
        discountValue: 10,
        code: 'GLASS10',
        themeColor: 'indigo',
        status: 'ACTIVE',
      },
      {
        shopId: poojaShop.id,
        title: 'BUY 1 GET 1',
        text: 'USB-C Cables',
        description: 'Buy one fast charging cable and get a second free.',
        discountType: 'BOGO',
        discountValue: 50,
        code: 'CABLEBOGO',
        themeColor: 'violet',
        status: 'ACTIVE',
      },
      {
        shopId: poojaShop.id,
        title: 'FREE CHECKUP',
        text: 'Battery Health',
        description: 'Get a free battery diagnostics scan with any purchase.',
        discountType: 'FLAT',
        discountValue: 100,
        code: 'BATTERYFREE',
        themeColor: 'rose',
        status: 'ACTIVE',
      },
    ],
  })

  console.log('Seeding enquiries...')
  await prisma.enquiry.createMany({
    data: [
      {
        shopId: poojaShop.id,
        customerUserId: customerUser.id,
        customerName: 'Amit Sharma',
        customerPhone: '+91 90011 12233',
        productId: p1.id,
        message: 'Do you have curved-edge protectors for Samsung S24 in stock?',
        status: 'NEW',
      },
      {
        shopId: poojaShop.id,
        customerName: 'Neha Verma',
        customerPhone: '+91 90022 33445',
        productId: p2.id,
        message: 'Can I pick up 2 fast charging cables within 1 hour?',
        status: 'RESPONDED',
        responseNote: 'Yes! Both are packed and ready at our pickup counter.',
      },
      {
        shopId: poojaShop.id,
        customerName: 'Rahul Mehta',
        customerPhone: '+91 98877 66554',
        message: 'Do you repair water-damaged iPhone speaker grills?',
        status: 'NEW',
      },
    ],
  })

  console.log('Seeding orders & revenue series...')
  const now = new Date()
  for (const o of ordersSampleData) {
    const placedDate = new Date(now.getTime() - o.daysAgo * 24 * 60 * 60 * 1000)
    await prisma.order.create({
      data: {
        shopId: poojaShop.id,
        customerUserId: customerUser.id,
        status: 'COMPLETED',
        subtotalPaise: o.amountPaise,
        totalPaise: o.amountPaise,
        placedAt: placedDate,
      },
    })
  }

  console.log('Seeding repair workflow...')
  const repCustomer1 = await prisma.repairCustomer.create({
    data: {
      shopId: poojaShop.id,
      name: 'Suresh Kumar',
      phone: '+91 99887 76655',
      address: 'Indiranagar, Bangalore',
    },
  })

  const repCustomer2 = await prisma.repairCustomer.create({
    data: {
      shopId: poojaShop.id,
      name: 'Priya Sundaram',
      phone: '+91 98112 23344',
      address: 'Koramangala, Bangalore',
    },
  })

  const job1 = await prisma.repairJob.create({
    data: {
      shopId: poojaShop.id,
      customerId: repCustomer1.id,
      customerName: repCustomer1.name,
      customerPhone: repCustomer1.phone,
      brand: 'Apple',
      model: 'iPhone 13',
      problemDescription: 'Battery draining completely within 2 hours of moderate use.',
      status: 'IN_PROGRESS',
      estimatedCostPaise: 250000,
      isSellable: true,
      assignedToUserId: rajUser.id,
    },
  })

  await prisma.repairUpdate.createMany({
    data: [
      {
        repairJobId: job1.id,
        authorUserId: sellerAdminUser.id,
        status: 'SUBMITTED',
        note: 'Problem registered at customer desk.',
        estimatedCostPaise: 250000,
      },
      {
        repairJobId: job1.id,
        authorUserId: rajUser.id,
        status: 'IN_PROGRESS',
        note: 'Original Apple OEM replacement battery ordered & diagnostic run.',
        estimatedCostPaise: 250000,
      },
    ],
  })

  const job2 = await prisma.repairJob.create({
    data: {
      shopId: poojaShop.id,
      customerId: repCustomer2.id,
      customerName: repCustomer2.name,
      customerPhone: repCustomer2.phone,
      brand: 'OnePlus',
      model: 'OnePlus 11',
      problemDescription: 'Outer glass cracked after drop; touch response and display AMOLED fully functional.',
      status: 'SUBMITTED',
      estimatedCostPaise: 450000,
      isSellable: false,
    },
  })

  await prisma.repairUpdate.create({
    data: {
      repairJobId: job2.id,
      authorUserId: sellerAdminUser.id,
      status: 'SUBMITTED',
      note: 'Initial visual inspection completed.',
      estimatedCostPaise: 450000,
    },
  })

  console.log('Seeding landing page sections & testimonials...')
  await prisma.landingPageSection.createMany({
    data: [
      {
        key: 'hero',
        title: 'Mobile repairs and accessories, nearby',
        subtitle: 'Compare trusted local sellers, request fast repairs, and get genuine accessories delivered or ready for instant pickup.',
        ctaLabel: 'Find nearby shops',
        ctaUrl: '#shops',
        sortOrder: 1,
      },
      {
        key: 'top_banner',
        title: '⚡ Same-Day Repairs & Hyperlocal Mobile Storefronts',
        subtitle: 'Explore verified shops within 500m to 5km',
        body: 'Verified local electronics sellers with transparent pricing and warranty.',
        sortOrder: 0,
      },
    ],
  })

  await prisma.testimonial.createMany({
    data: testimonialsData,
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
