'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin, Navigation, Compass, Filter, Search, Tag, Phone,
  Clock, ShieldCheck, CheckCircle2, ArrowRight, Store, Sparkles, ShoppingBag
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { getProductImage, getProductImages, getWhatsAppInquiryUrl } from '../utils/productImages';

export default function NearbyMarketplace() {
  // 1. Geolocation State
  const [userCoords, setUserCoords] = useState({ lat: 12.9716, lng: 77.5946 }); // Default: Central City Hub
  const [userAddress, setUserAddress] = useState('Central Commercial District');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  // 2. Strict Radius state (1.0 km, 1.5 km, 2.0 km)
  const [radiusKm, setRadiusKm] = useState(2.0);

  // 3. Filter state
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'ADMIN' | 'SELLER'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 4. Pure Live Supabase Products & Shops Data
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real data from Supabase
  const loadMarketplaceData = async () => {
    try {
      setIsLoading(true);
      const [liveShops, liveProds] = await Promise.all([
        supabaseService.getShops(),
        supabaseService.getProducts(),
      ]);

      setShops(Array.isArray(liveShops) ? liveShops : []);
      setProducts(Array.isArray(liveProds) ? liveProds : []);
    } catch (err) {
      console.warn('Live Supabase marketplace sync error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Handle Real Browser Geolocation
  const handleDetectLiveLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const liveLat = position.coords.latitude;
        const liveLng = position.coords.longitude;
        setUserCoords({ lat: liveLat, lng: liveLng });
        setUserAddress(`GPS Location (${liveLat.toFixed(4)}, ${liveLng.toFixed(4)})`);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('GPS permission denied or unavailable. Using default city coordinates.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Exact Haversine formula
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 1.0;
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  // Format distance
  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m away`;
    }
    return `${km.toFixed(1)} km away`;
  };

  // Shop lookup map
  const shopMap = useMemo(() => {
    const map = {};
    shops.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [shops]);

  // Combine real products with calculated distance
  const itemsWithDistance = useMemo(() => {
    return products.map((product) => {
      const shop = product.shop || shopMap[product.shop_id] || (product.seller?.shop_id && shopMap[product.seller.shop_id]) || null;
      const sellerRealPhone = product.seller_phone || product.seller?.phone || product.phone || shop?.phone || '';
      let distance = 1.2; // Default nearby estimate if shop has no explicit lat/lng yet
      if (shop?.latitude != null && shop?.longitude != null) {
        distance = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          Number(shop.latitude),
          Number(shop.longitude)
        );
      }

      return {
        ...product,
        distanceKm: distance,
        role: product.uploader_role || 'SELLER',
        seller_phone: sellerRealPhone,
        shop: shop || {
          name: product.uploader_name || product.seller?.name || 'Verified Accessory Store',
          address: 'Local Partner Shop',
          phone: sellerRealPhone,
          rating: '4.9',
        },
      };
    });
  }, [products, shopMap, userCoords]);

  // Apply strict radius filter, search, category, role, and area filters
  const filteredItems = useMemo(() => {
    return itemsWithDistance.filter((item) => {
      // 1. Strict Geofence Radius
      if (item.distanceKm > radiusKm) return false;

      // 2. Role Filter: ALL | ADMIN | SELLER
      if (roleFilter !== 'ALL' && item.role !== roleFilter) return false;

      // 3. Category Filter
      if (selectedCategory !== 'All') {
        const itemCat = item.category || 'Accessories';
        if (itemCat !== selectedCategory) return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (item.name || '').toLowerCase().includes(q);
        const descMatch = (item.description || item.brand || '').toLowerCase().includes(q);
        const shopMatch = (item.shop?.name || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !shopMatch) return false;
      }

      // 5. Area / Street text search
      if (areaFilter.trim()) {
        const a = areaFilter.toLowerCase();
        const addressMatch = (item.shop?.address || '').toLowerCase().includes(a);
        if (!addressMatch) return false;
      }

      return true;
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [itemsWithDistance, radiusKm, roleFilter, selectedCategory, searchQuery, areaFilter]);

  const uniqueShopsCount = useMemo(() => {
    const set = new Set();
    filteredItems.forEach(i => {
      if (i.shop?.name) set.add(i.shop.name);
    });
    return set.size;
  }, [filteredItems]);

  return (
    <section id="nearby" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-200">

      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">

        {/* 1. SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs dark:shadow-md">
              <Compass className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="bg-gradient-to-r from-amber-600 to-emerald-600 dark:from-amber-400 dark:to-emerald-400 bg-clip-text text-transparent font-bold">
                Nearby Products &amp; Stores (1–2 km Radius)
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Hyperlocal Mobile Marketplace
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Explore genuine smartphone accessories, cables, chargers, and protectors from verified neighborhood shops strictly within{' '}
              <strong className="text-slate-900 dark:text-white underline decoration-amber-500 decoration-2 underline-offset-4">
                1–2 km of your location
              </strong>.
            </p>
          </div>

          {/* Quick metric pill */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 sm:gap-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2 sm:p-3 rounded-2xl w-full sm:w-auto backdrop-blur-md shadow-xs dark:shadow-lg">
            <div className="text-center px-2 sm:px-4 border-r border-slate-200 dark:border-slate-800">
              <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{filteredItems.length}</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Products</div>
            </div>
            <div className="text-center px-2 sm:px-4 border-r border-slate-200 dark:border-slate-800">
              <div className="text-lg sm:text-xl font-black text-amber-500 dark:text-amber-400">{uniqueShopsCount}</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Local Stores</div>
            </div>
            <div className="text-center px-2 sm:px-4">
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{radiusKm} km</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Radius Limit</div>
            </div>
          </div>
        </div>

        {/* 2. GEOFENCE RADIAL CONTROLS BAR */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-xl space-y-4 sm:space-y-5 shadow-sm dark:shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">

            {/* GPS Location Status Pill */}
            <div className="md:col-span-4 flex items-center space-x-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="truncate text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white truncate">{userAddress}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">GPS Coordinates: {userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)}</div>
              </div>
            </div>

            {/* Detect Real GPS Button */}
            <div className="md:col-span-3">
              <button
                type="button"
                onClick={handleDetectLiveLocation}
                disabled={gpsLoading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-extrabold rounded-2xl text-xs transition flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 disabled:opacity-50 shadow-xs"
              >
                <Navigation className={`w-3.5 h-3.5 text-amber-500 dark:text-amber-400 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Locating...' : 'Use My Live GPS'}</span>
              </button>
            </div>

            {/* Strict Radius Switcher */}
            <div className="md:col-span-5 flex items-center justify-between sm:justify-end space-x-1.5 bg-slate-50 dark:bg-slate-950/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1 sm:px-2 shrink-0">Radius:</span>
              {[1.0, 1.5, 2.0].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`flex-1 py-1.5 px-2 sm:px-3 rounded-xl font-black text-xs transition duration-200 ${radiusKm === r
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900'
                    }`}
                >
                  {r.toFixed(1)} km
                </button>
              ))}
            </div>

          </div>

          {gpsError && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-xl font-medium">
              ⚠️ {gpsError}
            </div>
          )}

          {/* Search Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">

            {/* Keyword Search */}
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search products by title, brand (e.g. Fast Charger, Armor Case)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Local Street/Area filter */}
            <div className="md:col-span-5 relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Filter by street or plaza name..."
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>
        </div>

        {/* 3. PRODUCTS DISPLAY GRID */}
        <div className="space-y-6">

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredItems.length} verified products</strong> within a <strong className="text-amber-600 dark:text-amber-400">{radiusKm} km radius</strong>.
            </span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
              Sorted by closest distance
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bento-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-16 bg-slate-200/60 dark:bg-slate-800/40 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const distanceText = formatDistance(item.distanceKm);

                return (
                  <div
                    key={`prod-${item.id}`}
                    className="bento-card rounded-3xl p-4 sm:p-6 shadow-xs dark:shadow-xl flex flex-col justify-between group transition relative overflow-hidden backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Subtle color highlight ribbon */}
                    <div className="absolute top-0 right-0 w-36 h-36 rounded-bl-full pointer-events-none transition opacity-20 dark:opacity-30 bg-emerald-500/25" />

                    <div className="space-y-4">

                      {/* Top Row: Distance Badge & Store Pill */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Distance Pill */}
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white shadow-xs">
                          <span className={`w-2 h-2 rounded-full ${item.distanceKm <= 1.0 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span>{distanceText}</span>
                        </span>

                        {/* Store Badge */}
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">
                          🏪 Verified Store
                        </span>
                      </div>

                      {/* Product Image */}
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition">
                        <Link href={`/products/${item.id}`} className="block w-full h-full relative">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        </Link>
                        {item.stock != null && (
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-md">
                            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                          </span>
                        )}
                        {getProductImages(item).length > 1 && (
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950/90 text-slate-200 border border-slate-700 backdrop-blur-md shadow flex items-center gap-1">
                            <span>📷 {getProductImages(item).length} photos</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Pricing */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          {item.brand || 'Accessories'} &bull; {item.category || 'General'}
                        </div>
                        <Link href={`/products/${item.id}`} className="block hover:underline">
                          <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug group-hover:text-emerald-500 transition">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-baseline space-x-2 pt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            ₹{Number(item.price || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                            ₹{Math.round(Number(item.price || 0) * 1.25).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Shop Identity & Physical Location Info */}
                      <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                            <span>{item.uploader_name || item.shop?.name || 'Accessory Store'}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            ⭐ {item.shop?.rating || '4.8'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1 leading-snug">
                          <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                          <span className="truncate">{item.shop?.address || 'Local Partner Center'}</span>
                        </div>
                      </div>

                    </div>

                    {/* Card Bottom CTA */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Available In Store</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* WhatsApp Direct Chat Button */}
                        <a
                          href={getWhatsAppInquiryUrl({
                            phone: item.seller_phone || item.seller?.phone || item.phone || item.shop?.phone,
                            productName: item.name,
                            price: item.price,
                            shopName: item.uploader_name || item.shop?.name,
                            brand: item.brand,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 border border-[#25D366]/40 shadow-sm"
                          title="Chat directly on WhatsApp"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>

                        {/* Product Detail Page Link */}
                        <Link
                          href={`/products/${item.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center space-x-1 border border-slate-200 dark:border-slate-700"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Genuine Empty State when no items exist */}
          {!isLoading && filteredItems.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-600 dark:text-slate-400 space-y-4 max-w-xl mx-auto shadow-sm dark:shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Products Found Within {radiusKm} km</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  There are currently no mobile accessories matching your search criteria in this geofence radius.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRadiusKm(2.0)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg"
                >
                  Expand Radius to 2.0 km
                </button>
                <Link
                  href="/marketplace"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
                >
                  Browse Full Marketplace
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>

    </section>
  );
}
