'use client';

import React, { useState } from 'react';
import { Calculator, Percent, Sparkles, TrendingUp, Store, Wrench } from 'lucide-react';

export default function CommissionCalculator({ initialAmount = 2500 }) {
  const [amount, setAmount] = useState(initialAmount);

  const billAmount = Math.max(0, Number(amount) || 0);
  const sellerCommission = Math.round(billAmount * 0.02);
  const adminRemaining = billAmount - sellerCommission;

  const presets = [1000, 2500, 5000, 8000, 12000];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Calculator className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">Live 2% Referral Commission Splitter</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>Fixed 2.0%</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculate automatic referral payout for mobile accessory sellers on completed repairs.
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
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                ₹{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Live Results Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Bill Input Card */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Final Repair Bill (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-black text-amber-400">₹</span>
              <input
                type="number"
                min="0"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-lg font-black text-white focus:outline-none focus:border-amber-500 font-mono shadow-inner"
              />
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="100"
              value={Math.min(15000, Math.max(500, amount))}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
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
              <p className="text-[10px] text-slate-400 mt-0.5">Credited to seller upon completion</p>
            </div>
          </div>

          {/* Admin 98% Result Card */}
          <div className="bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Wrench className="w-3.5 h-3.5" />
                <span>Admin Shop Share (98%)</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                Net Retained
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                ₹{adminRemaining.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Retained after settling seller commission</p>
            </div>
          </div>

        </div>

        {/* Visual Split Ratio Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-400">
            <span className="text-emerald-400">2% Referral Payout (₹{sellerCommission})</span>
            <span className="text-amber-400">98% Repair Shop Operating Margin (₹{adminRemaining})</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div style={{ width: '2%' }} className="h-full bg-emerald-500" title="2% Seller Commission" />
            <div style={{ width: '98%' }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500" title="98% Admin Share" />
          </div>
        </div>

      </div>
    </div>
  );
}
