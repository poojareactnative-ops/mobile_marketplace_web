'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import CommissionCalculator from '../components/CommissionCalculator';
import NearbyMarketplace from '../components/NearbyMarketplace';
import OffersCarousel from '../components/OffersCarousel';
import { supabaseService } from '../services/supabaseService';
import {
  Wrench, Store, ShieldCheck, User, ArrowRight, CheckCircle2,
  Smartphone, Search, Shield, ChevronRight, Sparkles, Percent,
  Layers, Check, Clock, TrendingUp, Compass, MapPin
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="">

      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. HERO SECTION */}
      <section className="">

        {/* FEATURED HYPERLOCAL OFFERS CAROUSEL */}
        <OffersCarousel />

      </section>

      {/* 2.5 HYPERLOCAL NEARBY MARKETPLACE (1–2 KM RADIUS) */}
      <NearbyMarketplace />

      {/* 3. CONSUMER VALUE GUIDE (ZERO ACCOUNT NEEDED) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero Account Needed &bull; Direct Shop Connection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How It Works for Customers</h2>
            <p className="text-sm text-slate-400">
              Shop directly from certified neighborhood repair technicians and mobile accessory stores with complete pricing transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Step 1 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 transition flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                  1
                </div>
                <h3 className="text-base font-extrabold text-white">Find Nearby Shops (1–2 km)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use your live GPS or select your neighborhood area to discover repair centers and mobile accessory stores within walking distance.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Hyperlocal geofenced distance</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 transition flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                  2
                </div>
                <h3 className="text-base font-extrabold text-white">Browse Products &amp; Repair Deals</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Explore original phone accessories, chargers, and discounted screen or battery replacement offers uploaded by verified local partners.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Up to 30% off repair discounts</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 transition flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
                  3
                </div>
                <h3 className="text-base font-extrabold text-white">Send Direct Shop Query</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No sign-up or password required! Click &quot;Send Query&quot; on any item to send an instant message, start a WhatsApp chat, or call the shop owner.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant WhatsApp &amp; Direct Call</span>
              </div>
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
            <Link href="/login" className="hover:text-slate-400 transition underline underline-offset-2">
              Staff &amp; Partner Login
            </Link>
            <span>&bull;</span>
            <span>Next.js 14 App Router</span>
            <span>&bull;</span>
            <span>Supabase PostgreSQL</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
