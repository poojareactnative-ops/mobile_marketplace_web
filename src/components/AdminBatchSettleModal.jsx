'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Smartphone,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { validateUpiId, POPULAR_UPI_HANDLES } from '../utils/upiValidation';

export default function AdminBatchSettleModal({
  isOpen,
  onClose,
  seller,
  pendingCommissions = [],
  onBatchPaid,
  adminUser,
}) {
  const [upiId, setUpiId] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [showTicketsList, setShowTicketsList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiTouched, setUpiTouched] = useState(false);

  // Set default UPI ID from seller if available
  useEffect(() => {
    if (seller?.upi_id || seller?.upi) {
      setUpiId(seller.upi_id || seller.upi);
    } else if (seller?.phone) {
      // Suggest clean 10-digit phone
      const cleanPhone = String(seller.phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        setUpiId(`${cleanPhone}@paytm`);
      } else {
        setUpiId('');
      }
    } else {
      setUpiId('');
    }
    setPaymentRef('');
    setError('');
    setUpiTouched(false);
  }, [seller, isOpen]);

  if (!isOpen || !seller) return null;

  const totalAmount = pendingCommissions.reduce(
    (sum, c) => sum + Number(c.commission_amount || 0),
    0
  );
  const totalVolume = pendingCommissions.reduce(
    (sum, c) => sum + Number(c.final_repair_amount || 0),
    0
  );

  const upiValidation = validateUpiId(upiId);
  const isUpiValid = upiValidation.isValid;

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
    setUpiTouched(true);

    if (!isUpiValid) {
      setError(upiValidation.error || 'Please enter a valid UPI ID');
      return;
    }

    if (pendingCommissions.length === 0 || totalAmount <= 0) {
      setError('No pending commission amounts to settle for this seller.');
      return;
    }

    const ref = paymentRef.trim() || `UPI-BATCH-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      setLoading(true);
      setError('');
      await onBatchPaid({
        sellerId: seller.id,
        seller,
        commissionIds: pendingCommissions.map((c) => c.id),
        paymentReference: ref,
        upiId: upiValidation.normalized,
        adminUser,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Batch settlement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-white">
                1-Click Batch Settle 2% Balance
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Beneficiary: <strong className="text-white">{seller.shop_name || seller.name}</strong> ({seller.name})
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Balance Highlight Banner */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Total Accumulated 2% Commission
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              {pendingCommissions.length} Ticket{pendingCommissions.length === 1 ? '' : 's'} Ready
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Total referred repairs volume: ₹{totalVolume.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTicketsList(!showTicketsList)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-xl transition"
            >
              <span>{showTicketsList ? 'Hide Tickets' : 'View Tickets'}</span>
              {showTicketsList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Tickets Details */}
          {showTicketsList && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {pendingCommissions.map((comm) => (
                <div
                  key={comm.id}
                  className="flex items-center justify-between text-[11px] bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800"
                >
                  <span className="font-mono font-bold text-amber-400">
                    {comm.ticket_id}
                  </span>
                  <span className="text-slate-400">
                    Bill: ₹{Number(comm.final_repair_amount).toLocaleString('en-IN')}
                  </span>
                  <span className="font-bold text-emerald-400">
                    +₹{Number(comm.commission_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settlement Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* UPI Virtual Payment Address Input with Validation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Seller UPI ID (VPA)
              </label>
              {upiTouched && isUpiValid && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid Format
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value.trim());
                  setUpiTouched(true);
                }}
                placeholder="e.g. 9876543210@paytm or partner@okaxis"
                className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none transition ${
                  upiTouched && !isUpiValid
                    ? 'border-rose-500 focus:border-rose-400'
                    : isUpiValid
                    ? 'border-emerald-500/80 focus:border-emerald-400'
                    : 'border-slate-700 focus:border-emerald-500'
                }`}
              />
            </div>

            {upiTouched && !isUpiValid && (
              <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{upiValidation.error}</span>
              </p>
            )}

            {/* Quick Handle Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500 font-semibold mr-1">Quick handle:</span>
              {POPULAR_UPI_HANDLES.slice(0, 5).map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => handleHandleClick(handle)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  {handle}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Reference / UTR Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Payment Ref / Bank UTR / Transaction No.
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateRef}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                Auto-generate Ref
              </button>
            </div>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI-9876543210 or 324128912301"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">
              Transfer ₹{totalAmount} to <span className="text-slate-300 font-mono">{upiId || 'seller UPI'}</span> via your UPI app (GPay, PhonePe, Paytm), then paste the reference here or click auto-generate.
            </p>
          </div>

          {/* Footer CTA Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isUpiValid || totalAmount <= 0}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {loading
                  ? 'Settling Batch...'
                  : `Batch Settle ₹${totalAmount.toLocaleString('en-IN')} (1 Click)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
