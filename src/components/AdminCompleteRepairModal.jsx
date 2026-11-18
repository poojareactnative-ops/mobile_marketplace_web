'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminCompleteRepairModal({ isOpen, onClose, job, onCompleted }) {
  const [finalAmount, setFinalAmount] = useState(job?.final_amount || job?.estimated_cost || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const billAmount = Number(finalAmount) || 0;
  const isReferred = !!job.seller_id;
  const sellerCommission = isReferred ? Math.round(billAmount * 0.02) : 0;
  const platformFee = Math.round(billAmount * 0.01);
  const adminRemaining = billAmount - sellerCommission - platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (billAmount <= 0) {
      setError('Please enter a valid bill amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onCompleted(job.id, billAmount, notes.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete repair');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white">Complete Repair &amp; Calculate 2% Commission</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ticket: {job.ticket_id} &bull; {job.device_brand} {job.device_model}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Final Repair Bill Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-base focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Realistic 3-Way Revenue & Commission Split */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Automated 3-Way Revenue Split</span>
              <span className="text-[10px] text-purple-400 font-bold">Standard Platform Model</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Referring Partner:</span>
              <span className="font-semibold text-white">{job.seller_name || 'Direct / Walk-in Customer'}</span>
            </div>

            {isReferred && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Seller Referral Commission (2%):</span>
                <span className="font-bold text-emerald-400">₹{sellerCommission.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Super Admin Platform Commission (1%):</span>
              <span className="font-bold text-purple-400">₹{platformFee.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800">
              <span className="text-white font-bold">Workshop Net Payout ({isReferred ? '97%' : '99%'}):</span>
              <span className="font-black text-amber-400 text-sm">₹{adminRemaining.toLocaleString('en-IN')}</span>
            </div>

            <p className="text-[10px] text-slate-500 pt-1">
              {isReferred 
                ? 'The 2% referral fee will be credited to the seller wallet with status PENDING for settlement.' 
                : 'Direct customer walk-in (no seller referral fee deducted).'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Technician Notes / Replacement Parts</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Replacement parts installed, touch and display fully tested"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
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
              <span>{loading ? 'Recording...' : 'Confirm & Record Final Bill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
