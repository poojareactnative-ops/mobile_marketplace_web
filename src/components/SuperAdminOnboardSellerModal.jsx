'use client';

import React, { useState, useEffect } from 'react';
import { Store, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

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
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to onboard seller under admin');
    } finally {
      setLoading(false);
    }
  };

  const selectedAdmin = admins.find((a) => a.id === form.selectedAdminId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans relative">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-white">Onboard Seller Under Admin</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign a mobile accessory seller directly to an authorized Repair Shop Admin.
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
            <span>Seller successfully onboarded under {selectedAdmin?.shopName || 'Admin'}!</span>
          </div>
        )}

        {/* Governance Notice Banner */}
        <div className="bg-purple-950/20 p-3 rounded-2xl border border-purple-500/30 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Attribution &amp; 2% Commission Rule</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            All repair jobs referred by this seller will be dispatched directly to the selected Admin&apos;s repair workshop. The Admin will oversee diagnosis, complete repairs, and settle the 2% referral fee.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Target Admin Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Select Assigned Repair Shop Admin <span className="text-rose-400">*</span>
            </label>
            {loadingAdmins ? (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 flex items-center gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Loading registered repair shop admins...</span>
              </div>
            ) : admins.length === 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                No registered Repair Shop Admins found. Register an Admin first.
              </div>
            ) : (
              <select
                required
                value={form.selectedAdminId}
                onChange={(e) => setForm({ ...form, selectedAdminId: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              >
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} &bull; {admin.shopName} ({admin.email})
                  </option>
                ))}
              </select>
            )}
            {selectedAdmin && (
              <p className="text-[10px] text-slate-400 mt-1">
                Assigned Hub: <strong className="text-purple-300">{selectedAdmin.shopName}</strong> &bull; Contact: {selectedAdmin.phone || selectedAdmin.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Full Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Accessory Store Name</label>
              <input
                type="text"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                placeholder="e.g. Balaji Mobile Accessories"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Login Email <span className="text-rose-400">*</span></label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seller@example.com"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Default Password</label>
            <input
              type="text"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Default password provided to seller for login on /login.</p>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || admins.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black shadow-lg shadow-purple-900/30 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Onboarding Seller...' : 'Create Seller Under Admin'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

