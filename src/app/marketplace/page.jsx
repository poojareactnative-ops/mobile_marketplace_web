'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { supabaseService } from '../../services/supabaseService';
import {
  ShoppingBag, Tag, Plus, Search, Filter, Wrench, Store,
  Sparkles, Trash2, CheckCircle2, ArrowRight, Clock, ShieldCheck
} from 'lucide-react';
import MultiImageUploader from '../../components/MultiImageUploader';
import { getProductImages, getProductImage, getWhatsAppInquiryUrl, POPULAR_PRESET_IMAGES } from '../../utils/productImages';

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

  const [products, setProducts] = useState([]);
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
    image_url: '',
    images: [],
    sellerPhone: '',
    description: '',
  });

  const [actionLoading, setActionLoading] = useState(false);

  // Load initial data
  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      const prods = await supabaseService.getProducts();
      setProducts(prods || []);
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
        sellerId: user?.id || null,
        shopId: user?.shopId || null,
        sellerPhone: newProduct.sellerPhone || user?.phone || null,
        uploaderName: user?.shopName || user?.name || 'Verified Store',
        uploaderRole: user?.role || 'SELLER',
      });
      setIsAddProductOpen(false);
      setNewProduct({
        name: '',
        brand: '',
        category: 'Chargers & Cables',
        price: '',
        stock: '',
        image_url: '',
        images: [],
        sellerPhone: '',
        description: '',
      });
      await loadMarketplaceData();
      alert('Product published successfully to marketplace!');
    } catch (err) {
      alert('Error adding product: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    try {
      await supabaseService.deleteProduct(productId);
      await loadMarketplaceData();
    } catch (err) {
      alert('Error: ' + err.message);
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
    setNewProduct({
      name: '',
      brand: '',
      category: 'Chargers & Cables',
      price: '',
      stock: '',
      image_url: '',
      images: [],
      sellerPhone: user?.phone || '',
      description: '',
    });
    setIsAddProductOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">

      {/* Top Navbar */}
      <Navbar />

      {/* Hero Header */}
      <section className="bg-slate-100/70 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hyperlocal Mobile Accessories &amp; Hardware</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Products Catalog
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
                Explore certified accessories, chargers, protectors, and gear uploaded by verified local accessory sellers and repair shops.
              </p>
            </div>

            {/* Quick action buttons - ONLY visible for authorized shop staff */}
            {isAuthenticated && canManage && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Upload Product</span>
                </button>
              </div>
            )}
          </div>

          {/* Search and Filters Bar */}
          <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/80">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title, brand, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-xs"
              />
            </div>

            {/* Uploader Role Filter */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-bold hidden sm:inline">Source:</span>
              <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
                <button
                  onClick={() => setUploaderFilter('ALL')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${uploaderFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setUploaderFilter('SELLER')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 ${uploaderFilter === 'SELLER'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
                    }`}
                >
                  <Store className="w-3 h-3" />
                  <span>Sellers</span>
                </button>
                <button
                  onClick={() => setUploaderFilter('ADMIN')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition flex items-center gap-1 ${uploaderFilter === 'ADMIN'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
                    }`}
                >
                  <Wrench className="w-3 h-3" />
                  <span>Admins</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Category:</span>
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">

        {/* PRODUCTS GRID */}
        <section className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Available Mobile Accessories &amp; Devices</h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{filteredProducts.length} Items Listed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const isAdmin = prod.uploader_role === 'ADMIN';
              const prodImages = getProductImages(prod);
              const coverImg = prodImages[0] || getProductImage(prod);

              return (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-4 shadow-xs dark:shadow-xl flex flex-col justify-between group transition hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Product Image Frame */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition">
                      <Link href={`/products/${prod.id}`} className="block w-full h-full relative">
                        <img
                          src={coverImg}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 dark:from-slate-950/80 via-transparent to-transparent opacity-60" />
                      </Link>

                      {/* Stock Pill */}
                      {prod.stock != null && (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/90 dark:bg-slate-950/90 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-xs">
                          {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                        </span>
                      )}

                      {/* Multi-image photo count badge */}
                      {prodImages.length > 1 && (
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-white/90 dark:bg-slate-950/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-xs flex items-center gap-1">
                          <span>📷 {prodImages.length}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${isAdmin
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                          }`}
                      >
                        {isAdmin ? 'Workshop' : 'Store'}
                      </span>
                    </div>

                    <div>
                      <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">{prod.brand}</div>
                      <Link href={`/products/${prod.id}`} className="block hover:underline">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-2 mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {prod.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{Number(prod.price || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                        ₹{Math.round(Number(prod.price || 0) * 1.25).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {prod.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[120px] text-[11px]">
                        {prod.uploader_name || 'Verified Store'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* WhatsApp Button */}
                      <a
                        href={getWhatsAppInquiryUrl({
                          phone: prod.seller_phone || prod.seller?.phone || prod.phone || prod.shop_phone,
                          productName: prod.name,
                          price: prod.price,
                          shopName: prod.uploader_name || prod.seller?.name,
                          brand: prod.brand,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1 border border-[#25D366]/30 shadow-xs"
                        title="Inquire on WhatsApp"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                        </svg>
                        <span>WhatsApp</span>
                      </a>

                      {/* View Details Link */}
                      <Link
                        href={`/products/${prod.id}`}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

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

      </main>

      {/* MODAL: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Upload New Product</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish a product with multi-image gallery stored on Supabase CDN
                </p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. 65W GaN Fast Charger Dual Port"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Brand Name</label>
                  <input
                    type="text"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. 999"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Seller WhatsApp Contact Number</label>
                <input
                  type="tel"
                  value={newProduct.sellerPhone}
                  onChange={(e) => setNewProduct({ ...newProduct, sellerPhone: e.target.value })}
                  placeholder="e.g. +91 98450 11223 (Customer queries will route directly here)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">
                  Customers who click &quot;Inquire on WhatsApp&quot; will send messages directly to this number.
                </span>
              </div>

              {/* Multi-Image Uploader Component */}
              <div className="pt-2 border-t border-slate-800">
                <MultiImageUploader
                  images={newProduct.images}
                  onChange={(imgs) => setNewProduct({
                    ...newProduct,
                    images: imgs,
                    image_url: imgs[0] || '',
                  })}
                  sellerId={user?.id || 'admin'}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Description</label>
                <textarea
                  rows="3"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe specifications, warranty, compatibility details..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
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

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-white">SmartFix Hub Marketplace</span> &mdash; Products by Verified Sellers
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
