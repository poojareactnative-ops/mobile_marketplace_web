'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabaseService } from '../../services/supabaseService';
import { Search, Wrench, Smartphone, CheckCircle2, Clock, ShieldCheck, ArrowRight, Store, FileText } from 'lucide-react';

export default function TrackPage() {
  const [ticketInput, setTicketInput] = useState('');
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;
    try {
      setLoading(true);
      setError('');
      const res = await supabaseService.trackRepair(ticketInput.trim());
      setJob(res);
    } catch (err) {
      setJob(null);
      setError(err.message || 'Ticket not found. Please double check the ID.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (status, stepIndex) => {
    const statusOrder = {
      'PENDING': 0,
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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 py-16 space-y-8 flex-1">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Public Diagnostic &amp; Bill Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Track Device Repair Ticket</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Enter your repair Ticket ID to view live technician diagnostic stages, assigned repair shop, and verified bills.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleTrack} className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-3xl flex gap-3 shadow-2xl backdrop-blur-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="Enter Ticket ID (e.g. REP-1001)"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-bold text-white uppercase focus:outline-none focus:border-blue-500 font-mono tracking-wider shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/30 transition shrink-0 transform hover:-translate-y-0.5"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Track Ticket'}</span>
          </button>
        </form>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs animate-in fade-in">
            {error}
          </div>
        )}

        {/* Live Ticket Card */}
        {job && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            
            {/* Top Bar of Ticket */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
              <div>
                <span className="font-mono text-amber-400 font-black text-xs tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {job.ticket_id}
                </span>
                <h2 className="text-xl font-black text-white mt-1.5">{job.device_brand} {job.device_model}</h2>
                <div className="text-xs text-slate-400">Customer: <strong className="text-slate-200">{job.customer_name}</strong></div>
              </div>

              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto border ${
                job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10' :
                job.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10' :
                job.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {job.status}
              </span>
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
                        : 'bg-slate-950 text-slate-600 border-slate-800'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className={`text-[10px] font-bold ${
                      status === 'completed' ? 'text-emerald-400' :
                      status === 'current' ? 'text-white' : 'text-slate-600'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reported Issue</div>
                <div className="text-white font-medium">{job.problem_description}</div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Repair Center</div>
                <div className="text-white font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{job.shop_name || 'Verified Partner Repair Center'}</span>
                </div>
              </div>
            </div>

            {/* Bill Summary Banner */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-xs text-slate-400">Total Bill Amount</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {job.final_amount ? `₹${Number(job.final_amount).toLocaleString('en-IN')}` : (job.estimated_cost ? `₹${job.estimated_cost} (estimate)` : 'Diagnostics in progress')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Includes genuine parts and technician labor</div>
              </div>

              <div className="text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
                Referred via: <strong className="text-emerald-400">{job.seller_name || 'Partner Accessory Store'}</strong>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
