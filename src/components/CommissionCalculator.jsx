'use client';

import React, { useState } from 'react';
import { Calculator, Percent, Sparkles, TrendingUp, Store, Wrench, ShieldCheck } from 'lucide-react';

export default function CommissionCalculator({ initialAmount = 2500 }) {
  const [amount, setAmount] = useState(initialAmount);

  const billAmount = Math.max(0, Number(amount) || 0);
  const sellerCommission = Math.round(billAmount * 0.02);
  const superAdminCommission = Math.round(billAmount * 0.01);
  const adminRemaining = billAmount - sellerCommission - superAdminCommission;

  const presets = [1000, 2500, 5000, 8000, 12000];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-purple-500/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Automated 3-Way Revenue &amp; Commission Splitter</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>1% Super Admin &bull; 2% Seller</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculate automatic 1% Super Admin platform fee and 2% seller referral payout on completed repair billing.
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-slate-500 font-medium mr-1 hidden lg:inline">Presets:</span>
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                  amount === val
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                ₹{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Live Results Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Bill Input Card */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Final Repair Bill (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-black text-purple-400">₹</span>
              <input
                type="number"
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-lg font-black text-white focus:outline-none focus:border-purple-500 font-mono shadow-inner"
              />
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="100"
              value={Math.min(15000, Math.max(500, amount))}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Super Admin 1% Result Card */}
          <div className="bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-purple-300">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Super Admin (1%)</span>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-black px-1.5 py-0.2 rounded border border-purple-500/30">
                Platform Cut
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ₹{superAdminCommission.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-purple-300/70 mt-0.5">Platform tech convenience fee</p>
            </div>
          </div>

          {/* Seller 2% Result Card */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Store className="w-3.5 h-3.5" />
                <span>Seller Referral (2%)</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.2 rounded border border-emerald-500/30">
                Automatic
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-emerald-300 tracking-tight">
                ₹{sellerCommission.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Credited to referring partner store</p>
            </div>
          </div>

          {/* Admin 97% Result Card */}
          <div className="bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Wrench className="w-3.5 h-3.5" />
                <span>Admin Workshop (97%)</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                Net Take-Home
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                ₹{adminRemaining.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Net income after 1% Super Admin &amp; 2% Seller</p>
            </div>
          </div>

        </div>

        {/* Visual Split Ratio Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex flex-wrap justify-between text-[11px] font-bold text-slate-400 gap-2">
            <span className="text-purple-400">1% Super Admin Platform Cut (₹{superAdminCommission})</span>
            <span className="text-emerald-400">2% Seller Referral Payout (₹{sellerCommission})</span>
            <span className="text-amber-400">97% Workshop Operating Income (₹{adminRemaining})</span>
          </div>
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div style={{ width: '1%' }} className="h-full bg-purple-500" title="1% Super Admin Platform Fee" />
            <div style={{ width: '2%' }} className="h-full bg-emerald-500" title="2% Seller Referral" />
            <div style={{ width: '97%' }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500" title="97% Admin Take-Home" />
          </div>
        </div>

      </div>
    </div>
  );
}
