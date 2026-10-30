'use client';

import React, { useState } from 'react';
import { Store, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminOnboardSellerModal({ isOpen, onClose, onSellerCreated, adminUser }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    shopName: '',
    password: 'Seller@123',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please provide seller full name and email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const created = await onSellerCreated(form);
      setSuccess(created);
      setTimeout(() => {
        setSuccess(null);
        setForm({
          name: '',
          email: '',
          phone: '',
          shopName: '',
          password: 'Seller@123',
        });
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to onboard seller');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Onboard New Accessory Seller Partner</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a mobile accessory shop to refer repair walk-ins for 2% commission.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Seller successfully onboarded! Credentials activated.</span>
          </div>
        )}

        {/* Business Rule Banner */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Exclusive Admin Attribution</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            This seller will be registered under your repair shop (<strong className="text-white">{adminUser?.shopName || 'Your Shop'}</strong>). 
            They can log in with their email to refer customers and will strictly earn 2% on completed bills.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Seller Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rahul Gupta"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Login Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seller@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Accessory Store Name</label>
            <input
              type="text"
              required
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              placeholder="e.g. Rahul Mobile &amp; Accessories"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Initial Login Password</label>
            <input
              type="text"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password for seller"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">Share this password with the seller so they can log in at /login.</span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!success}
              className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Onboarding Seller...' : 'Register Partner Seller'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

