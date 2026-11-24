'use client';

import React, { useRef } from 'react';
import { 
  X, Printer, ShieldCheck, CheckCircle2, QrCode, Smartphone, 
  Calendar, User, Store, Award, Download, Share2
} from 'lucide-react';

export default function InvoiceWarrantyModal({ isOpen, onClose, job }) {
  const printRef = useRef(null);

  if (!isOpen || !job) return null;

  const repairDate = job.created_at ? new Date(job.created_at) : new Date();
  const completedDate = job.updated_at ? new Date(job.updated_at) : new Date();
  
  // Calculate 60-Day Warranty Expiry
  const warrantyExpiryDate = new Date(completedDate);
  warrantyExpiryDate.setDate(warrantyExpiryDate.getDate() + 60);

  const finalAmount = Number(job.final_amount || job.estimated_cost || 0);
  const taxRate = 0.18; // 18% GST (standard Indian electronics tax)
  const baseAmount = Math.round((finalAmount / (1 + taxRate)) * 100) / 100;
  const gstAmount = Math.round((finalAmount - baseAmount) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount / 2) * 100) / 100;

  const invoiceNumber = `INV-${job.ticket_id || '0000'}`;
  const warrantyNumber = `WRN-${job.ticket_id ? job.ticket_id.replace('REP-', '') : '0000'}-${completedDate.getFullYear()}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window === 'undefined' || !job.customer_phone) return;
    const phone = job.customer_phone.replace(/\D/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
    const text = `Hello ${job.customer_name}! Your device (${job.device_brand} ${job.device_model}) repair is completed at SmartFix Hub.
Ticket: ${job.ticket_id}
Bill Amount: ₹${finalAmount}
Warranty: 60-Day SmartFix Warranty (Valid till ${warrantyExpiryDate.toLocaleDateString('en-IN')})
Track & Verify: ${window.location.origin}/track?ticket=${job.ticket_id}`;
    
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        
        {/* Top Control Bar (Screen Only - Hidden in Print) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-black tracking-wide">
              Official Tax Invoice &amp; 60-Day Warranty Certificate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
              title="Share invoice summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow"
              title="Print document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE & WARRANTY BODY */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 text-slate-800 font-sans">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow">
                  S
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">SmartFix Hub</h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {job.shop_name || 'Authorized Mobile Repair Network Center'}
              </p>
              <p className="text-[11px] text-slate-400">
                GSTIN: 27AABCS1429B1Z8 &bull; Verified Hyperlocal Workshop
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="inline-block px-2.5 py-1 rounded bg-slate-100 font-mono font-bold text-slate-800">
                {invoiceNumber}
              </div>
              <div className="text-[11px] text-slate-500">
                Date: {completedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold uppercase">
                Payment Status: Fully Settled
              </div>
            </div>
          </div>

          {/* Customer & Device Meta Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Details</div>
              <div className="font-bold text-slate-900 mt-0.5">{job.customer_name}</div>
              <div className="text-slate-600 font-mono">{job.customer_phone}</div>
              {job.seller_name && (
                <div className="text-[11px] text-purple-600 font-semibold mt-1">
                  Partner Referral: {job.seller_name}
                </div>
              )}
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device &amp; Ticket Info</div>
              <div className="font-bold text-slate-900 mt-0.5">{job.device_brand} {job.device_model}</div>
              <div className="text-slate-600 font-mono font-bold">Ticket: {job.ticket_id}</div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                Issue: {job.problem_description}
              </div>
            </div>
          </div>

          {/* Itemized Service Bill Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Service &amp; Genuine Component Replacement</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">
                      Hardware Component Replacement &amp; Diagnostics
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {job.problem_description} &bull; OEM Grade Replacement
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">18% GST</td>
                  <td className="py-3 px-3 text-right font-mono font-bold">₹{baseAmount.toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 text-xs border-t border-slate-200">
                <tr>
                  <td colSpan="2" className="py-1.5 px-3 text-right text-slate-500">Subtotal:</td>
                  <td className="py-1.5 px-3 text-right font-mono">₹{baseAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="py-1.5 px-3 text-right text-slate-500">CGST (9%):</td>
                  <td className="py-1.5 px-3 text-right font-mono">₹{cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="py-1.5 px-3 text-right text-slate-500">SGST (9%):</td>
                  <td className="py-1.5 px-3 text-right font-mono">₹{sgst.toFixed(2)}</td>
                </tr>
                <tr className="border-t border-slate-300 font-black text-slate-900 text-sm">
                  <td colSpan="2" className="py-2.5 px-3 text-right">Total Final Bill:</td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-700">
                    ₹{finalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 60-DAY DIGITAL WARRANTY CERTIFICATE */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-emerald-500/10 border-2 border-amber-500/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 font-black text-[10px] uppercase tracking-wider border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SmartFix 60-Day Limited Warranty</span>
                </div>
                
                <h3 className="text-base font-black text-slate-900">
                  Hardware &amp; Repair Quality Guarantee
                </h3>
                
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  This device repair is guaranteed against component defects and touch issues for <strong>60 days</strong> from the completion date. If any installed component fails under normal usage, visit the workshop for a zero-cost replacement.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Warranty Code:</span>
                    <strong className="text-slate-900">{warrantyNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Valid Until:</span>
                    <strong className="text-emerald-700">
                      {warrantyExpiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </strong>
                  </div>
                </div>
              </div>

              {/* QR Verification Seal */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-sm shrink-0 self-center sm:self-auto">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center p-1 mx-auto">
                  <QrCode className="w-10 h-10 text-white" />
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                  Scan to Verify
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between gap-1">
              <span>* Excludes accidental liquid ingress, severe physical drops, or unauthorized opening.</span>
              <span className="font-semibold text-slate-700">SmartFix Trust Protocol &bull; ISO-9001 Grade</span>
            </div>
          </div>

          {/* Footer Sign-off */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-3">
            <div>
              Thank you for trusting <strong>SmartFix Hub</strong> for your smartphone care!
            </div>
            <div className="text-center sm:text-right">
              <div className="text-slate-800 font-bold">Authorized Workshop Signature</div>
              <div className="text-[10px] text-slate-400">Digitally Verified &bull; SmartFix Platform</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
