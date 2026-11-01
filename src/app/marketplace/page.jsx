'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../services/supabaseService';
import { 
  ShoppingBag, Tag, Plus, Search, Filter, Wrench, Store, 
  Sparkles, Trash2, CheckCircle2, ArrowRight, Clock, ShieldCheck, MessageSquare, Percent
} from 'lucide-react';
import CustomerInquiryModal from '../../components/CustomerInquiryModal';

const CATEGORIES = [
  'All',
  'Chargers & Cables',
  'Cases & Covers',
  'Screen Protectors',
  'Power Banks',
  'Audio',
];

export default function MarketplacePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Tab State: 'PRODUCTS' or 'OFFERS'
  const [activeTab, setActiveTab] = useState('PRODUCTS');

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploaderFilter, setUploaderFilter] = useState('ALL'); // 'ALL' | 'ADMIN' | 'SELLER'

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'Chargers & Cables',
    price: '',
    stock: '',
  });

  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discountPercent: 15,
    validUntil: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [inquiryItem, setInquiryItem] = useState(null);

  // Load initial data
  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      const [prods, offs] = await Promise.all([
        supabaseService.getProducts(),
        supabaseService.getOffers(),
      ]);
      setProducts(prods || []);
      setOffers(offs || []);
    } catch (err) {
      console.error('Failed to load marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Handle Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in product name and price');
      return;
    }

    try {
      setActionLoading(true);
      await supabaseService.addProduct({
        ...newProduct,
        uploaderName: user?.shopName || user?.name || (user?.role === 'ADMIN' ? 'Repair Admin' : 'Accessory Seller'),
        uploaderRole: user?.role || 'SELLER',
      });
      setIsAddProductOpen(false);
      setNewProduct({ name: '', brand: '', category: 'Chargers & Cables', price: '', stock: '' });
      await loadMarketplaceData();
      alert('Product successfully published to marketplace!');
    } catch (err) {
      alert('Error adding product: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    try {
      await supabaseService.deleteProduct(id);
      await loadMarketplaceData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Handle Add Offer
  const handleAddOffer = async (e) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.discountPercent) {
      alert('Please provide offer title and discount percentage');
      return;
    }

    try {
      setActionLoading(true);
      await supabaseService.addOffer({
        ...newOffer,
        uploaderName: user?.shopName || user?.name || (user?.role === 'ADMIN' ? 'Repair Admin' : 'Accessory Seller'),
        uploaderRole: user?.role || 'ADMIN',
      });
      setIsAddOfferOpen(false);
      setNewOffer({ title: '', description: '', discountPercent: 15, validUntil: '' });
      await loadMarketplaceData();
      alert('Promotional offer published!');
    } catch (err) {
      alert('Error adding offer: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered products calculation
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'All' || p.category === selectedCategory;

    const matchesUploader = 
      uploaderFilter === 'ALL' || p.uploader_role === uploaderFilter;

    return matchesSearch && matchesCategory && matchesUploader;
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'SELLER' || user?.role === 'SUPER_ADMIN';

  const handleOpenAddProduct = () => {
    if (!user) {
      router.push('/login?redirect=/marketplace');
      return;
    }
    if (!canManage) {
      alert('Only registered Sellers and Admins are authorized to upload products.');
      return;
    }
    setIsAddProductOpen(true);
  };

  const handleOpenAddOffer = () => {
    if (!user) {
      router.push('/login?redirect=/marketplace');
      return;
    }
    if (!canManage) {
      alert('Only registered Sellers and Admins are authorized to publish offers.');
      return;
    }
    setIsAddOfferOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Header with Separate Tab Controls */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {activeTab === 'PRODUCTS' ? 'Hyperlocal Mobile Accessories' : 'Exclusive Repair Deals & Vouchers'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {activeTab === 'PRODUCTS' ? 'Products Catalog' : 'Promotional Offers & Deals'}
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
                {activeTab === 'PRODUCTS' 
                  ? 'Explore certified accessories and gear uploaded by verified local accessory sellers and repair shops.'
                  : 'Exclusive walking-distance repair discounts and deals posted by certified repair hub admins.'}
              </p>
            </div>

            {/* Quick action buttons - ONLY visible for authorized shop staff */}
            {isAuthenticated && canManage && (
              <div className="flex items-center gap-3">
                {activeTab === 'PRODUCTS' ? (
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Upload Product</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpenAddOffer}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/30 flex items-center space-x-1.5 transition"
                  >
                    <Tag className="w-4 h-4" />
                    <span>+ Create Offer</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Clean Segmented Tab Switcher */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-800/80">
            <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('PRODUCTS')}
                className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'PRODUCTS'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Products</span>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  activeTab === 'PRODUCTS' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('OFFERS')}
                className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeTab === 'OFFERS'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 ring-1 ring-amber-300/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Exclusive Offers</span>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  activeTab === 'OFFERS' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {offers.length}
                </span>
              </button>
            </div>

            {/* Quick Tab Summary Status */}
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Viewing {activeTab === 'PRODUCTS' ? `${filteredProducts.length} accessories` : `${offers.length} active promo deals`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container - Displays ONLY the Active Tab Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* ============================================================== */}
        {/* TAB 1: PRODUCTS ONLY                                            */}
        {/* ============================================================== */}
        {activeTab === 'PRODUCTS' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>Mobile Accessories Catalog</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtered from {products.length} products uploaded by repair shop and accessory partners.
                </p>
              </div>

              {/* Source Filter Buttons */}
              <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setUploaderFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    uploaderFilter === 'ALL' ? 'bg-white text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setUploaderFilter('ADMIN')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    uploaderFilter === 'ADMIN' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🛠️ Repair Centers
                </button>
                <button
                  onClick={() => setUploaderFilter('SELLER')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    uploaderFilter === 'SELLER' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏪 Accessory Stores
                </button>
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search Input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search accessories by name, brand..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-slate-950 shadow font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                const isAdmin = prod.uploader_role === 'ADMIN';
                return (
                  <div
                    key={prod.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between group transition hover:-translate-y-0.5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          {prod.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isAdmin
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isAdmin ? '🛠️ Certified Repair Center' : '🏪 Verified Store'}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] text-amber-400 font-semibold">{prod.brand}</div>
                        <h3 className="font-extrabold text-white text-base mt-0.5 group-hover:text-amber-300 transition">
                          {prod.name}
                        </h3>
                      </div>

                      <div className="flex items-baseline space-x-2 pt-2">
                        <span className="text-2xl font-black text-white">
                          ₹{Number(prod.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 line-through">
                          ₹{Math.round(Number(prod.price) * 1.25).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center space-x-1.5 text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>In Stock: <strong className="text-white">{prod.stock} units</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInquiryItem({ ...prod, itemType: 'PRODUCT' })}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1 border border-emerald-500/30"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Send Query</span>
                        </button>

                        {isAuthenticated && canManage && (
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-slate-500 hover:text-rose-400 transition p-1"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <div className="text-sm font-bold text-white">No products found</div>
                <p className="text-xs text-slate-400">Try adjusting your search query or category filters.</p>
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* TAB 2: EXCLUSIVE OFFERS ONLY                                    */}
        {/* ============================================================== */}
        {activeTab === 'OFFERS' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black text-white">Active Promotional Deals &amp; Discounts</h2>
              </div>
              <span className="text-xs text-slate-400">{offers.length} Active Offers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => {
                const isAdmin = offer.uploader_role === 'ADMIN';
                return (
                  <div
                    key={offer.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between group transition hover:-translate-y-0.5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs rounded-full shadow-md flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          <span>{offer.discount_percent}% OFF</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isAdmin
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isAdmin ? '🛠️ Repair Service Deal' : '🏪 Store Promotion'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-white text-lg group-hover:text-amber-300 transition">
                          {offer.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 gap-2">
                      <div className="truncate">
                        By: <strong className="text-slate-300">{offer.uploader_name || 'Shop Partner'}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInquiryItem({ ...offer, itemType: 'OFFER' })}
                          className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1 border border-amber-500/30"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Claim / Send Query</span>
                        </button>

                        {isAuthenticated && canManage && (
                          <button
                            onClick={() => supabaseService.deleteOffer(offer.id).then(loadMarketplaceData)}
                            className="text-slate-500 hover:text-rose-400 transition p-1"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {offers.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
                <Tag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <div className="text-sm font-bold text-white">No active offers available</div>
                <p className="text-xs text-slate-400">Check back later or check in-store promotions directly via WhatsApp inquiry.</p>
              </div>
            )}
          </section>
        )}

      </main>

      {/* MODAL 1: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Upload New Accessory Product</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploading as: <strong className="text-amber-400">{user?.name || 'Seller'}</strong> ({user?.role || 'SELLER'})
                </p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. 65W Fast Charger Type-C"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g. Anker / Spigen"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="999"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                >
                  {actionLoading ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD OFFER */}
      {isAddOfferOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Create Promotional Offer</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish a special discount deal for customers
                </p>
              </div>
              <button onClick={() => setIsAddOfferOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddOffer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Offer Headline</label>
                <input
                  type="text"
                  required
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  placeholder="e.g. Festival Screen Replacement Special"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description / Terms</label>
                <textarea
                  rows="2"
                  required
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  placeholder="e.g. Flat 15% off on all display replacements this week"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount %</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    value={newOffer.discountPercent}
                    onChange={(e) => setNewOffer({ ...newOffer, discountPercent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Valid Days</label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOfferOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg"
                >
                  {actionLoading ? 'Publishing...' : 'Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Inquiry Modal (Zero Login Required) */}
      <CustomerInquiryModal
        isOpen={!!inquiryItem}
        onClose={() => setInquiryItem(null)}
        item={inquiryItem}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-white">SmartFix Hub Marketplace</span> &mdash; Products &amp; Offers by Admin &amp; Sellers
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/login" className="hover:text-white transition">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
