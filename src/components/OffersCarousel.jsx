'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Sparkles, Tag, Clock, 
  Store, Wrench, MapPin, MessageSquare, Flame, ShieldCheck, 
  ArrowRight, Phone, CheckCircle2, Zap, Percent
} from 'lucide-react';
import CustomerInquiryModal from './CustomerInquiryModal';
import { supabaseService } from '../services/supabaseService';

// Default showcase offers ensuring the carousel is always stunning and vibrant
const SHOWCASE_OFFERS = [
  {
    id: 'showcase-1',
    itemType: 'OFFER',
    title: 'AMOLED Screen Replacement Combo',
    highlight: 'Free 9H Tempered Glass Installed',
    description: 'Certified OEM display replacement with 6-month touch warranty. 45-minute express turnaround with comprehensive multi-point diagnostic report.',
    discount_percent: 30,
    tag: '⚡ FLASH REPAIR COMBO',
    theme: 'amber',
    valid_until: 'Limited Time Deal',
    features: ['6-Month Touch Warranty', '45-Min Express Service', 'Original OEM Display'],
    shop: {
      name: 'SmartFix Central Care Lab',
      address: 'Near Central Market Commercial Hub',
      phone: '+91 98450 11223',
      rating: '4.9 (184 reviews)',
    },
    role: 'ADMIN',
  },
  {
    id: 'showcase-2',
    itemType: 'OFFER',
    title: 'High-Capacity Battery Health Upgrade',
    highlight: 'Zero Degradation Calibration',
    description: 'Revive your smartphone battery life back to 100% capacity. Safe lithium-polymer certified cells with integrated surge protection and old battery recycling.',
    discount_percent: 25,
    tag: '🔋 BATTERY HEALTH PASS',
    theme: 'emerald',
    valid_until: 'Valid this Month',
    features: ['100% Health Guarantee', 'Same-Day Replacement', 'Surge-Safe Protection'],
    shop: {
      name: 'QuickFix Electronics Lab',
      address: 'Ring Road Tech Galleria, 1st Floor',
      phone: '+91 98451 22334',
      rating: '4.8 (120 reviews)',
    },
    role: 'ADMIN',
  },
  {
    id: 'showcase-3',
    itemType: 'OFFER',
    title: 'Buy 1 Get 1 FREE on Armor Phone Cases',
    highlight: 'Military-Grade Drop Certified',
    description: 'Ultra-durable shockproof cases for iPhone, Samsung Galaxy S & Fold series. Includes raised camera bezel protection and scratch-resistant matte finish.',
    discount_percent: 50,
    tag: '🎧 ACCESSORY MEGA DEAL',
    theme: 'purple',
    valid_until: 'This Weekend Only',
    features: ['Buy 1 Get 1 Free', 'Drop-Tested Protection', 'Instant Walk-in Pickup'],
    shop: {
      name: 'CaseCraft & Accessories Studio',
      address: 'Shopping Plaza, Ground Floor',
      phone: '+91 98452 33445',
      rating: '4.9 (167 reviews)',
    },
    role: 'SELLER',
  },
  {
    id: 'showcase-4',
    itemType: 'OFFER',
    title: 'Water Damage Ultrasonic Cleansing',
    highlight: 'Corrosion Neutralization & Board SMD Care',
    description: 'Dropped your phone in water? Specialized ultrasonic frequency bath removes corrosion and restores short-circuited logic board components.',
    discount_percent: 20,
    tag: '💧 LIQUID DAMAGE RESCUE',
    theme: 'blue',
    valid_until: 'Express Emergency Care',
    features: ['Ultrasonic Cleaning', 'Component Micro-Soldering', 'No Data Loss Focus'],
    shop: {
      name: 'Apex Chipset & Logic Solutions',
      address: 'Main Avenue Electronics Center',
      phone: '+91 98453 44556',
      rating: '4.8 (98 reviews)',
    },
    role: 'ADMIN',
  },
];

export default function OffersCarousel() {
  const [offers, setOffers] = useState(SHOWCASE_OFFERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedInquiryItem, setSelectedInquiryItem] = useState(null);
  const autoPlayRef = useRef(null);

  // Load live offers from Supabase & merge with showcase
  useEffect(() => {
    let isMounted = true;

    async function loadOffers() {
      try {
        const [liveOffers, liveShops] = await Promise.all([
          supabaseService.getOffers(),
          supabaseService.getShops(),
        ]);

        if (!isMounted) return;

        const shopMap = {};
        if (Array.isArray(liveShops)) {
          liveShops.forEach((s) => { shopMap[s.id] = s; });
        }

        if (Array.isArray(liveOffers) && liveOffers.length > 0) {
          const formatted = liveOffers.map((o, idx) => {
            const associatedShop = shopMap[o.shop_id] || null;
            const themes = ['amber', 'emerald', 'purple', 'blue'];
            return {
              id: o.id,
              itemType: 'OFFER',
              title: o.title,
              highlight: 'Special Partner Promotional Discount',
              description: o.description || 'Special limited-time discount from our verified local store partner.',
              discount_percent: o.discount_percent || 20,
              valid_until: o.valid_until 
                ? (o.valid_until.includes('T') ? `Valid until ${new Date(o.valid_until).toLocaleDateString()}` : o.valid_until)
                : 'Limited Time Deal',
              role: o.uploader_role || 'ADMIN',
              tag: '🔥 VERIFIED SHOP OFFER',
              theme: themes[idx % themes.length],
              features: ['Certified Genuine Service', 'Direct Shop WhatsApp', '100% Free Inquiry'],
              shop: associatedShop || {
                name: o.uploader_name || 'Verified Partner Shop',
                address: 'Local Marketplace Store',
                phone: '+91 98450 11223',
                rating: '4.8',
              },
            };
          });

          // Merge live offers with showcase so the carousel is richly populated
          setOffers([...formatted, ...SHOWCASE_OFFERS]);
        }
      } catch (err) {
        console.warn('Offers carousel notice:', err.message);
      }
    }

    loadOffers();
    return () => { isMounted = false; };
  }, []);

  // Auto-play interval: 5 seconds
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [offers.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? offers.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  const currentOffer = offers[currentIndex] || offers[0];
  const isAdmin = currentOffer.role === 'ADMIN';

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
          ticketAccent: 'border-emerald-500/30 bg-emerald-950/40',
        };
      case 'purple':
        return {
          glow: 'bg-purple-500/20',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          gradientText: 'from-purple-400 via-pink-400 to-amber-300',
          btn: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-purple-500/25',
          borderHover: 'hover:border-purple-500/40',
          ticketAccent: 'border-purple-500/30 bg-purple-950/40',
        };
      case 'blue':
        return {
          glow: 'bg-cyan-500/20',
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          gradientText: 'from-cyan-400 via-blue-400 to-indigo-300',
          btn: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-cyan-500/25',
          borderHover: 'hover:border-cyan-500/40',
          ticketAccent: 'border-cyan-500/30 bg-blue-950/40',
        };
      default: // amber
        return {
          glow: 'bg-amber-500/20',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          gradientText: 'from-amber-400 via-orange-400 to-rose-400',
          btn: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 shadow-amber-500/25',
          borderHover: 'hover:border-amber-500/40',
          ticketAccent: 'border-amber-500/30 bg-amber-950/40',
        };
    }
  };

  const themeStyle = getThemeStyles(currentOffer.theme);

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
                  <Flame className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{currentOffer.discount_percent}% OFF FLASH DEAL</span>
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${themeStyle.badge}`}>
                  {isAdmin ? <Wrench className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                  <span>{isAdmin ? 'Certified Repair Hub' : 'Partner Accessory Store'}</span>
                </span>

                {currentOffer.valid_until && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-md">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentOffer.valid_until}</span>
                  </span>
                )}
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  {currentOffer.title}
                </h1>
                <div className={`text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r ${themeStyle.gradientText} bg-clip-text text-transparent`}>
                  {currentOffer.highlight}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
                {currentOffer.description}
              </p>

              {/* Feature Pills */}
              {currentOffer.features && (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {currentOffer.features.map((feat, idx) => (
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
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setSelectedInquiryItem(currentOffer)}
                  className={`px-7 py-4 font-black rounded-2xl text-sm transition flex items-center space-x-2 shadow-2xl transform hover:-translate-y-0.5 ${themeStyle.btn}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Claim Offer / Send Query</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <a
                  href="#nearby"
                  className="px-6 py-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 hover:text-white font-bold rounded-2xl text-sm transition flex items-center space-x-2 backdrop-blur-md transform hover:-translate-y-0.5"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Explore Nearby (1–2 km) &darr;</span>
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero login required &bull; Direct WhatsApp chat &amp; immediate phone call</span>
              </div>

            </div>

            {/* Right Column: High-End Cinematic Voucher Card (5 Cols on desktop) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              
              <div className={`w-full max-w-md bento-card rounded-3xl p-6 sm:p-7 shadow-2xl border transition duration-500 relative overflow-hidden ${themeStyle.ticketAccent}`}>
                
                {/* Glow ribbon */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none" />

                {/* Voucher Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs">
                      ⚡
                    </div>
                    <div>
                      <div className="font-extrabold text-white text-xs tracking-wider uppercase">SmartFix Voucher</div>
                      <div className="text-[10px] text-slate-400">Hyperlocal Deal Pass</div>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-mono text-xs font-black rounded-lg border border-amber-500/30">
                    SAVE {currentOffer.discount_percent}%
                  </span>
                </div>

                {/* Big Discount Callout */}
                <div className="py-5 text-center space-y-1">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Exclusive Promotional Saving
                  </div>
                  <div className="text-5xl sm:text-6xl font-black text-white tracking-tight flex items-baseline justify-center">
                    <span>{currentOffer.discount_percent}</span>
                    <span className="text-3xl text-amber-400">%</span>
                    <span className="text-2xl text-slate-400 font-bold ml-1">OFF</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Valid for in-store walk-in customers &amp; delivery
                  </p>
                </div>

                {/* Dashed Separator */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="w-full border-t-2 border-dashed border-white/15" />
                  <div className="absolute -left-10 w-6 h-6 rounded-full bg-slate-950" />
                  <div className="absolute -right-10 w-6 h-6 rounded-full bg-slate-950" />
                </div>

                {/* Shop Partner Profile */}
                <div className="pt-3 space-y-3">
                  <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-3.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white truncate flex items-center gap-1.5">
                        {isAdmin ? <Wrench className="w-3.5 h-3.5 text-amber-400" /> : <Store className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{currentOffer.shop?.name}</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        ⭐ {currentOffer.shop?.rating || '4.9'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{currentOffer.shop?.address}</span>
                    </div>
                  </div>

                  {/* 1-Click WhatsApp Trigger button inside Voucher */}
                  <button
                    type="button"
                    onClick={() => setSelectedInquiryItem(currentOffer)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire via WhatsApp &amp; Call</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Floating Edge Navigation Arrows */}
      {offers.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous offer"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-2xl transition backdrop-blur-xl hover:scale-110 z-20 group"
          >
            <ChevronLeft className="w-6 h-6 text-slate-300 group-hover:text-white" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next offer"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white flex items-center justify-center shadow-2xl transition backdrop-blur-xl hover:scale-110 z-20 group"
          >
            <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-white" />
          </button>
        </>
      )}

      {/* Full-Width Interactive Slide Indicator Tabs (Bottom Strip) */}
      <div className="w-full border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3">
            {offers.slice(0, 4).map((offer, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={offer.id || idx}
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
                      {offer.title}
                    </span>
                    <span className={`text-[10px] font-black shrink-0 ml-1 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                      {offer.discount_percent}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Inquiry Modal (Zero-login query directly to shop owner) */}
      <CustomerInquiryModal
        isOpen={!!selectedInquiryItem}
        onClose={() => setSelectedInquiryItem(null)}
        item={selectedInquiryItem}
      />
    </div>
  );
}
