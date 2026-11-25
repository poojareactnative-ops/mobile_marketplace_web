'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Smartphone, Sparkles } from 'lucide-react';
import { validateUpiId, POPULAR_UPI_HANDLES } from '../utils/upiValidation';

export default function AdminPayCommissionModal({ isOpen, onClose, commission, onPaid }) {
  const [upiId, setUpiId] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiTouched, setUpiTouched] = useState(false);

  useEffect(() => {
    if (commission?.seller_upi) {
      setUpiId(commission.seller_upi);
    } else {
      setUpiId('');
    }
    setPaymentRef('');
    setError('');
    setUpiTouched(false);
  }, [commission, isOpen]);

  if (!isOpen || !commission) return null;

  const upiValidation = validateUpiId(upiId);
  const isUpiValid = upiId ? upiValidation.isValid : true; // optional if only recording reference, but if entered must be valid

  const handleHandleClick = (handle) => {
    const base = upiId.includes('@') ? upiId.split('@')[0] : upiId.trim();
    if (base) {
      setUpiId(`${base}${handle}`);
      setUpiTouched(true);
    }
  };

  const handleAutoGenerateRef = () => {
    setPaymentRef(`UPI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (upiId && !upiValidation.isValid) {
      setUpiTouched(true);
      setError(upiValidation.error || 'Please enter a valid UPI ID');
      return;
    }

    const ref = paymentRef.trim() || (upiId ? `${upiValidation.normalized} / UPI-${Math.floor(100000 + Math.random() * 900000)}` : `UPI-${Math.floor(100000 + Math.random() * 900000)}`);

    try {
      setLoading(true);
      setError('');
      await onPaid(commission.id, ref);
      setPaymentRef('');
      setUpiId('');
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

          {/* UPI ID verification */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Seller UPI ID
              </label>
              {upiId && upiTouched && upiValidation.isValid && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid Format
                </span>
              )}
            </div>
            <input
              type="text"
              value={upiId}
              onChange={(e) => {
                setUpiId(e.target.value.trim());
                setUpiTouched(true);
              }}
              placeholder="e.g. 9876543210@paytm or seller@okaxis"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-xs text-white font-mono focus:outline-none transition ${
                upiId && upiTouched && !upiValidation.isValid
                  ? 'border-rose-500 focus:border-rose-400'
                  : upiId && upiValidation.isValid
                  ? 'border-emerald-500/80 focus:border-emerald-400'
                  : 'border-slate-700 focus:border-emerald-500'
              }`}
            />
            {upiId && upiTouched && !upiValidation.isValid && (
              <p className="text-[11px] text-rose-400 font-medium">
                {upiValidation.error}
              </p>
            )}
            {/* Quick Handle Chips */}
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              <span className="text-[10px] text-slate-500 mr-1">Handle:</span>
              {POPULAR_UPI_HANDLES.slice(0, 4).map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => handleHandleClick(handle)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  {handle}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">Settlement Reference / UTR</label>
              <button
                type="button"
                onClick={handleAutoGenerateRef}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Auto-generate
              </button>
            </div>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI-9876543210 (or click Auto-generate)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (upiId ? !upiValidation.isValid : false)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5 disabled:opacity-50"
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
