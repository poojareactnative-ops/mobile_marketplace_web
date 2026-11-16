'use client';

import React, { useState } from 'react';
import {
  Store, UserPlus, AlertCircle, CheckCircle2, ShieldCheck,
  Phone, Mail, Percent, ArrowRight
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

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
      const created = await onSellerCreated({
        ...form,
        isVerified: true,
        verificationStatus: 'ACTIVE',
      });

      // Post audit notification alert
      notificationService.addNotificationAlert({
        type: 'PARTNER_VERIFIED',
        title: 'New Partner Store Registered',
        message: `Store "${form.shopName || form.name}" (${form.phone || form.email}) successfully partnered with ${adminUser?.shopName || 'Admin Hub'}.`,
        timestamp: new Date().toISOString(),
      });

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
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to onboard seller');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Onboard Partner Accessory Store</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a mobile shop partner under {adminUser?.shopName || 'your workshop'} (2% Referral Model)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Partner Store Onboarded Successfully!</span>
            </div>
            <p className="text-slate-300">
              Store <strong>{success.shopName || success.name}</strong> ({success.email}) is now active. They can log in with their credentials at /login.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Store / Shop Name</label>
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
              <label className="block font-bold text-slate-300 mb-1">Owner / Contact Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rahul Verma"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Login Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="partner@store.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Store Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Initial Login Password</span>
              <span className="text-[10px] text-slate-400">Seller can reset this upon login</span>
            </label>
            <input
              type="text"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Seller@123"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Business rule reminder */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span>Partner Agreement</span>
            </div>
            <div>&bull; Partner earns strictly 2% referral fee on completed jobs.</div>
            <div>&bull; Partner can immediately log in at <code className="text-white">/login</code> to track jobs and manage stock.</div>
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
              className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5 transition disabled:opacity-50"
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
