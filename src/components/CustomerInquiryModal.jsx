'use client';

import React, { useState } from 'react';
import { 
  X, MessageSquare, Phone, Send, CheckCircle2, 
  Store, Wrench, MapPin, Tag, ShoppingBag, ExternalLink, Sparkles
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

export default function CustomerInquiryModal({ isOpen, onClose, item }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const isAdmin = item.role === 'ADMIN' || item.uploader_role === 'ADMIN';
  const isOffer = item.itemType === 'OFFER' || !!item.discount_percent;
  const shopName = item.shop?.name || item.shop_name || item.uploader_name || (isAdmin ? 'Repair Center Admin' : 'Accessory Store');
  const shopPhone = item.shop?.phone || '+91 98450 11223';
  const shopAddress = item.shop?.address || 'Local Marketplace Hub';
  const itemTitle = item.title || item.name || 'Product / Offer';

  // Format WhatsApp Link
  const cleanPhone = shopPhone.replace(/[^0-9]/g, '');
  const whatsappText = encodeURIComponent(
    `Hello ${shopName}! I saw your listing "${itemTitle}" on SmartFix Hub. I would like to inquire about its availability and pricing. My name is ${customerName || 'a customer'}.`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${whatsappText}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide your name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await supabaseService.submitCustomerInquiry({
        itemType: isOffer ? 'OFFER' : 'PRODUCT',
        itemId: item.id,
        itemTitle,
        shopId: item.shopId || item.shop?.id || null,
        shopName,
        ownerRole: isAdmin ? 'ADMIN' : 'SELLER',
        customerName,
        customerPhone,
        message: message || (isOffer ? 'Inquiring about this repair offer' : 'Inquiring about accessory stock'),
      });

      setSubmitted(true);
    } catch (err) {
      setError('Failed to send query: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setCustomerName('');
    setCustomerPhone('');
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Direct Shop Inquiry &bull; No Login Required</span>
            </div>
            <h3 className="text-lg font-black text-white">
              Contact Shop Owner
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
              isAdmin
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
            }`}>
              {isAdmin ? '🛠️ Repair Admin Center' : '🏪 Accessory Seller Partner'}
            </span>
            {isOffer && (
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                {item.discount_percent}% OFF
              </span>
            )}
            {!isOffer && item.price && (
              <span className="text-sm font-black text-white">
                ₹{Number(item.price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="text-sm font-black text-white leading-snug">
            {itemTitle}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              {isAdmin ? <Wrench className="w-3.5 h-3.5 text-amber-400" /> : <Store className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{shopName}</span>
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span className="truncate max-w-[180px]">{shopAddress}</span>
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-5 rounded-2xl text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Query Sent to {shopName}!</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Thank you, <strong className="text-white">{customerName}</strong>. Your query has been delivered directly to the shop owner at <strong className="text-white">{customerPhone}</strong>. They will respond shortly.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {error && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-300 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Your Mobile / WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Your Question / Message</label>
              <textarea
                rows="2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isOffer ? 'e.g. Is this offer valid if I bring my phone today afternoon?' : 'e.g. Do you have this in stock for immediate walk-in pickup?'}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sending Query...' : 'Send Query to Shop'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5 shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${shopPhone}`}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center shrink-0"
                title="Call Shop"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>

            <p className="text-[10px] text-slate-500 text-center pt-1">
              🔒 No account needed. Your inquiry is delivered directly to the store manager.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}

