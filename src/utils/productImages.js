/**
 * Product Image Presets & WhatsApp Link Helpers
 */

export const CATEGORY_DEFAULT_IMAGES = {
  'Chargers & Cables': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
  'Cases & Covers': 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
  'Screen Protectors': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
  'Power Banks': 'https://images.unsplash.com/photo-1609592424364-bbab5e9c054e?auto=format&fit=crop&w=800&q=80',
  'Audio': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  'General': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
};

export const POPULAR_PRESET_IMAGES = [
  {
    name: 'GaN 65W Fast Charger',
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    category: 'Chargers & Cables',
  },
  {
    name: 'Braided Type-C Cable',
    url: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    category: 'Chargers & Cables',
  },
  {
    name: 'Military-Grade Armor Case',
    url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
    category: 'Cases & Covers',
  },
  {
    name: '9H Privacy Tempered Glass',
    url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
    category: 'Screen Protectors',
  },
  {
    name: '20000mAh Fast Power Bank',
    url: 'https://images.unsplash.com/photo-1609592424364-bbab5e9c054e?auto=format&fit=crop&w=800&q=80',
    category: 'Power Banks',
  },
  {
    name: 'Wireless ANC Earbuds',
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    category: 'Audio',
  },
];

export function getProductImages(product) {
  if (!product) {
    return [CATEGORY_DEFAULT_IMAGES['General']];
  }

  let list = [];

  // 1. Check array format
  if (Array.isArray(product.images) && product.images.length > 0) {
    list = product.images.filter(img => typeof img === 'string' && img.trim().length > 0);
  }
  // 2. Check JSON string format
  else if (typeof product.images === 'string' && product.images.trim().length > 0) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed)) {
        list = parsed.filter(img => typeof img === 'string' && img.trim().length > 0);
      }
    } catch {
      // Fallback: comma separated
      list = product.images.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // 3. Fallback to single image_url if provided
  if (list.length === 0 && product.image_url && typeof product.image_url === 'string' && product.image_url.trim().length > 0) {
    list = [product.image_url.trim()];
  }

  // 4. Default category placeholder if no images found
  if (list.length === 0) {
    const category = product?.category || 'Accessories';
    list = [CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES['General']];
  }

  return list;
}

export function getProductImage(product) {
  const images = getProductImages(product);
  return images[0] || CATEGORY_DEFAULT_IMAGES['General'];
}

export function formatWhatsAppPhone(phone) {
  if (!phone) return '919845011223';
  let clean = String(phone).replace(/[^0-9]/g, '');
  // Strip leading 0 if 11 digits (e.g. 09845011223)
  if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.substring(1);
  }
  // If 10 digits standard mobile, prepend Indian country code 91
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean;
}

export function getWhatsAppInquiryUrl(params = {}) {
  const targetPhone = formatWhatsAppPhone(params.phone);
  const formattedPrice = Number(params.price || 0).toLocaleString('en-IN');
  const shopLabel = params.shopName || 'Partner Store';
  const brandLabel = params.brand ? ` (${params.brand})` : '';

  const message = 
`Hello ${shopLabel}! 👋
I found your product on *SmartFix Hub Marketplace*:

📦 *${params.productName || 'Product'}*${brandLabel}
💰 *Price:* ₹${formattedPrice}
🏪 *Store:* ${shopLabel}

Is this item currently available in stock for direct pickup or local delivery?`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppRepairTrackingUrl({
  customerPhone,
  customerName,
  ticketId,
  deviceBrand,
  deviceModel,
  problemDescription,
  shopName,
  status,
}) {
  const targetPhone = formatWhatsAppPhone(customerPhone);
  const cleanTicket = String(ticketId || '').trim().toUpperCase();
  const trackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?ticket=${cleanTicket}`
    : `https://smartfixhub.com/track?ticket=${cleanTicket}`;

  const message = 
`Hello ${customerName || 'Customer'}! 👋
Your mobile repair request is registered on *SmartFix Hub*:

🎫 *Tracking ID:* ${cleanTicket}
📱 *Device:* ${deviceBrand || ''} ${deviceModel || ''}
${problemDescription ? `🔧 *Issue:* ${problemDescription}\n` : ''}${shopName ? `🏪 *Assigned Workshop:* ${shopName}\n` : ''}${status ? `📊 *Current Status:* ${status}\n` : ''}
🔍 *Track Live Status & Diagnostic Milestones:*
👉 ${trackUrl}

Keep this Tracking ID handy. You can check repair updates, technician notes, and download your warranty invoice anytime.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Extracts all intake inspection and device condition photos from a repair job
 * Reads from job.images, job.image_url, and fallback notes format
 */
export function getRepairJobImages(job) {
  if (!job) return [];
  const list = [];

  // 1. Array format in job.images
  if (Array.isArray(job.images) && job.images.length > 0) {
    job.images.filter(Boolean).forEach((img) => {
      if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
        list.push(img.trim());
      }
    });
  } else if (typeof job.images === 'string' && job.images.trim()) {
    try {
      const parsed = JSON.parse(job.images);
      if (Array.isArray(parsed)) {
        parsed.filter(Boolean).forEach((img) => {
          if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
            list.push(img.trim());
          }
        });
      }
    } catch {
      job.images.split(',').forEach((img) => {
        const clean = img.trim();
        if (clean && !list.includes(clean)) list.push(clean);
      });
    }
  }

  // 2. Single image_url field
  if (job.image_url && typeof job.image_url === 'string' && job.image_url.trim()) {
    const cleanUrl = job.image_url.trim();
    if (!list.includes(cleanUrl)) {
      list.unshift(cleanUrl);
    }
  }

  // 3. Fallback: Parse from notes [Intake Photos]: [...]
  if (job.notes && typeof job.notes === 'string') {
    const match = job.notes.match(/\[Intake Photos\]:\s*(\[.*?\])/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => {
            if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
              list.push(img.trim());
            }
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return list;
}

