'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { supabaseService } from '../../../services/supabaseService';
import { getProductImages, getProductImage, getWhatsAppInquiryUrl } from '../../../utils/productImages';
import {
  ArrowLeft, ShoppingBag, ShieldCheck, MapPin, Phone,
  CheckCircle2, Star, Sparkles, MessageSquare, ChevronRight,
  Share2, Store, Clock, Award, ExternalLink, Zap
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      try {
        setLoading(true);
        // Fetch specific product with seller/shop metadata
        const data = await supabaseService.getProductById(productId);
        if (data) {
          setProduct(data);
          // Fetch related products
          const all = await supabaseService.getProducts({ category: data.category });
          setRelatedProducts(all.filter((p) => p.id !== data.id).slice(0, 4));
        } else {
          // Fallback search in all products
          const all = await supabaseService.getProducts();
          const match = all.find((p) => String(p.id) === String(productId));
          if (match) {
            setProduct(match);
            setRelatedProducts(all.filter((p) => p.id !== match.id).slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading verified product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-slate-400 dark:text-slate-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Product Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This item may have been sold out or unlisted by the partner store.
          </p>
          <div className="pt-2">
            <Link
              href="/#marketplace"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition inline-flex items-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const sellerPhone = product.seller_phone || product.seller?.phone || product.phone || '9845011223';
  const rawSellerName = product.seller?.name || product.seller_name || product.uploader_name || 'Verified Accessory Store';
  const cleanSellerName = rawSellerName.toLowerCase().includes('admin') || rawSellerName.toLowerCase().includes('repair hub')
    ? 'Verified Accessory Store'
    : rawSellerName;
  const sellerAddress = product.seller?.address || product.shop?.address || 'Local Partner Store';

  const whatsappUrl = getWhatsAppInquiryUrl({
    phone: sellerPhone,
    productName: product.name,
    price: product.price,
    shopName: cleanSellerName,
    brand: product.brand,
  });

  const estimatedMrp = Math.round(Number(product.price || 0) * 1.3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-10 flex-1">

        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-2 text-xs overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400 shrink-0">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <Link href="/#marketplace" className="hover:text-slate-900 dark:hover:text-white transition">Marketplace</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{product.category || 'Accessories'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0 hidden sm:inline" />
            <span className="text-slate-800 dark:text-slate-200 truncate hidden sm:inline">{product.name}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
            <Link
              href="/#marketplace"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>

        {/* Product Showcase Hero: 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: High-Res Product Image & Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {(() => {
              const allImages = getProductImages(product);
              const currentImage = allImages[activeImageIndex] || allImages[0];
              return (
                <div className="space-y-3">
                  {/* Main Featured Photo */}
                  <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-lg dark:shadow-2xl group">
                    <img
                      src={currentImage}
                      alt={`${product.name} - Photo ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-amber-500/30 shadow-sm dark:shadow-lg">
                        {product.category || 'Accessories'}
                      </span>
                      {product.brand && (
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 w-fit shadow-xs">
                          Brand: {product.brand}
                        </span>
                      )}
                    </div>

                    {/* Photo Counter */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                        <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/90 dark:bg-slate-950/85 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-lg">
                          {activeImageIndex + 1} / {allImages.length}
                        </span>
                      </div>
                    )}

                    {/* Verified Genuine Badge */}
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                      <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-xl backdrop-blur-md">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Verified Genuine</span>
                      </span>
                    </div>
                  </div>

                  {/* Multiple Images Interactive Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                      {allImages.map((imgUrl, idx) => {
                        const isSelected = activeImageIndex === idx;
                        return (
                          <button
                            key={`${imgUrl}-${idx}`}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${isSelected
                                ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-lg scale-105'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
                              }`}
                            title={`View image ${idx + 1}`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${product.name} thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white dark:ring-slate-950" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

          </div>

          {/* Right Column: Pricing, WhatsApp CTA & Seller Info */}
          <div className="lg:col-span-5 space-y-6">

            {/* Title & Brand */}
            <div className="space-y-2">
              {product.brand && (
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{product.brand} Official Accessory</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description || `Original high-grade mobile accessory backed by local partner store warranty. Available for immediate walk-in purchase or hyperlocal home delivery.`}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-xl">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  ₹{Number(product.price || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                  ₹{estimatedMrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Save ₹{(estimatedMrp - Number(product.price || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>In Stock: {product.stock || 12} units</span>
                </div>
                <span>&bull;</span>
                <span className="text-slate-500 dark:text-slate-400">Inclusive of all local taxes</span>
              </div>
            </div>

            {/* ACTION BUTTONS: WHATSAPP DIRECT CHAT */}
            <div className="space-y-3 pt-2">

              {/* PRIMARY CTA: Direct WhatsApp Inquiry */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all group"
              >
                {/* Official WhatsApp SVG Icon */}
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Chat &amp; Inquire on WhatsApp</span>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Verified Seller Store Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                  <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{cleanSellerName}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                  Verified Seller Store
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="font-mono text-slate-700 dark:text-slate-300">{sellerPhone}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products from this Category */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">More in {product.category || 'Accessories'}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Explore more products from verified nearby sellers</p>
              </div>
              <Link
                href="/#marketplace"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => {
                const relImg = getProductImage(rel);
                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between group shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                        <img
                          src={relImg}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 truncate">{rel.brand || rel.category}</div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
                        {rel.name}
                      </h4>
                    </div>
                    <div className="pt-2 font-black text-sm text-slate-900 dark:text-white">
                      ₹{Number(rel.price || 0).toLocaleString('en-IN')}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
