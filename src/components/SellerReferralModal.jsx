'use client';

import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

export default function SellerReferralModal({ isOpen, onClose, onCreated, currentSeller }) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: '',
    deviceModel: '',
    problemDescription: '',
    estimatedCost: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      setError('Please provide customer name and phone');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onCreated({
        ...form,
        estimatedCost: Number(form.estimatedCost) || 0,
        sellerId: currentSeller?.id,
        sellerName: currentSeller?.shopName || currentSeller?.name || 'Seller Partner',
      });
      // reset form
      setForm({
        customerName: '',
        customerPhone: '',
        deviceBrand: '',
        deviceModel: '',
        problemDescription: '',
        estimatedCost: '',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white">Refer Repair Customer to Partner Repair Shop</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              You will automatically earn 2% referral commission once the repair is completed.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="e.g. Ramesh Verma"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Customer Phone</label>
              <input
                type="tel"
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Device Brand</label>
              <input
                type="text"
                required
                value={form.deviceBrand}
                onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })}
                placeholder="e.g. Apple, Samsung, Vivo"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Device Model</label>
              <input
                type="text"
                required
                value={form.deviceModel}
                onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
                placeholder="e.g. iPhone 14, S23 Ultra"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Problem Description</label>
            <textarea
              rows="2"
              required
              value={form.problemDescription}
              onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
              placeholder="Describe customer issue (e.g. broken display screen, battery drain)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Estimated Cost (₹)</label>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={form.estimatedCost}
              onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Submit Referral to Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
