'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Sparkles, Tag, ShoppingBag, 
  Store, MapPin, ArrowRight, CheckCircle2, ShieldCheck, Star
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { getProductImages, getWhatsAppInquiryUrl } from '../utils/productImages';

// High-quality showcase products to ensure the carousel always looks rich & vibrant
const SHOWCASE_PRODUCTS = [
  {
    id: 'showcase-1',
    name: 'GaN 65W Ultra-Fast Charger Dual Port',
    brand: 'Anker / GaN Tech',
    category: 'Chargers & Cables',
    price: 1499,
    original_price: 2199,
    description: 'Compact 65W GaN high-speed adapter with USB-C Power Delivery 3.0 & PPS support. Charges smartphones & laptops up to 60% in 30 minutes.',
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=800&q=80',
    ],
    features: ['65W Fast Charging', 'Dual Port (Type-C + USB-A)', 'Surge & Temperature Protection'],
    stock: 15,
    seller_phone: '919845011223',
    uploader_name: 'SmartFix Accessories',
    shop: {
      name: 'SmartFix Accessories',
      address: 'Main Commercial Galleria, Shop #4',
      phone: '+91 98450 11223',
      rating: '4.9',
    },
    theme: 'amber',
  },
  {
    id: 'showcase-2',
    name: 'Military-Grade Drop Armor Case',
    brand: 'ArmorShield Pro',
    category: 'Cases & Covers',
    price: 699,
    original_price: 1199,
    description: 'Air-cushion corner drop shock absorption with matte anti-scratch surface and raised 1.5mm lens camera protection.',
    image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
    ],
    features: ['10ft Drop Certified', 'Raised Camera Lip', 'Wireless Charging Compatible'],
    stock: 24,
    seller_phone: '919845122334',
    uploader_name: 'Apex Mobile Accessories',
    shop: {
      name: 'Apex Mobile Accessories',
      address: 'Ring Road Market, Ground Floor',
      phone: '+91 98451 22334',
      rating: '4.8',
    },
    theme: 'emerald',
  },
  {
    id: 'showcase-3',
    name: '9H Privacy Tempered Glass Shield',
    brand: 'GorillaShield',
    category: 'Screen Protectors',
    price: 349,
    original_price: 699,
    description: '28-degree micro-louver anti-spy privacy filter. Oleophobic coating prevents fingerprint oil smudges with crystal clarity.',
    image_url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
    ],
    features: ['28° Two-Way Privacy', '9H Scratch-Proof Hardness', 'Bubble-Free Kit Included'],
    stock: 40,
    seller_phone: '919845233445',
    uploader_name: 'ShieldPro Display Studio',
    shop: {
      name: 'ShieldPro Display Studio',
      address: 'Central Plaza Tech Arcade',
      phone: '+91 98452 33445',
      rating: '4.9',
    },
    theme: 'purple',
  },
  {
    id: 'showcase-4',
    name: '20000mAh Ultra-Slim Fast Power Bank',
    brand: 'PowerCore 22.5W',
    category: 'Power Banks',
    price: 1899,
    original_price: 2999,
    description: 'Aircraft-grade lightweight power bank capable of 4 full smartphone charges. Supports 22.5W Super Charge with digital LED display.',
    image_url: 'https://images.unsplash.com/photo-1609592424364-bbab5e9c054e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1609592424364-bbab5e9c054e?auto=format&fit=crop&w=800&q=80',
    ],
    features: ['20000mAh Lithium-Polymer', '22.5W QC + PD 3.0', 'Smart LED Percentage Display'],
    stock: 12,
    seller_phone: '919845344556',
    uploader_name: 'VoltWave Electronics',
    shop: {
      name: 'VoltWave Electronics',
      address: 'City Center Mall, 2nd Floor',
      phone: '+91 98453 44556',
      rating: '4.8',
    },
    theme: 'blue',
  },
];

export default function ProductHeroCarousel() {
  const [products, setProducts] = useState(SHOWCASE_PRODUCTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const autoPlayRef = useRef(null);

  // Load live products from Supabase & prepend to showcase
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const liveProducts = await supabaseService.getProducts();

        if (!isMounted) return;

        if (Array.isArray(liveProducts) && liveProducts.length > 0) {
          const themes = ['amber', 'emerald', 'purple', 'blue'];
          const formatted = liveProducts.map((p, idx) => {
            const prodImages = getProductImages(p);
            return {
              ...p,
              image_url: prodImages[0],
              images: prodImages,
              features: [
                '100% Genuine Accessory',
                'Direct Seller WhatsApp Inquiry',
                'In-Stock Local Availability',
              ],
              theme: themes[idx % themes.length],
            };
          });

          // Merge live products with showcase
          setProducts([...formatted, ...SHOWCASE_PRODUCTS]);
        }
      } catch (err) {
        console.warn('Products carousel notice:', err.message);
      }
    }

    loadProducts();
    return () => { isMounted = false; };
  }, []);

  // Reset active image index when current product changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [currentIndex]);

  // Auto-play interval: 5 seconds
  useEffect(() => {
    if (products.length <= 1 || isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [products.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const currentProduct = products[currentIndex] || products[0];
  const productImages = getProductImages(currentProduct);
  const displayImage = productImages[activeImageIdx] || productImages[0];

  // Dynamic theme colors
  const getThemeStyles = (theme) => {
    switch (theme) {
      case 'emerald':
        return {
          glow: 'bg-emerald-500/20',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          gradientText: 'from-emerald-400 via-teal-300 to-cyan-400',
          btn: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 text-slate-950 shadow-emerald-500/25',
          borderHover: 'hover:border-emerald-500/40',
          cardAccent: 'border-emerald-500/30 bg-emerald-950/30',
        };
      case 'purple':
        return {
          glow: 'bg-purple-500/20',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          gradientText: 'from-purple-400 via-pink-400 to-amber-300',
          btn: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-purple-500/25',
          borderHover: 'hover:border-purple-500/40',
          cardAccent: 'border-purple-500/30 bg-purple-950/30',
        };
      case 'blue':
        return {
          glow: 'bg-cyan-500/20',
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          gradientText: 'from-cyan-400 via-blue-400 to-indigo-300',
          btn: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-cyan-500/25',
          borderHover: 'hover:border-cyan-500/40',
          cardAccent: 'border-cyan-500/30 bg-blue-950/30',
        };
      default: // amber
        return {
          glow: 'bg-amber-500/20',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          gradientText: 'from-amber-400 via-orange-400 to-rose-400',
          btn: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 shadow-amber-500/25',
          borderHover: 'hover:border-amber-500/40',
          cardAccent: 'border-amber-500/30 bg-amber-950/30',
        };
    }
  };

  const themeStyle = getThemeStyles(currentProduct.theme);
  const sellerPhone = currentProduct.seller_phone || currentProduct.phone || currentProduct.shop?.phone || '919845011223';
  const sellerName = currentProduct.uploader_name || currentProduct.seller?.name || currentProduct.shop?.name || 'Verified Seller';
  const isRealProduct = currentProduct.id && !String(currentProduct.id).startsWith('showcase-');

  return (
    <div 
      className="w-full relative overflow-hidden bg-slate-950 border-b border-slate-800/80 bg-studio-grid selection:bg-amber-500 selection:text-slate-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Animated Glow Spotlights */}
      <div 
        className={`absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${themeStyle.glow}`} 
      />
      <div 
        className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" 
      />

      {/* Main Full-Width Hero Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        
        {/* Slides Track */}
        <div className="relative min-h-[460px] sm:min-h-[420px] flex items-center">
          
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column (7 Cols on desktop) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badges & Status Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20">
                  <ShoppingBag className="w-3.5 h-3.5 fill-slate-950" />
                  <span>FEATURED PRODUCT</span>
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${themeStyle.badge}`}>
                  <Tag className="w-3.5 h-3.5" />
                  <span>{currentProduct.category || 'Accessories'}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock</span>
                </span>
              </div>

              {/* Headline & Brand */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  {currentProduct.name}
                </h1>
                {currentProduct.brand && (
                  <div className={`text-xl sm:text-2xl font-black bg-gradient-to-r ${themeStyle.gradientText} bg-clip-text text-transparent`}>
                    By {currentProduct.brand}
                  </div>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-1">
                <div className="flex items-baseline text-4xl sm:text-5xl font-black text-white tracking-tight">
                  <span className="text-2xl text-amber-400 mr-1 font-bold">₹</span>
                  <span>{Number(currentProduct.price || 0).toLocaleString('en-IN')}</span>
                </div>
                {currentProduct.original_price && (
                  <span className="text-lg sm:text-xl text-slate-500 line-through font-medium">
                    ₹{Number(currentProduct.original_price).toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
                {currentProduct.description}
              </p>

              {/* Feature Pills */}
              {currentProduct.features && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {currentProduct.features.map((feat, idx) => (
                    <div 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
                <a
                  href={getWhatsAppInquiryUrl({
                    phone: sellerPhone,
                    productName: currentProduct.name,
                    price: currentProduct.price,
                    shopName: sellerName,
                    brand: currentProduct.brand,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-auto justify-center px-6 sm:px-7 py-3.5 sm:py-4 font-black rounded-2xl text-xs sm:text-sm transition flex items-center space-x-2 shadow-2xl transform active:scale-95 ${themeStyle.btn}`}
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                  </svg>
                  <span>Inquire on WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>

                {isRealProduct ? (
                  <Link
                    href={`/products/${currentProduct.id}`}
                    className="w-full sm:w-auto justify-center px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 hover:text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center space-x-2 backdrop-blur-md transform active:scale-95"
                  >
                    <span>View Product Details</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>
                ) : (
                  <a
                    href="#nearby"
                    className="w-full sm:w-auto justify-center px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 hover:text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center space-x-2 backdrop-blur-md transform active:scale-95"
                  >
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Explore Nearby (1–2 km) &darr;</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero login required &bull; Direct seller WhatsApp chat &amp; local in-store pickup</span>
              </div>

            </div>

            {/* Right Column: High-End Cinematic Product Showcase Card (5 Cols on desktop) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              
              <div className={`w-full max-w-md bento-card rounded-3xl p-5 sm:p-6 shadow-2xl border transition duration-500 relative overflow-hidden ${themeStyle.cardAccent}`}>
                
                {/* Glow ribbon */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none" />

                {/* Card Header with Seller Info */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0">
                      <Store className="w-4 h-4 text-slate-950" />
                    </div>
                    <div className="truncate">
                      <div className="font-extrabold text-white text-xs tracking-wider uppercase truncate">
                        {sellerName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{currentProduct.shop?.address || 'Verified Partner Store'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-lg border border-amber-500/30 flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{currentProduct.shop?.rating || '4.9'}</span>
                  </span>
                </div>

                {/* Product Image Frame */}
                <div className="py-4 space-y-3">
                  <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group/img shadow-inner">
                    <img
                      src={displayImage}
                      alt={currentProduct.name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white font-black text-sm shadow-xl flex items-center gap-1">
                      <span className="text-amber-400 font-bold">₹</span>
                      <span>{Number(currentProduct.price || 0).toLocaleString('en-IN')}</span>
                    </div>

                    {/* Stock pill */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-black text-[10px] shadow-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>IN STOCK</span>
                    </div>
                  </div>

                  {/* Multi-Image Thumbnails (if multiple exist) */}
                  {productImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {productImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                            idx === activeImageIdx
                              ? 'border-amber-400 shadow-md scale-105'
                              : 'border-slate-800 hover:border-slate-600 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Action Trigger button inside Card */}
                <a
                  href={getWhatsAppInquiryUrl({
                    phone: sellerPhone,
                    productName: currentProduct.name,
                    price: currentProduct.price,
                    shopName: sellerName,
                    brand: currentProduct.brand,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                  </svg>
                  <span>Chat with Seller on WhatsApp</span>
                </a>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Floating Edge Navigation Arrows */}
      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous product"
            className="absolute left-1.5 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-2xl transition backdrop-blur-xl hover:scale-110 z-20 group"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-slate-300 group-hover:text-white" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next product"
            className="absolute right-1.5 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-2xl transition backdrop-blur-xl hover:scale-110 z-20 group"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-slate-300 group-hover:text-white" />
          </button>
        </>
      )}

      {/* Full-Width Interactive Slide Indicator Tabs (Bottom Strip) */}
      <div className="w-full border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3">
            {products.slice(0, 4).map((prod, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={prod.id || idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`text-left p-2.5 rounded-xl transition duration-300 relative overflow-hidden group ${
                    isActive
                      ? 'bg-slate-900 border border-slate-700/80 shadow-lg'
                      : 'hover:bg-slate-900/40 border border-transparent'
                  }`}
                >
                  {/* Progress Line */}
                  <div 
                    className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                      isActive 
                        ? 'w-full bg-gradient-to-r from-amber-400 to-emerald-400' 
                        : 'w-0 group-hover:w-full bg-slate-700'
                    }`} 
                  />

                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={`truncate ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {prod.name}
                    </span>
                    <span className={`text-[10px] font-black shrink-0 ml-1 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      ₹{Number(prod.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
