'use client';

import React, { useState, useEffect } from 'react';
import {
  Store, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw,
  Phone, Mail, Percent, Building2
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { notificationService } from '../services/notificationService';

export default function SuperAdminOnboardSellerModal({ isOpen, onClose, onSellerCreated, superAdminUser }) {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [form, setForm] = useState({
    selectedAdminId: '',
    name: '',
    email: '',
    phone: '',
    shopName: '',
    password: 'Seller@123',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingAdmins(true);
      supabaseService.getAllAdmins()
        .then((data) => {
          setAdmins(data || []);
          if (data && data.length > 0 && !form.selectedAdminId) {
            setForm((prev) => ({ ...prev, selectedAdminId: data[0].id }));
          }
        })
        .catch((err) => {
          console.error('Failed to load admins:', err);
        })
        .finally(() => {
          setLoadingAdmins(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.selectedAdminId) {
      setError('Please select an assigned Repair Shop Admin for this seller');
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please provide seller full name and email');
      return;
    }

    const selectedAdmin = admins.find((a) => a.id === form.selectedAdminId);

    try {
      setLoading(true);
      setError('');
      const created = await onSellerCreated({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        shopName: form.shopName.trim() || `${form.name.trim()} Accessories`,
        adminId: form.selectedAdminId,
        shopId: selectedAdmin?.shopId || null,
        password: form.password,
        isVerified: true,
        verificationStatus: 'ACTIVE',
      });

      // Post audit notification alert
      notificationService.addNotificationAlert({
        type: 'PARTNER_VERIFIED',
        title: 'New Partner Store Registered by Super Admin',
        message: `Store "${form.shopName || form.name}" (${form.phone || form.email}) assigned to admin "${selectedAdmin?.shopName || selectedAdmin?.name || 'Admin Hub'}".`,
        timestamp: new Date().toISOString(),
      });

      setSuccess(created);
      setTimeout(() => {
        setSuccess(null);
        setForm({
          selectedAdminId: admins[0]?.id || '',
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

  const selectedAdmin = admins.find((a) => a.id === form.selectedAdminId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Super Admin Onboard Partner Store</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                  PLATFORM ROOT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign an accessory store partner directly under any registered Repair Shop Admin
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
              Store <strong>{success.shopName || success.name}</strong> ({success.email}) is active and assigned to <strong>{selectedAdmin?.shopName || 'Workshop Admin'}</strong>.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Target Repair Shop Admin Selector */}
          <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-3.5 space-y-2">
            <label className="block font-bold text-purple-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Assign to Repair Shop Admin (Hub Owner)</span>
              </span>
              <span className="text-[10px] text-purple-400 font-mono">
                {admins.length} Available Admins
              </span>
            </label>

            {loadingAdmins ? (
              <div className="p-3 text-slate-400 flex items-center gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Loading repair shops list...</span>
              </div>
            ) : admins.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs">
                No repair shop admins found. Please register an admin first.
              </div>
            ) : (
              <select
                required
                value={form.selectedAdminId}
                onChange={(e) => setForm({ ...form, selectedAdminId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/40 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
              >
                {admins.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    {adm.shopName || `${adm.name}'s Workshop`} &mdash; Owner: {adm.name} ({adm.email})
                  </option>
                ))}
              </select>
            )}

            {selectedAdmin && (
              <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                <span>Shop ID: <strong className="text-white font-mono">{selectedAdmin.shopId || 'N/A'}</strong></span>
                <span>&bull;</span>
                <span>Phone: <strong className="text-white">{selectedAdmin.phone || '—'}</strong></span>
              </div>
            )}
          </div>

          {/* Store Name & Contact Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Store / Shop Name</label>
              <input
                type="text"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                placeholder="e.g. Radhika Mobile World"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Owner / Contact Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Radhika Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Login Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="partner@store.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Store Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Initial Password */}
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
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Policy */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-purple-400" />
              <span>Platform Policy: 2% Referral Commission</span>
            </div>
            <div>&bull; Store partner refers customers for repair jobs to the assigned shop admin.</div>
            <div>&bull; Partner earns strictly 2% referral commission upon successful repair completion.</div>
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
              disabled={loading || !form.selectedAdminId || !!success}
              className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Onboarding Partner...' : 'Onboard Partner Seller'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
