'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  MapPin, Navigation, Tag, ShoppingBag, Wrench, Store, 
  Search, Filter, CheckCircle2, Phone, Sparkles, ChevronRight, 
  Sliders, AlertCircle, ArrowRight, ShieldCheck, Compass, Info, Check
} from 'lucide-react';
import { 
  calculateDistanceKm, 
  formatDistance, 
  LOCATION_PRESETS, 
  generateHyperlocalShops, 
  generateHyperlocalCatalog 
} from '../utils/geolocation';
import { supabaseService } from '../services/supabaseService';

export default function NearbyMarketplace() {
  // 1. Location state: default to Central Market preset
  const [selectedPresetId, setSelectedPresetId] = useState('central');
  const [userCoords, setUserCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [locationLabel, setLocationLabel] = useState('MG Road Central Market, Bengaluru');
  const [isLiveGps, setIsLiveGps] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // 2. Radius state (strictly 1.0 km to 2.0 km as requested)
  const [radiusKm, setRadiusKm] = useState(2.0); // Options: 1.0, 1.5, 2.0

  // 3. Filter state
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'OFFERS' | 'PRODUCTS'
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'ADMIN' | 'SELLER'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 4. Modal state for Contact / Reserve / Claim
  const [actionItem, setActionItem] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // 5. Live Supabase data + local fallback catalog
  const [catalogShops, setCatalogShops] = useState([]);
  const [catalogOffers, setCatalogOffers] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate catalog centered around current coords
  const refreshCatalogAroundCoords = (coords) => {
    const shops = generateHyperlocalShops(coords.lat, coords.lng);
    const { offers, products } = generateHyperlocalCatalog(shops);
    setCatalogShops(shops);
    setCatalogOffers(offers);
    setCatalogProducts(products);
  };

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    refreshCatalogAroundCoords(userCoords);

    // Also attempt to load live offers & products from Supabase
    (async () => {
      try {
        const [liveProds, liveOffs] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getOffers(),
        ]);
        // If Supabase has custom uploaded products, merge them
        if (Array.isArray(liveProds) && liveProds.length > 0) {
          // Live items without coordinates default to the primary admin/seller shop
          // to ensure user uploads are testable
          const defaultAdminShop = generateHyperlocalShops(userCoords.lat, userCoords.lng)[0];
          const defaultSellerShop = generateHyperlocalShops(userCoords.lat, userCoords.lng)[1];

          const formattedProds = liveProds.map((p) => ({
            id: p.id,
            shopId: p.shop_id || (p.uploader_role === 'ADMIN' ? defaultAdminShop.id : defaultSellerShop.id),
            name: p.name,
            brand: p.brand || 'Original',
            category: p.category || 'Accessories',
            price: Number(p.price || 499),
            originalPrice: Math.round(Number(p.price || 499) * 1.3),
            stock: Number(p.stock || 10),
            shop: p.uploader_role === 'ADMIN' ? defaultAdminShop : defaultSellerShop,
          }));

          setCatalogProducts((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const newAdditions = formattedProds.filter((i) => !existingIds.has(i.id));
            return [...prev, ...newAdditions];
          });
        }
      } catch (err) {
        console.warn('Live Supabase sync notice:', err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Handle Preset Change
  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    setIsLiveGps(false);
    setGpsError('');

    const preset = LOCATION_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const newCoords = { lat: preset.lat, lng: preset.lng };
      setUserCoords(newCoords);
      setLocationLabel(`${preset.name}, ${preset.city}`);
      refreshCatalogAroundCoords(newCoords);
    }
  };

  // Handle Live Browser Geolocation
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const liveLat = position.coords.latitude;
        const liveLng = position.coords.longitude;
        const newCoords = { lat: liveLat, lng: liveLng };

        setUserCoords(newCoords);
        setIsLiveGps(true);
        setSelectedPresetId('live');
        setLocationLabel(`Live GPS (${liveLat.toFixed(4)}, ${liveLng.toFixed(4)})`);
        setGpsLoading(false);

        // Dynamically anchor sample shops right around the user's real GPS position!
        refreshCatalogAroundCoords(newCoords);
      },
      (error) => {
        setGpsLoading(false);
        let errorMsg = 'Could not retrieve your live location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Switched back to preset demo area.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Position unavailable. Please try selecting a demo area below.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Using default demo location.';
        }
        setGpsError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  // Combine products and offers with calculated distance
  const itemsWithDistance = useMemo(() => {
    const list = [];

    // 1. Process Offers
    catalogOffers.forEach((offer) => {
      const shop = offer.shop;
      const distance = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        shop?.lat,
        shop?.lng
      );

      list.push({
        ...offer,
        itemType: 'OFFER',
        distanceKm: distance,
        role: shop?.role || 'ADMIN',
      });
    });

    // 2. Process Products
    catalogProducts.forEach((product) => {
      const shop = product.shop;
      const distance = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        shop?.lat,
        shop?.lng
      );

      list.push({
        ...product,
        itemType: 'PRODUCT',
        distanceKm: distance,
        role: shop?.role || 'SELLER',
      });
    });

    return list;
  }, [catalogOffers, catalogProducts, userCoords]);

  // Apply strict 1–2 km radius filter and user criteria
  const filteredItems = useMemo(() => {
    return itemsWithDistance
      .filter((item) => {
        // STRICT REQUIREMENT: Only show products and offers from admins and sellers
        // whose shop locations are within the selected radius (max 2 km).
        if (item.distanceKm == null || item.distanceKm > radiusKm) {
          return false;
        }

        // Tab filter (ALL, OFFERS, PRODUCTS)
        if (activeTab === 'OFFERS' && item.itemType !== 'OFFER') return false;
        if (activeTab === 'PRODUCTS' && item.itemType !== 'PRODUCT') return false;

        // Role filter (ALL, ADMIN, SELLER)
        if (roleFilter !== 'ALL' && item.role !== roleFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = item.name?.toLowerCase().includes(q) || item.title?.toLowerCase().includes(q);
          const descMatch = item.description?.toLowerCase().includes(q);
          const brandMatch = item.brand?.toLowerCase().includes(q);
          const shopMatch = item.shop?.name?.toLowerCase().includes(q);
          if (!nameMatch && !descMatch && !brandMatch && !shopMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)); // Nearest first
  }, [itemsWithDistance, radiusKm, activeTab, roleFilter, searchQuery]);

  // Statistics within current radius
  const nearbyAdminCount = filteredItems.filter((i) => i.role === 'ADMIN').length;
  const nearbySellerCount = filteredItems.filter((i) => i.role === 'SELLER').length;

  return (
    <section id="nearby" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-800/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/3 w-[36rem] h-[36rem] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* 1. SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                Hyperlocal Proximity Radar (1–2 km Radius)
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Nearby Admin Repairs &amp; Seller Accessories
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time catalog displaying products and exclusive repair offers from certified{' '}
              <strong className="text-amber-400">Repair Center Admins</strong> and partner{' '}
              <strong className="text-emerald-400">Accessory Sellers</strong> whose shops are strictly within{' '}
              <strong className="text-white underline decoration-amber-500 decoration-2 underline-offset-4">
                1–2 km of your location
              </strong>.
            </p>
          </div>

          {/* Quick metric pill */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl shrink-0 backdrop-blur-md">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xl font-black text-amber-400">{nearbyAdminCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Deals</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xl font-black text-emerald-400">{nearbySellerCount}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seller Items</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xl font-black text-white">{filteredItems.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Within {radiusKm} km</div>
            </div>
          </div>
        </div>

        {/* 2. GEOLOCATION RADAR CONTROL BAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            
            {/* User Current Location Indicator */}
            <div className="flex items-start sm:items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Your Current Location:
                  </span>
                  {isLiveGps && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live GPS Active
                    </span>
                  )}
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2 mt-0.5">
                  <span>{locationLabel}</span>
                </div>
              </div>
            </div>

            {/* Geolocation Trigger Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleDetectLiveLocation}
                disabled={gpsLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Detecting GPS...' : 'Use My Live GPS'}</span>
              </button>

              {/* Demo Location Selector */}
              <div className="relative">
                <select
                  value={selectedPresetId}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="" disabled>Select Demo Location</option>
                  {LOCATION_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      📍 {preset.name} ({preset.city})
                    </option>
                  ))}
                  {isLiveGps && <option value="live">📍 Live GPS Coordinates</option>}
                </select>
              </div>
            </div>

          </div>

          {/* GPS Error notice if any */}
          {gpsError && (
            <div className="bg-rose-950/70 border border-rose-800 text-rose-300 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* RADIUS SELECTOR & SENSITIVITY (STRICT 1–2 KM FILTER) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            
            {/* Radius Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Geofence Radius:</span>
              </div>

              <div className="inline-flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
                {[
                  { label: '1.0 km (Tight)', value: 1.0 },
                  { label: '1.5 km (Optimal)', value: 1.5 },
                  { label: '2.0 km (Full Limit)', value: 2.0 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRadiusKm(opt.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition ${
                      radiusKm === opt.value
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-slate-400 italic">
                Only shops within <strong className="text-amber-400">{radiusKm} km</strong> are displayed.
              </span>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs self-start md:self-auto">
              <button
                type="button"
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  roleFilter === 'ALL'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Partners
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                  roleFilter === 'ADMIN'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>🛠️ Admin Shops</span>
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('SELLER')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                  roleFilter === 'SELLER'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>🏪 Sellers Only</span>
              </button>
            </div>

          </div>

          {/* Search and Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search screen repair, chargers, covers..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Type Switcher: ALL | OFFERS | PRODUCTS */}
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'ALL', label: `All Items (${itemsWithDistance.filter(i => (i.distanceKm || 0) <= radiusKm).length})` },
                { id: 'OFFERS', label: `🔥 Repair Offers (${itemsWithDistance.filter(i => i.itemType === 'OFFER' && (i.distanceKm || 0) <= radiusKm).length})` },
                { id: 'PRODUCTS', label: `🛍️ Accessories (${itemsWithDistance.filter(i => i.itemType === 'PRODUCT' && (i.distanceKm || 0) <= radiusKm).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* 3. PRODUCTS & OFFERS DISPLAY GRID */}
        <div className="space-y-6">
          
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredItems.length} verified listings</strong> within a <strong className="text-amber-400">{radiusKm} km radius</strong> of your location.
            </span>
            <span className="hidden sm:inline text-slate-500">
              Sorted by closest distance
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isAdmin = item.role === 'ADMIN';
              const isOffer = item.itemType === 'OFFER';
              const distanceText = formatDistance(item.distanceKm);

              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between group transition relative overflow-hidden backdrop-blur-md transform hover:-translate-y-1"
                >
                  {/* Subtle color highlight ribbon */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none transition opacity-30 ${
                      isAdmin ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                    }`}
                  />

                  <div className="space-y-4">
                    
                    {/* Top Row: Distance Badge & Role Pill */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Distance Pill */}
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-950 border border-slate-700 text-white shadow-inner">
                        <span className={`w-2 h-2 rounded-full ${item.distanceKm <= 1.0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        <span>{distanceText}</span>
                      </span>

                      {/* Role Badge: Admin vs Seller */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isAdmin
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isAdmin ? '🛠️ Admin Repair Center' : '🏪 Partner Seller (2%)'}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      {isOffer ? (
                        <div className="space-y-1.5">
                          <div className="inline-block px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md">
                            {item.discount_percent}% OFF DEAL
                          </div>
                          <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-amber-300 transition">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                            {item.brand} &bull; {item.category}
                          </div>
                          <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-amber-300 transition">
                            {item.name}
                          </h3>
                          <div className="flex items-baseline space-x-2 pt-1">
                            <span className="text-2xl font-black text-white">
                              ₹{Number(item.price).toLocaleString('en-IN')}
                            </span>
                            {item.originalPrice && (
                              <span className="text-xs text-slate-500 line-through">
                                ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="text-[10px] text-emerald-400 font-bold">
                              Save {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shop Identity & Physical Location Info */}
                    <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-200 truncate flex items-center gap-1.5">
                          {isAdmin ? <Wrench className="w-3.5 h-3.5 text-amber-400" /> : <Store className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{item.shop?.name}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          ⭐ {item.shop?.rating || '4.8'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-start gap-1 leading-snug">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                        <span className="truncate">{item.shop?.address}</span>
                      </div>
                    </div>

                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400 text-[11px]">
                      {isOffer ? (
                        <span className="text-amber-400 font-semibold">{item.valid_until}</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">In Stock: {item.stock} units</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActionItem(item);
                        setClaimSuccess(false);
                      }}
                      className={`px-3.5 py-2 font-bold rounded-xl text-xs transition flex items-center space-x-1 shadow-md ${
                        isAdmin
                          ? 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30'
                          : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30'
                      }`}
                    >
                      <span>{isOffer ? 'Claim Deal' : 'Reserve In Shop'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Empty State when radius is tight */}
          {filteredItems.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4 max-w-xl mx-auto shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">No Shops Found Within {radiusKm} km</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  There are currently no repair centers or accessory sellers matching your criteria within this distance limit.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRadiusKm(2.0)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg"
                >
                  Expand Radius to 2.0 km
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetChange('central')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition"
                >
                  Reset to Central Market
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 4. HYPERLOCAL DUAL-REVENUE EXPLAINER FOOTNOTE */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-extrabold text-white">
                How Hyperlocal Referral Attribution Works
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When a customer visits any nearby <strong className="text-emerald-400">Accessory Seller</strong> and needs a screen or battery repair, the seller creates a 1-click digital referral to the partner <strong className="text-amber-400">Repair Admin</strong>. Once completed, the seller automatically earns strictly <strong className="text-white">2% of the final repair bill</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/marketplace"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Full Marketplace &rarr;</span>
            </Link>
            <Link
              href="/track"
              className="px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-700 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Track Ticket ID</span>
            </Link>
          </div>
        </div>

      </div>

      {/* 5. INTERACTIVE CLAIM / CONTACT MODAL */}
      {actionItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {actionItem.role === 'ADMIN' ? 'Repair Center Admin' : 'Accessory Seller'}
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {actionItem.itemType === 'OFFER' ? actionItem.title : actionItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActionItem(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Shop Details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="font-extrabold text-white flex items-center justify-between">
                <span>{actionItem.shop?.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-800 text-[10px] font-black">
                  {formatDistance(actionItem.distanceKm)}
                </span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{actionItem.shop?.address}</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono text-slate-300">{actionItem.shop?.phone}</span>
              </div>
            </div>

            {claimSuccess ? (
              <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-4 rounded-2xl text-xs space-y-2 animate-in fade-in">
                <div className="font-bold flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pass Generated Successfully!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Show this pass at <strong className="text-white">{actionItem.shop?.name}</strong> located {formatDistance(actionItem.distanceKm)} from you to claim this offer directly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActionItem(null)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {actionItem.itemType === 'OFFER'
                    ? 'Lock in this promotional repair deal with zero upfront payment. Claiming generates an instant digital pass valid at the shop counter.'
                    : 'Reserve this item at the store for walk-in pickup within 24 hours.'}
                </p>

                <div className="flex gap-2">
                  <a
                    href={`tel:${actionItem.shop?.phone}`}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Call Shop</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setClaimSuccess(true)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{actionItem.itemType === 'OFFER' ? 'Claim Offer Pass' : 'Reserve Item'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
}

