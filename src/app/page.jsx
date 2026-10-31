'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CommissionCalculator from '../components/CommissionCalculator';
import NearbyMarketplace from '../components/NearbyMarketplace';
import { supabaseService } from '../services/supabaseService';
import { 
  Wrench, Store, ShieldCheck, User, ArrowRight, CheckCircle2, 
  Smartphone, Search, Shield, ChevronRight, Sparkles, Percent, 
  Layers, Check, Clock, TrendingUp, Compass, MapPin
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-300 shadow-xl backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Dual Revenue Synergy: Repair Center + 2% Accessory Partner Referral</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
            Repair Centers &amp; Accessory Stores{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
              Growing Together
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            The hyperlocal business ecosystem where <strong className="text-white">Admin operates the mobile repair shop</strong>, 
            local <strong className="text-white">accessory stores refer repair customers to earn strictly 2%</strong> on completed jobs, 
            and <strong className="text-white">Super Admin</strong> audits platform volume in real time.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#nearby"
              className="px-7 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-sm shadow-xl shadow-emerald-600/25 transition flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Explore Nearby Deals (1–2 km) &darr;</span>
            </a>

            <Link
              href="/marketplace"
              className="px-7 py-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-2xl text-sm transition flex items-center space-x-2 shadow-lg backdrop-blur-md transform hover:-translate-y-0.5"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Browse Catalog</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-4 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-amber-400 font-semibold text-sm rounded-2xl transition flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Partner Workbench &rarr;</span>
            </Link>
          </div>

          {/* Interactive Live Calculator embedded directly in Hero */}
          <div className="pt-8 max-w-4xl mx-auto text-left" id="calculator">
            <CommissionCalculator initialAmount={2500} />
          </div>
        </div>
      </section>

      {/* 2.5 HYPERLOCAL NEARBY MARKETPLACE (1–2 KM RADIUS) */}
      <NearbyMarketplace />

      {/* 3. FOUR ECOSYSTEM ROLE PORTALS */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Role Hyperlocal Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Tailored Workbenches for Every Partner</h2>
            <p className="text-sm text-slate-400">
              Each persona features real-time Supabase synchronization, role-specific workbenches, and guaranteed 2% referral attribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* PORTAL 1: ADMIN */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 transition flex flex-col justify-between group shadow-xl backdrop-blur-md relative overflow-hidden transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />
              
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Role 1</span>
                  <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition">
                    Admin: Repair Center
                  </h3>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Technician Operations Hub</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Operates repair center, onboards local accessory sellers, completes repairs, records final bills, and settles 2% commission payouts.
                </p>
                <div className="text-[11px] font-semibold text-slate-300 space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Manage repair queue &amp; diagnostics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Onboard partner accessory sellers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Settle 2% commission via UPI</span>
                  </div>
                </div>
              </div>
              <Link
                href="/admin"
                className="mt-6 w-full py-2.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 border border-amber-500/30 shadow"
              >
                <span>Enter Admin Workbench</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* PORTAL 2: SELLER */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 transition flex flex-col justify-between group shadow-xl backdrop-blur-md relative overflow-hidden transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Role 2 &bull; 2% Referral</span>
                  <h3 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition">
                    Seller: Accessories Store
                  </h3>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Walk-in Referral Partner</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sells mobile covers &amp; chargers. Refers repair walk-ins to the partner repair shop in 1-click and earns strictly 2% on completed bills.
                </p>
                <div className="text-[11px] font-semibold text-slate-300 space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Create repair referrals with 1-click</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live 2% commission ledger</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Zero repair hassle or liability</span>
                  </div>
                </div>
              </div>
              <Link
                href="/seller"
                className="mt-6 w-full py-2.5 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 border border-emerald-500/30 shadow"
              >
                <span>Enter Seller Workbench</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* PORTAL 3: SUPER ADMIN */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 rounded-3xl p-6 transition flex flex-col justify-between group shadow-xl backdrop-blur-md relative overflow-hidden transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Role 3</span>
                  <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition">
                    Super Admin: Governance
                  </h3>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Platform Owner &amp; Audit</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Platform owner dashboard with complete audit trail of all repair shops, registered accessory sellers, and global 2% commission volume.
                </p>
                <div className="text-[11px] font-semibold text-slate-300 space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Global shops &amp; sellers registry</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Platform-wide 2% audit trail</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Total repair volume metrics</span>
                  </div>
                </div>
              </div>
              <Link
                href="/super-admin"
                className="mt-6 w-full py-2.5 bg-purple-500/15 hover:bg-purple-500 text-purple-300 hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 border border-purple-500/30 shadow"
              >
                <span>Enter Super Admin</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* PORTAL 4: CUSTOMER */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 transition flex flex-col justify-between group shadow-xl backdrop-blur-md relative overflow-hidden transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Role 4</span>
                  <h3 className="text-base font-extrabold text-white group-hover:text-blue-300 transition">
                    Customer: Ticket Tracker
                  </h3>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">End-User Device Owner</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Walks into partner accessory store, receives repair Ticket ID, inspects live repair progress, shop assignment, and final bill amount.
                </p>
                <div className="text-[11px] font-semibold text-slate-300 space-y-2 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Real-time ticket search portal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Itemized bill &amp; shop transparency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Browse discounted accessories</span>
                  </div>
                </div>
              </div>
              <Link
                href="/track"
                className="mt-6 w-full py-2.5 bg-blue-500/15 hover:bg-blue-500 text-blue-300 hover:text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 border border-blue-500/30 shadow"
              >
                <span>Track Repair Ticket</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. WORKFLOW: 5 STEPS OF 2% REFERRAL CYCLE */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Step-by-Step Cycle</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">How the 2% Referral Commission Cycle Operates</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A transparent, automated cycle protecting repair shop margins and rewarding accessory stores for every referral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Step 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 relative hover:border-slate-700 transition">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs font-bold text-white">Customer Visits Store</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Customer walks into an affiliated accessory store with a cracked screen or damaged battery.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 relative hover:border-slate-700 transition">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs font-bold text-white">Seller Creates Referral</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Seller creates a digital referral ticket in 1-click. Assigned automatically to partner repair shop.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 relative hover:border-slate-700 transition">
              <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black text-xs flex items-center justify-center">
                3
              </span>
              <h4 className="text-xs font-bold text-white">Admin Completes Repair</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Admin accepts ticket, diagnoses &amp; repairs device, and records the final bill in Supabase.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 relative hover:border-slate-700 transition">
              <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 font-black text-xs flex items-center justify-center">
                4
              </span>
              <h4 className="text-xs font-bold text-white">2% Auto-Calculated</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                System automatically calculates 2% commission credited to seller ledger as <code className="text-amber-400">PENDING</code>.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 relative hover:border-slate-700 transition">
              <span className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 font-black text-xs flex items-center justify-center">
                5
              </span>
              <h4 className="text-xs font-bold text-white">Commission Settled</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Admin records payout via UPI reference. Status moves to <code className="text-emerald-400">PAID</code> on both dashboards.
              </p>
            </div>

          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Zero Interference Rule:</strong> Sellers only sell mobile accessories and cannot perform repairs or alter final bills entered by the Admin.
              </span>
            </div>
            <span className="text-slate-500 text-[11px]">Uncompleted or cancelled repairs earn ₹0.</span>
          </div>

        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-white">SmartFix Hub</span> &mdash; Hyperlocal Mobile Repair &amp; 2% Referral Platform
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
            <span>Next.js 14 App Router</span>
            <span>&bull;</span>
            <span>Supabase PostgreSQL</span>
            <span>&bull;</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
