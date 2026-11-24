'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminPayCommissionModal({ isOpen, onClose, commission, onPaid }) {
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !commission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ref = paymentRef.trim() || `UPI-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      setLoading(true);
      setError('');
      await onPaid(commission.id, ref);
      setPaymentRef('');
      onClose();
    } catch (err) {
      setError(err.message || 'Payment recording failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white">Settle 2% Referral Commission</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Ticket: {commission.ticket_id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Owed 2% Commission</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">₹{commission.commission_amount}</div>
            <div className="text-xs text-slate-400 mt-1">
              Beneficiary: <strong className="text-white">{commission.seller_name || 'Partner Seller'}</strong>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Final repair bill was: ₹{commission.final_repair_amount}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Settlement Reference / UPI ID</label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI-9876543210 (leave empty to auto-generate)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Recording...' : 'Record Payment As Paid'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
