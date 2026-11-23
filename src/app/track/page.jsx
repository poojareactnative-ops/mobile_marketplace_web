'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { supabaseService } from '../../services/supabaseService';
import { 
  Search, Wrench, Smartphone, CheckCircle2, Clock, 
  ShieldCheck, ArrowRight, Store, FileText, Award, Printer, Phone,
  Camera, ZoomIn
} from 'lucide-react';
import InvoiceWarrantyModal from '../../components/InvoiceWarrantyModal';
import ImageLightboxModal from '../../components/ImageLightboxModal';
import { getWhatsAppRepairTrackingUrl, getRepairJobImages } from '../../utils/productImages';

function TrackPageContent() {
  const searchParams = useSearchParams();
  const ticketQuery = searchParams.get('ticket');

  const [ticketInput, setTicketInput] = useState('');
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxTitle, setLightboxTitle] = useState('Device Photos');

  const runTrack = async (idToSearch) => {
    const clean = String(idToSearch || '').trim();
    if (!clean) return;
    try {
      setLoading(true);
      setError('');
      const res = await supabaseService.trackRepair(clean);
      setJob(res);
      setTicketInput(clean);
    } catch (err) {
      setJob(null);
      setError(err.message || 'Ticket not found. Please double check the ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketQuery) {
      runTrack(ticketQuery);
    }
  }, [ticketQuery]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    runTrack(ticketInput);
  };

  const getStepStatus = (status, stepIndex) => {
    const statusOrder = {
      'PENDING': 0,
      'PENDING_APPROVAL': 0,
      'ACCEPTED': 1,
      'IN_PROGRESS': 2,
      'COMPLETED': 3,
    };
    const current = statusOrder[status] || 0;
    if (current > stepIndex) return 'completed';
    if (current === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-16 space-y-8 flex-1">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20 dark:border-blue-500/30">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Public Diagnostic &amp; Bill Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Track Device Repair Ticket</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Enter your repair Ticket ID (e.g. <strong>REP-1385</strong>) to view live technician diagnostic stages, assigned repair shop, and verified bills.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrackSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-3xl flex gap-3 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="Enter Ticket ID (e.g. REP-1385)"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-blue-500 font-mono tracking-wider shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition shrink-0 transform hover:-translate-y-0.5"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching...' : 'Track Ticket'}</span>
        </button>
      </form>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 p-4 rounded-2xl text-xs animate-in fade-in">
          ⚠️ {error}
        </div>
      )}

      {/* Live Ticket Card */}
      {job && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6 animate-in fade-in zoom-in-95 text-slate-900 dark:text-white">
          
          {/* Top Bar of Ticket */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-black text-xs tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                {job.ticket_id}
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">{job.device_brand} {job.device_model}</h2>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customer: <strong className="text-slate-800 dark:text-slate-200">{job.customer_name}</strong> {job.customer_phone && `(${job.customer_phone})`}
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* WhatsApp Share Button */}
              {job.customer_phone && (
                <a
                  href={getWhatsAppRepairTrackingUrl({
                    customerPhone: job.customer_phone,
                    customerName: job.customer_name,
                    ticketId: job.ticket_id,
                    deviceBrand: job.device_brand,
                    deviceModel: job.device_model,
                    problemDescription: job.problem_description,
                    shopName: job.shop_name,
                    status: job.status,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 border border-[#25D366]/40 shadow-sm"
                  title="Send Tracking Link via WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                  </svg>
                  <span>WhatsApp Link</span>
                </a>
              )}

              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto border ${
                job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' :
                job.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10' :
                job.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[
              { title: 'Registered', icon: Clock },
              { title: 'Accepted', icon: Wrench },
              { title: 'In Repair', icon: Smartphone },
              { title: 'Completed', icon: CheckCircle2 },
            ].map((step, idx) => {
              const status = getStepStatus(job.status, idx);
              const Icon = step.icon;
              return (
                <div key={idx} className="text-center space-y-1.5">
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center border transition ${
                    status === 'completed'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : status === 'current'
                      ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className={`text-[10px] font-bold ${
                    status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    status === 'current' ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reported Issue</div>
              <div className="text-slate-900 dark:text-white font-medium">{job.problem_description}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Repair Center</div>
              <div className="text-slate-900 dark:text-white font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>{job.shop_name || 'Verified Partner Repair Center'}</span>
              </div>
            </div>
          </div>

          {/* Verified Device Intake Condition */}
          {job.notes && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/90 rounded-2xl border border-slate-200 dark:border-slate-800/90 text-xs space-y-1">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Device Intake Condition</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                {job.notes}
              </div>
            </div>
          )}

          {/* Verified Device Intake Condition Photos */}
          {getRepairJobImages(job).length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/90 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Verified Device Intake Photos ({getRepairJobImages(job).length})</span>
                </div>
                <span className="text-[10px] text-slate-500">Tap photo to enlarge</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {getRepairJobImages(job).map((photoUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLightboxImages(getRepairJobImages(job));
                      setLightboxTitle(`${job.ticket_id} • Intake Photo ${idx + 1}`);
                    }}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-amber-400 bg-slate-100 dark:bg-slate-900 shadow-xs transition"
                  >
                    <img
                      src={photoUrl}
                      alt={`Intake photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="p-1.5 rounded-full bg-slate-900/80 text-white shadow">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bill Summary Banner */}
          <div className="bg-slate-50 dark:bg-gradient-to-r dark:from-slate-950 dark:to-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Bill Amount</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {job.final_amount ? `₹${Number(job.final_amount).toLocaleString('en-IN')}` : (job.estimated_cost ? `₹${job.estimated_cost} (estimate)` : 'Diagnostics in progress')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Includes genuine parts and technician labor</div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start sm:self-auto">
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                Referred via: <strong className="text-emerald-600 dark:text-emerald-400">{job.seller_name || 'Partner Accessory Store'}</strong>
              </div>

              {job.status === 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span>View Invoice &amp; 60D Warranty</span>
                </button>
              )}
            </div>
          </div>

          {/* Warranty & Guarantee Callout Banner */}
          {job.status === 'COMPLETED' && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-gradient-to-r dark:from-emerald-950/30 dark:to-purple-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">SmartFix 60-Day Protection Active</div>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">Free component defect replacement valid for 60 days from completion.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInvoiceOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] shrink-0 border border-emerald-600 transition"
              >
                Verify Certificate
              </button>
            </div>
          )}

        </div>
      )}

      {/* Invoice & Warranty Certificate Modal */}
      <InvoiceWarrantyModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        job={job}
      />

      {/* Fullscreen Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxImages.length > 0}
        onClose={() => setLightboxImages([])}
        images={lightboxImages}
        title={lightboxTitle}
      />
    </main>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <TrackPageContent />
      </Suspense>
    </div>
  );
}
