'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wrench, ShieldCheck, Cpu, ArrowRight, Search, 
  MapPin, CheckCircle2, Clock, Zap, Smartphone, 
  Store, ShoppingBag, BatteryCharging, Sparkles, MessageSquare
} from 'lucide-react';

export default function HeroSection() {
  const router = useRouter();
  const [ticketQuery, setTicketQuery] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const clean = ticketQuery.trim().toUpperCase();
    if (clean) {
      router.push(`/track?ticket=${clean}`);
    } else {
      router.push('/track');
    }
  };

  const handleFillDemo = (id) => {
    setTicketQuery(id);
    router.push(`/track?ticket=${id}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-slate-100 pt-10 sm:pt-16 pb-20 lg:pb-28 border-b border-slate-900 bg-studio-grid selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">

        {/* 1. HERO HEADER: TITLE, PUNCHY COPY & QUICK TICKET SEARCH */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-amber-400 font-bold">1–2 km Verified Labs</span>
            <span className="text-slate-600">•</span>
            <span>45-Min Express Diagnostics</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Fast Smartphone Repairs &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
              Genuine Accessories Near You
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
            Direct coordination with certified repair workshops within 1–2 km walking distance. 
            Zero middleman markup, 100% genuine OEM parts, and live WhatsApp milestone updates.
          </p>

          {/* Instant Ticket Tracker Search Box */}
          <div className="max-w-xl mx-auto pt-2">
            <form onSubmit={handleTrackSubmit} className="relative flex items-center bg-slate-900/90 border border-slate-800 focus-within:border-amber-400/80 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl transition">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <input
                type="text"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                placeholder="Track Ticket ID (e.g. REP-7477)..."
                className="w-full py-2.5 bg-transparent border-0 text-white placeholder:text-slate-500 font-mono text-sm tracking-wide focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-md shrink-0 flex items-center gap-1.5 transform hover:-translate-y-0.5"
              >
                <span>Track Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pill Links */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 flex-wrap">
              <span>Quick Demo:</span>
              <button
                type="button"
                onClick={() => handleFillDemo('REP-7477')}
                className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:border-amber-400/40 transition font-mono"
              >
                REP-7477 (Screen)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('REP-8821')}
                className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 hover:border-emerald-400/40 transition font-mono"
              >
                REP-8821 (Battery)
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/marketplace"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Explore Nearby Stores (1–2 km)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="https://wa.me/919845011223"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-800 hover:border-slate-700 transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Direct WhatsApp Lab Inquiry</span>
            </a>
          </div>

        </div>

        {/* 2. THE 3D SMARTPHONE HARDWARE SHOWCASE & FLOATING DIAGNOSTIC BADGES */}
        <div className="relative max-w-4xl mx-auto flex items-center justify-center py-6 sm:py-10">
          
          {/* FLOATING BADGE: TOP LEFT (45-Min Express Turnaround) */}
          <div className="hidden md:flex absolute -left-4 lg:-left-12 top-6 z-20 animate-float-slow">
            <div className="bento-card p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl flex items-center gap-3 max-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>45-Min Express Bay</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Display, battery &amp; charging IC diagnostics
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING BADGE: BOTTOM LEFT (90-Day Warranty) */}
          <div className="hidden md:flex absolute -left-8 lg:-left-16 bottom-10 z-20 animate-float-delayed">
            <div className="bento-card p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl flex items-center gap-3 max-w-[230px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="text-xs font-bold text-white">90-Day Guarantee</div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  100% Genuine OEM Certified Parts
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING BADGE: TOP RIGHT (Hyperlocal Store 0.8 km) */}
          <div className="hidden md:flex absolute -right-4 lg:-right-12 top-6 z-20 animate-float-delayed">
            <div className="bento-card p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl flex items-center gap-3 max-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Apex Tech Hub</span>
                  <span className="text-cyan-400 text-[10px] font-bold">0.8 km</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  GaN Chargers &amp; Armor Cases in stock
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING BADGE: BOTTOM RIGHT (Active Ticket Live Status) */}
          <div className="hidden md:flex absolute -right-8 lg:-right-16 bottom-10 z-20 animate-float-slow">
            <div className="bento-card p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl flex items-center gap-3 max-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Ticket REP-7477</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">READY</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  OLED Screen Fitted • WhatsApp Notified
                </div>
              </div>
            </div>
          </div>

          {/* THE 3D CENTERPIECE SMARTPHONE MOCKUP */}
          <div className="relative z-10 w-[290px] sm:w-[325px] h-[580px] sm:h-[620px] bg-slate-950 rounded-[48px] p-3 border-[6px] border-slate-800/90 shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden">
            
            {/* Top Gloss Screen Reflection */}
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-bl from-white/10 via-transparent to-transparent pointer-events-none rounded-t-[44px]" />

            {/* Dynamic Island Sensor */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 z-30">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-1" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Smartphone Live App Screen */}
            <div className="w-full h-full bg-slate-900/95 rounded-[38px] overflow-hidden flex flex-col justify-between pt-7 pb-3 px-3.5 text-left border border-slate-800/60 font-sans">
              
              {/* Header Status Bar */}
              <div className="space-y-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>9:41</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    LAB BAY #04
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-white leading-tight">Apple iPhone 13 Pro</div>
                    <div className="text-[9px] text-slate-400 font-mono">Ticket #REP-7477</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Express Fix
                  </span>
                </div>
              </div>

              {/* Live 4-Point Diagnostic Card Feed */}
              <div className="space-y-1.5 my-auto">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Hardware Diagnostic Progress
                </div>

                {/* 1. Screen Replacement */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white leading-tight">OLED Display Fitted</div>
                      <div className="text-[8.5px] text-slate-400">120Hz Super Retina OEM</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400">Passed</span>
                </div>

                {/* 2. Battery Health */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white leading-tight">Battery Diagnostics</div>
                      <div className="text-[8.5px] text-slate-400">Health Restored 100%</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400">100%</span>
                </div>

                {/* 3. TrueTone & FaceID */}
                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px] font-black">
                      ⚡
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white leading-tight">TrueTone Calibration</div>
                      <div className="text-[8.5px] text-slate-400">EEPROM Data Transfer</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400">Final QC</span>
                </div>

                {/* Price & Turnaround Summary */}
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-2 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-slate-400">Certified Estimate</div>
                    <div className="text-xs font-black text-white">₹2,499 <span className="text-[9px] font-normal text-slate-400">(Zero Markup)</span></div>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Ready in 20m
                  </span>
                </div>
              </div>

              {/* Bottom Action Button & Home Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-center">
                <Link
                  href="/track?ticket=REP-7477"
                  className="block w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[10px] rounded-xl transition text-center shadow-md hover:brightness-110"
                >
                  View Live Certificate &amp; Invoice →
                </Link>
                <div className="w-20 h-1 bg-slate-700/60 rounded-full mx-auto" />
              </div>

            </div>

          </div>

        </div>

        {/* 3. FEATURED SERVICE & PRODUCT SHOWCASE CARDS (3 Interactive Cards) */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Certified Hyperlocal Hardware Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Walk in within 5 minutes or schedule express doorstep pickup across verified 1–2 km partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Screen & Display */}
            <div className="bento-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-amber-500/40 transition space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  45 Mins Fix
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition">
                  Screen &amp; OLED Replacement
                </h3>
                <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                  Original high-gamut 120Hz displays with TrueTone preservation &amp; touch digitizer calibration.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono">From <strong className="text-white text-sm">₹1,499</strong></span>
                <Link href="/track" className="font-bold text-amber-400 flex items-center gap-1 hover:underline">
                  Book Diagnostic →
                </Link>
              </div>
            </div>

            {/* Card 2: Battery & Charging Bay */}
            <div className="bento-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-emerald-500/40 transition space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  30 Mins Fix
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition">
                  Battery &amp; Power Health
                </h3>
                <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                  Zero-cycle high-density lithium cells with surge protection. Restores battery health to 100%.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono">From <strong className="text-white text-sm">₹899</strong></span>
                <Link href="/track" className="font-bold text-emerald-400 flex items-center gap-1 hover:underline">
                  Check Health →
                </Link>
              </div>
            </div>

            {/* Card 3: Genuine Accessories & Fast Chargers */}
            <div className="bento-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:border-cyan-500/40 transition space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  In Stock Nearby
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition">
                  GaN 65W Chargers &amp; Armor
                </h3>
                <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                  Certified dual-port fast adapters, 10ft drop armor cases, and 9H privacy tempered glass protectors.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono">From <strong className="text-white text-sm">₹349</strong></span>
                <Link href="/marketplace" className="font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                  Browse Store →
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* 4. VALUE PROPOSITION STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-900">
          <div className="bento-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">1–2 km</div>
            <div className="text-xs font-bold text-amber-400">Strict Hyperlocal Geofence</div>
            <div className="text-[11px] text-slate-400">Guaranteed walking radius</div>
          </div>

          <div className="bento-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">45 Mins</div>
            <div className="text-xs font-bold text-emerald-400">Express Diagnostics</div>
            <div className="text-[11px] text-slate-400">Display, battery &amp; charging fix</div>
          </div>

          <div className="bento-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">Zero Markup</div>
            <div className="text-xs font-bold text-cyan-400">Direct Store Prices</div>
            <div className="text-[11px] text-slate-400">Pay directly to local shop</div>
          </div>

          <div className="bento-card p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">2% Cut</div>
            <div className="text-xs font-bold text-rose-400">Partner Referral</div>
            <div className="text-[11px] text-slate-400">Instant commission payout</div>
          </div>
        </div>

      </div>
    </section>
  );
}
