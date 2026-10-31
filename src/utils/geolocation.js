/**
 * Geolocation & Haversine Distance Calculation Utilities
 * Calculates accurate great-circle distance between two GPS coordinates in kilometers.
 */

/**
 * Calculate distance between two lat/lng points using the Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} distance in kilometers (rounded to 2 decimal places)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const numLat1 = Number(lat1);
  const numLon1 = Number(lon1);
  const numLat2 = Number(lat2);
  const numLon2 = Number(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) {
    return null;
  }

  const R = 6371; // Earth's mean radius in km
  const dLat = (numLat2 - numLat1) * (Math.PI / 180);
  const dLon = (numLon2 - numLon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(numLat1 * (Math.PI / 180)) *
      Math.cos(numLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Format distance into human-friendly string (e.g. '450 m away' or '1.4 km away')
 * @param {number} distanceKm 
 * @returns {string}
 */
export function formatDistance(distanceKm) {
  if (distanceKm == null || isNaN(distanceKm)) return 'Distance unknown';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Standard location presets for instant testing & demoing
 */
export const LOCATION_PRESETS = [
  {
    id: 'central',
    name: 'MG Road Central Market',
    city: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
    description: 'City center commercial district with high density of shops',
  },
  {
    id: 'tech_park',
    name: 'Indiranagar 100ft Rd',
    city: 'Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    description: 'Tech corridor with electronics & repair centers',
  },
  {
    id: 'koramangala',
    name: 'Koramangala 5th Block',
    city: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    description: 'Student & startup hub with multiple mobile accessory partners',
  },
  {
    id: 'jayanagar',
    name: 'Jayanagar 4th Block Shopping Complex',
    city: 'Bengaluru',
    lat: 12.9299,
    lng: 77.5824,
    description: 'Traditional retail market with local repair technician shops',
  },
];

/**
 * Generate sample admin & seller shops centered around any base coordinate.
 * Offsets are calibrated so:
 * - 2 shops are within ~0.4 - 0.7 km (inside 1 km)
 * - 3 shops are within ~1.1 - 1.8 km (inside 2 km, outside 1 km)
 * - 2 shops are within ~2.8 - 4.2 km (outside 2 km) to test filtering!
 */
export function generateHyperlocalShops(baseLat = 12.9716, baseLng = 77.5946) {
  // ~1 km in latitude is approximately 0.009 degrees
  // ~1 km in longitude at ~13 deg N is approximately 0.0092 degrees
  const kmToDegLat = 0.009;
  const kmToDegLng = 0.0092;

  return [
    {
      id: 'shop-admin-1',
      name: 'SmartFix Pro Repair Center',
      ownerName: 'Pooja (Admin)',
      role: 'ADMIN',
      phone: '+91 98450 11223',
      address: 'Shop 14, Ground Floor, Central Tech Arcade',
      lat: baseLat + 0.5 * kmToDegLat,
      lng: baseLng + 0.3 * kmToDegLng, // ~0.6 km away
      rating: 4.9,
      reviewsCount: 142,
      isVerified: true,
    },
    {
      id: 'shop-seller-1',
      name: 'Balaji Mobile Accessories',
      ownerName: 'Ramesh Patel (Seller)',
      role: 'SELLER',
      phone: '+91 98451 44556',
      address: 'Shop 3, Opposite Metro Exit Gate',
      lat: baseLat - 0.3 * kmToDegLat,
      lng: baseLng + 0.35 * kmToDegLng, // ~0.5 km away
      rating: 4.8,
      reviewsCount: 98,
      isVerified: true,
    },
    {
      id: 'shop-admin-2',
      name: 'QuickLab Mobile Care & Diagnostics',
      ownerName: 'Vikram Singh (Admin)',
      role: 'ADMIN',
      phone: '+91 98452 77889',
      address: '2nd Cross, Near City Bus Terminal',
      lat: baseLat + 0.9 * kmToDegLat,
      lng: baseLng - 0.7 * kmToDegLng, // ~1.2 km away
      rating: 4.7,
      reviewsCount: 84,
      isVerified: true,
    },
    {
      id: 'shop-seller-2',
      name: 'CaseCraft & Toughened Glass Hub',
      ownerName: 'Amit Verma (Seller)',
      role: 'SELLER',
      phone: '+91 98453 99001',
      address: 'Lane 4, Shopping Plaza, 1st Floor',
      lat: baseLat - 1.1 * kmToDegLat,
      lng: baseLng - 0.7 * kmToDegLng, // ~1.4 km away
      rating: 4.9,
      reviewsCount: 167,
      isVerified: true,
    },
    {
      id: 'shop-admin-3',
      name: 'Apex Smartphone Chipset Solutions',
      ownerName: 'Karthik Rao (Admin)',
      role: 'ADMIN',
      phone: '+91 98454 22334',
      address: 'Ring Road Commercial Complex, Suite 102',
      lat: baseLat + 1.4 * kmToDegLat,
      lng: baseLng + 1.0 * kmToDegLng, // ~1.8 km away
      rating: 4.8,
      reviewsCount: 112,
      isVerified: true,
    },
    {
      id: 'shop-seller-3',
      name: 'Nexa Power & Audio Boutique',
      ownerName: 'Sunita Sharma (Seller)',
      role: 'SELLER',
      phone: '+91 98455 33445',
      address: 'East End Galleria, Shop 22',
      lat: baseLat - 1.3 * kmToDegLat,
      lng: baseLng + 1.2 * kmToDegLng, // ~1.9 km away
      rating: 4.6,
      reviewsCount: 56,
      isVerified: true,
    },
    // FARTHER SHOPS (> 2.5 km away) to demonstrate strict exclusion!
    {
      id: 'shop-far-1',
      name: 'Metro Mega Repair Hub',
      ownerName: 'Dinesh Kumar (Admin)',
      role: 'ADMIN',
      phone: '+91 98456 55667',
      address: 'Outer Ring Highway, Sector 9',
      lat: baseLat + 2.4 * kmToDegLat,
      lng: baseLng + 1.9 * kmToDegLng, // ~3.2 km away
      rating: 4.5,
      reviewsCount: 210,
      isVerified: true,
    },
    {
      id: 'shop-far-2',
      name: 'Urban Gadget Zone',
      ownerName: 'Farhan Ali (Seller)',
      role: 'SELLER',
      phone: '+91 98457 88990',
      address: 'North Extension Boulevard',
      lat: baseLat - 3.2 * kmToDegLat,
      lng: baseLng - 2.5 * kmToDegLng, // ~4.3 km away
      rating: 4.4,
      reviewsCount: 73,
      isVerified: true,
    },
  ];
}

/**
 * Generate products and offers tied to the generated shops
 */
export function generateHyperlocalCatalog(shops) {
  const shopMap = {};
  shops.forEach((s) => {
    shopMap[s.id] = s;
  });

  const offers = [
    {
      id: 'off-1',
      shopId: 'shop-admin-1',
      title: 'Flat 20% Off on AMOLED Screen Replacements',
      description: 'Original OEM display replacement with 6-month touch warranty. 45-minute express service.',
      discount_percent: 20,
      badge: 'Admin Repair Deal',
      category: 'Screen Repair',
      valid_until: 'Limited Time Offer',
      shop: shopMap['shop-admin-1'],
    },
    {
      id: 'off-2',
      shopId: 'shop-seller-1',
      title: 'Buy 1 Get 1 Free on 9H Tempered Glass',
      description: 'Ultra-thin oleophobic tempered glass installation included free with every walk-in.',
      discount_percent: 50,
      badge: 'Seller Accessory Deal',
      category: 'Screen Protectors',
      valid_until: 'This Weekend Only',
      shop: shopMap['shop-seller-1'],
    },
    {
      id: 'off-3',
      shopId: 'shop-admin-2',
      title: '₹300 Flat Discount on Battery Upgrades',
      description: 'High-capacity battery replacements with zero degradation calibration test report.',
      discount_percent: 15,
      badge: 'Admin Repair Deal',
      category: 'Battery Repair',
      valid_until: 'Valid this month',
      shop: shopMap['shop-admin-2'],
    },
    {
      id: 'off-4',
      shopId: 'shop-seller-2',
      title: 'Flat 25% Off on All Shockproof Phone Covers',
      description: 'Military grade drop-tested cases for iPhone 13-16, Samsung Galaxy S & Fold series.',
      discount_percent: 25,
      badge: 'Seller Accessory Deal',
      category: 'Cases & Covers',
      valid_until: 'Limited Stock',
      shop: shopMap['shop-seller-2'],
    },
    {
      id: 'off-5',
      shopId: 'shop-admin-3',
      title: 'Water Damage Ultrasonic Clean & Diagnostics - Flat 30% Off',
      description: 'Complete motherboard ultrasonic corrosion cleansing & SMD chip component diagnostics.',
      discount_percent: 30,
      badge: 'Admin Repair Deal',
      category: 'Motherboard',
      valid_until: 'Express Service',
      shop: shopMap['shop-admin-3'],
    },
    {
      id: 'off-far',
      shopId: 'shop-far-1',
      title: 'Far Highway Store Deal (Over 3 km away)',
      description: 'This offer is located beyond 2 km and must be filtered out by the radius rule.',
      discount_percent: 10,
      badge: 'Admin Repair Deal',
      category: 'General',
      valid_until: 'Expired',
      shop: shopMap['shop-far-1'],
    },
  ];

  const products = [
    {
      id: 'prod-1',
      shopId: 'shop-seller-1',
      name: '65W GaN Dual-Port Fast Charger (Type-C + USB-A)',
      brand: 'Anker PowerDrive',
      category: 'Chargers & Cables',
      price: 899,
      originalPrice: 1499,
      stock: 19,
      shop: shopMap['shop-seller-1'],
    },
    {
      id: 'prod-2',
      shopId: 'shop-admin-1',
      name: 'OEM Certified High-Drain Replacement Battery (4500mAh)',
      brand: 'SmartFix Verified',
      category: 'Battery & Spares',
      price: 1199,
      originalPrice: 1799,
      stock: 14,
      shop: shopMap['shop-admin-1'],
    },
    {
      id: 'prod-3',
      shopId: 'shop-seller-2',
      name: 'ArmorShield MagSafe Transparent Hybrid Case',
      brand: 'Spigen Tough',
      category: 'Cases & Covers',
      price: 499,
      originalPrice: 899,
      stock: 32,
      shop: shopMap['shop-seller-2'],
    },
    {
      id: 'prod-4',
      shopId: 'shop-admin-2',
      name: 'High-Fidelity USB-C Digital Audio DAC Earphones',
      brand: 'RealSound Pro',
      category: 'Audio',
      price: 599,
      originalPrice: 999,
      stock: 22,
      shop: shopMap['shop-admin-2'],
    },
    {
      id: 'prod-5',
      shopId: 'shop-seller-3',
      name: '10,000mAh Magnetic Slim Wireless Power Bank 20W',
      brand: 'Mi FastCharge',
      category: 'Power Banks',
      price: 1399,
      originalPrice: 2199,
      stock: 11,
      shop: shopMap['shop-seller-3'],
    },
    {
      id: 'prod-6',
      shopId: 'shop-seller-1',
      name: 'Anti-Glare Matte Privacy Screen Protector (Pack of 2)',
      brand: 'ShieldPro Max',
      category: 'Screen Protectors',
      price: 349,
      originalPrice: 599,
      stock: 45,
      shop: shopMap['shop-seller-1'],
    },
    {
      id: 'prod-far',
      shopId: 'shop-far-2',
      name: 'Out of Range Distant Product (4.3 km away)',
      brand: 'FarAway Brand',
      category: 'Chargers & Cables',
      price: 999,
      originalPrice: 1299,
      stock: 5,
      shop: shopMap['shop-far-2'],
    },
  ];

  return { offers, products };
}

