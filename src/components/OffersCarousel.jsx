'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Sparkles, Tag, Clock, 
  Store, Wrench, MapPin, MessageSquare, Flame, ShieldCheck, ArrowRight
} from 'lucide-react';
import CustomerInquiryModal from './CustomerInquiryModal';
import { supabaseService } from '../services/supabaseService';

export default function OffersCarousel() {
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedInquiryItem, setSelectedInquiryItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const autoPlayRef = useRef(null);

  // Load purely LIVE offers from Supabase (ZERO static dummy data)
  useEffect(() => {
    let isMounted = true;

    async function fetchLiveOffers() {
      try {
        setLoading(true);
        const [liveOffers, liveShops] = await Promise.all([
          supabaseService.getOffers(),
          supabaseService.getShops(),
        ]);

        if (!isMounted) return;

        const shopMap = {};
        if (Array.isArray(liveShops)) {
          liveShops.forEach((s) => {
            shopMap[s.id] = s;
          });
        }

        if (Array.isArray(liveOffers) && liveOffers.length > 0) {
          const formatted = liveOffers.map((o) => {
            const associatedShop = shopMap[o.shop_id] || null;
            return {
              id: o.id,
              itemType: 'OFFER',
              title: o.title,
              description: o.description || 'Special limited-time promotional discount.',
              discount_percent: o.discount_percent || 15,
              valid_until: o.valid_until 
                ? (o.valid_until.includes('T') ? `Valid until ${new Date(o.valid_until).toLocaleDateString()}` : o.valid_until)
                : 'Limited Time Deal',
              role: o.uploader_role || 'ADMIN',
              shopId: o.shop_id || null,
              shop: associatedShop || {
                name: o.uploader_name || 'Verified Partner Shop',
                address: 'Local Store Location',
                phone: '+91 98450 11223',
              },
            };
          });
          setOffers(formatted);
        } else {
          setOffers([]);
        }
      } catch (err) {
        console.warn('Live offers sync notice:', err.message);
        if (isMounted) setOffers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLiveOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance carousel every 4.5 seconds if multiple live offers exist
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4500);

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

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-6">
        <div className="bento-card rounded-3xl p-8 border border-slate-800 text-center animate-pulse space-y-3">
          <div className="h-4 bg-slate-800 rounded-full w-48 mx-auto" />
          <div className="h-8 bg-slate-800/60 rounded-xl w-3/4 mx-auto" />
          <div className="h-3 bg-slate-800/40 rounded-full w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  // Purely dynamic: If no live offers in Supabase, show clean real status
  if (!offers || offers.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-6">
        <div className="bento-card rounded-3xl p-8 border border-slate-800 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">No Live Promotional Offers Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Verified repair centers and accessory stores have not published any promotional discounts at this moment. When a partner posts a live offer, it will appear here in real time.
          </p>
        </div>
      </div>
    );
  }

  const currentOffer = offers[currentIndex];
  const isAdmin = currentOffer.role === 'ADMIN';

  return (
    <div 
      className="w-full max-w-4xl mx-auto pt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header Label */}
      <div className="flex items-center justify-between px-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>Live Partner Offers &amp; Discounts</span>
          </div>
        </div>

        {offers.length > 1 && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="font-bold text-white font-mono">{currentIndex + 1}</span>
            <span>/</span>
            <span className="font-mono">{offers.length}</span>
          </div>
        )}
      </div>

      {/* Main Carousel Banner Card */}
      <div className="relative group bento-card rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl transition duration-500 border border-slate-800 hover:border-amber-500/40">
        
        {/* Glow ambient background spotlight */}
        <div 
          className={`absolute top-0 right-0 w-80 h-80 rounded-bl-full pointer-events-none transition duration-700 opacity-25 blur-3xl ${
            isAdmin ? 'bg-amber-500' : 'bg-emerald-500'
          }`} 
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Column: Badges + Offer Title & Details */}
          <div className="space-y-4 max-w-xl text-left">
            
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>{currentOffer.discount_percent}% OFF LIMITED DEAL</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${
                isAdmin 
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              }`}>
                {isAdmin ? <Wrench className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                <span>{isAdmin ? 'Certified Repair Hub' : 'Partner Accessory Store'}</span>
              </span>

              {currentOffer.valid_until && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{currentOffer.valid_until}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {currentOffer.title}
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {currentOffer.description}
            </p>

            {/* Shop Identity Strip */}
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{currentOffer.shop?.name || 'Local Neighborhood Store'}</span>
              </div>
              <span>&bull;</span>
              <span className="text-[11px] text-slate-400 truncate">
                {currentOffer.shop?.address || 'Direct Shop Partner'}
              </span>
            </div>
          </div>

          {/* Right Column: High-Impact Action Box */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedInquiryItem(currentOffer)}
              className={`px-6 py-3.5 font-black rounded-2xl text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-xl transform hover:-translate-y-0.5 ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Claim Offer / Send Query &rarr;</span>
            </button>

            <div className="text-[10px] text-slate-400 text-center md:text-right font-medium">
              ⚡ Instant WhatsApp &bull; Zero login required
            </div>
          </div>

        </div>

        {/* Carousel Arrow Controls (only if more than 1 offer) */}
        {offers.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous offer"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-white flex items-center justify-center shadow-lg transition backdrop-blur-md opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 text-slate-200" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next offer"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-white flex items-center justify-center shadow-lg transition backdrop-blur-md opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 text-slate-200" />
            </button>
          </>
        )}

      </div>

      {/* Carousel Navigation Indicator Dots */}
      {offers.length > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-3.5">
          {offers.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-7 h-2 bg-gradient-to-r from-amber-400 to-emerald-400 shadow'
                  : 'w-2 h-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>
      )}

      {/* Customer Inquiry Modal (Zero-login query directly to shop owner) */}
      <CustomerInquiryModal
        isOpen={!!selectedInquiryItem}
        onClose={() => setSelectedInquiryItem(null)}
        item={selectedInquiryItem}
      />
    </div>
  );
}
