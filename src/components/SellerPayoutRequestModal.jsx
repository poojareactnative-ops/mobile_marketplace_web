'use client';

import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, IndianRupee, Smartphone, Building2 } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

export default function SellerPayoutRequestModal({
  isOpen,
  onClose,
  pendingBalance = 0,
  sellerUser,
  onSuccess,
}) {
  const [amount, setAmount] = useState(pendingBalance || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'BANK'
  const [upiId, setUpiId] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reqAmount = Number(amount);
    if (!reqAmount || reqAmount <= 0) {
      setError('Please enter a valid payout amount.');
      return;
    }
    if (reqAmount > pendingBalance) {
      setError(`Requested amount (₹${reqAmount}) exceeds your available pending balance (₹${pendingBalance}).`);
      return;
    }
    if (paymentMethod === 'UPI' && !upiId.trim()) {
      setError('Please enter your UPI ID (e.g. yourname@okaxis or phone@paytm).');
      return;
    }
    if (paymentMethod === 'BANK' && (!bankAccountNo.trim() || !bankIfsc.trim())) {
      setError('Please provide both Account Number and IFSC Code for Bank Transfer.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await supabaseService.requestPayout({
        sellerId: sellerUser?.id,
        sellerName: sellerUser?.shopName || sellerUser?.name || 'Partner Seller',
        shopId: sellerUser?.shopId || null,
        adminId: sellerUser?.adminId || null,
        amount: reqAmount,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId.trim() : null,
        bankAccountNo: paymentMethod === 'BANK' ? bankAccountNo.trim() : null,
        bankIfsc: paymentMethod === 'BANK' ? bankIfsc.trim().toUpperCase() : null,
      });

      setSubmitted(true);
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit payout request.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Request Referral Payout</h3>
              <p className="text-[11px] text-slate-400">Withdraw your accrued 2% commissions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">Payout Request Submitted!</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Your request for <strong className="text-emerald-400">₹{amount}</strong> has been dispatched to your partner Repair Workshop Admin. You will receive an alert once settled.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Available Balance Box */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Withdrawable Balance</span>
                <div className="text-xl font-black text-emerald-400 mt-0.5">
                  ₹{Number(pendingBalance).toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAmount(pendingBalance)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-500/25 transition"
              >
                Withdraw Max
              </button>
            </div>

            {/* Payout Amount Input */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Withdrawal Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                max={pendingBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Payout Destination</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                    paymentMethod === 'UPI'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div>Instant UPI</div>
                    <div className="text-[9px] text-slate-500 font-normal">GPay, PhonePe, Paytm</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold transition text-left ${
                    paymentMethod === 'BANK'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <div>Bank Account</div>
                    <div className="text-[9px] text-slate-500 font-normal">Direct NEFT/IMPS</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'UPI' ? (
              <div>
                <label className="block font-bold text-slate-300 mb-1">Your UPI ID / VPA</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobileaccessories@okaxis"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    placeholder="Enter Bank Account Number"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-slate-400 hover:text-white font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || pendingBalance <= 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
