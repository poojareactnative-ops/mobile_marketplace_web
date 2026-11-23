'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Zap,
  ShoppingBag,
  MessageSquare,
  Star,
  CheckCircle2,
  Sparkles
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
    <section className="relative w-full overflow-hidden bg-[#f1f3f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 transition-colors duration-200">

      {/* MAIN HERO CANVAS WITH ROUNDED FRAME */}
      <div className="">

        {/* Ambient Pulsing Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[750px] h-[520px]
          bg-gradient-to-tr from-amber-500/10 via-indigo-500/10 to-emerald-500/10
          dark:from-amber-500/15 dark:via-indigo-500/15 dark:to-emerald-500/15
          rounded-full blur-[140px] pointer-events-none"
        />

        {/* ANIMATED ORBITAL RINGS & RADAR PULSES */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          {/* Sonar Radar Wave 1 */}
          <div className="absolute top-[60%] sm:top-[58%] left-1/2
            w-[320px] sm:w-[380px] h-[320px] sm:h-[380px]
            rounded-full border border-amber-500/25 dark:border-amber-400/20
            animate-sonar-1"
          />

          {/* Sonar Radar Wave 2 */}
          <div className="absolute top-[60%] sm:top-[58%] left-1/2
            w-[320px] sm:w-[380px] h-[320px] sm:h-[380px]
            rounded-full border border-indigo-500/25 dark:border-indigo-400/20
            animate-sonar-2"
          />

          {/* 1. Inner Ring (360px) - Rotating Clockwise with Emerald Satellite */}
          <div className="
            absolute top-[60%] sm:top-[58%] left-1/2
            w-[280px] sm:w-[360px]
            h-[280px] sm:h-[360px]
            rounded-full
            border border-dashed border-slate-300/80 dark:border-slate-700/80
            animate-orbit-slow
          ">
            {/* Satellite Beacon (Emerald) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-ping" />
              <span className="absolute w-2 h-2 rounded-full bg-emerald-400" />
              <span className="absolute -top-5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-400 backdrop-blur-md whitespace-nowrap">
                OEM 100%
              </span>
            </div>
          </div>

          {/* 2. Middle Ring (560px) - Rotating Counter-Clockwise with Amber Satellite */}
          <div className="
            absolute top-[60%] sm:top-[58%] left-1/2
            w-[460px] sm:w-[560px]
            h-[460px] sm:h-[560px]
            rounded-full
            border border-slate-200/70 dark:border-slate-800/80
            animate-orbit-reverse
          ">
            {/* Satellite Beacon (Amber) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-beacon" />
              <span className="absolute -bottom-5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[8px] font-mono font-bold text-amber-600 dark:text-amber-400 backdrop-blur-md whitespace-nowrap">
                45m Bay
              </span>
            </div>

            {/* Satellite Beacon (Indigo) */}
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
            </div>
          </div>

          {/* 3. Outer Ring (800px) - Rotating Clockwise with Cyan Satellite */}
          <div className="
            absolute top-[60%] sm:top-[58%] left-1/2
            w-[680px] sm:w-[800px]
            h-[680px] sm:h-[800px]
            rounded-full
            border border-dashed border-slate-200/50 dark:border-slate-800/50
            animate-orbit-slower
          ">
            {/* Satellite Beacon (Cyan) */}
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-beacon" />
              <span className="absolute -top-5 px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[8px] font-mono font-bold text-cyan-600 dark:text-cyan-400 backdrop-blur-md whitespace-nowrap">
                0.8 km
              </span>
            </div>
          </div>

          {/* 4. Extra Outer Ring (1080px) - Rotating Counter-Clockwise */}
          <div className="
            absolute top-[60%] sm:top-[58%] left-1/2
            w-[920px] sm:w-[1080px]
            h-[920px] sm:h-[1080px]
            rounded-full
            border border-slate-100/60 dark:border-slate-800/30
            animate-orbit-reverse-slower
          " />

        </div>

        {/* MAIN TITLE */}
        <div className="text-center relative z-20 space-y-3 pt-2 sm:pt-4">

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold
            text-slate-900 dark:text-white tracking-tight leading-[1.08]">
            Welcome To{' '}
            <span className="bg-gradient-to-r from-slate-950 via-amber-600 to-slate-950 dark:from-white dark:via-amber-400 dark:to-white bg-clip-text text-transparent animate-text-shimmer inline-block">
              SmartFix
            </span>
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1
            rounded-full bg-slate-100 dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">

            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

            <span>
              Hyperlocal Repair &amp; Verified Accessories Network
            </span>
          </div>
        </div>

        {/* THREE COLUMN HERO */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12
          gap-8 items-end pt-6 sm:pt-10">

          {/* LEFT COLUMN: Animated Floating Card & Copy */}
          <div className="lg:col-span-3 space-y-6 pb-8 lg:pb-16
            text-center lg:text-left order-2 lg:order-1">

            {/* Floating Icon Card with gentle levitation physics */}
            <div className="inline-block p-4 sm:p-5 rounded-3xl
              bg-white dark:bg-slate-800/90
              border border-slate-100 dark:border-slate-700/80
              shadow-[0_15px_35px_rgba(0,0,0,0.06)]
              dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)]
              animate-float-slow hover:[animation-play-state:paused] transition-all duration-300 hover:scale-105">

              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl
                bg-indigo-50 dark:bg-indigo-950/60
                border border-indigo-100 dark:border-indigo-800
                flex items-center justify-center
                text-indigo-600 dark:text-indigo-400 relative">

                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
                <Zap className="w-6 h-6 fill-current" />
              </div>

              <div className="text-[11px] font-bold
                text-slate-800 dark:text-slate-200 mt-2">
                45-Min Express Bay
              </div>
            </div>

            {/* Left Headline */}
            <div className="space-y-2">

              <h2 className="text-2xl sm:text-3xl font-extrabold
                text-slate-900 dark:text-white
                tracking-tight leading-snug">
                The ultimate repair &amp; care hack is here.
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400
                leading-relaxed max-w-xs mx-auto lg:mx-0">
                Direct walk-in to 1–2 km certified labs with zero markup
                and live milestone alerts.
              </p>
            </div>

            {/* Ticket Search */}
            <form
              onSubmit={handleTrackSubmit}
              className="relative flex items-center
                bg-slate-50 dark:bg-slate-800/80
                border border-slate-200 dark:border-slate-700
                focus-within:border-slate-900 dark:focus-within:border-slate-400
                rounded-2xl p-1 shadow-inner max-w-xs mx-auto lg:mx-0 transition"
            >

              <Search className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />

              <input
                type="text"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                placeholder="REP-7477..."
                className="w-full px-2 py-1.5 bg-transparent border-0
                  text-xs font-mono uppercase text-slate-900
                  dark:text-white placeholder:text-slate-400
                  focus:outline-none"
              />

              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800
                  dark:bg-white dark:hover:bg-slate-100
                  text-white dark:text-slate-950 font-bold
                  text-xs rounded-xl transition shrink-0 transform hover:scale-105 active:scale-95"
              >
                Track
              </button>
            </form>

          </div>

          {/* CENTER COLUMN: LEVITATING SMARTPHONE WITH FLOATING MICRO-BADGES */}
          <div className="lg:col-span-6 flex flex-col items-center
            justify-end relative order-1 lg:order-2">

            <div className="relative w-[300px] sm:w-[350px] mx-auto pt-2 animate-float-phone">

              {/* Floating Micro-Badge 1: OLED Calibrated */}
              <div className="hidden sm:flex absolute -top-3 -right-2 sm:-right-6 z-30
                bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
                border border-slate-200/90 dark:border-slate-700/80
                shadow-xl rounded-2xl py-1.5 px-3 items-center gap-2
                animate-float-delayed pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  ✓ 100% OLED Calibrated
                </span>
              </div>

              {/* Floating Micro-Badge 2: Price Guarantee */}
              <div className="hidden sm:flex absolute bottom-14 -left-2 sm:-left-6 z-30
                bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
                border border-slate-200/90 dark:border-slate-700/80
                shadow-xl rounded-2xl py-1.5 px-3 items-center gap-1.5
                animate-float-slow pointer-events-none">
                <span className="text-amber-500 text-xs">⚡</span>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  ₹1,499 • Zero Markup
                </span>
              </div>

              {/* Central Phone Mockup Image */}
              <div className="relative z-10 mx-auto
                drop-shadow-[0_20px_35px_rgba(0,0,0,0.18)]
                dark:drop-shadow-[0_25px_45px_rgba(0,0,0,0.7)]
                transition-transform duration-500 hover:scale-[1.02]">

                <img
                  src="/hero-hand-phone.png"
                  alt="SmartFix Mobile App Mockup held in hand"
                  className="w-full h-auto object-contain mx-auto
                    block max-h-[520px] select-none pointer-events-none"
                />

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Animated Floating Technician Card & CTAs */}
          <div className="lg:col-span-3 space-y-6 pb-8 lg:pb-16
            text-center lg:text-left order-3">

            {/* Technician Card with Delayed Floating Physics */}
            <div className="inline-flex items-center gap-3
              p-3 sm:p-3.5 rounded-3xl
              bg-white dark:bg-slate-800/90
              border border-slate-100 dark:border-slate-700/80
              shadow-[0_15px_35px_rgba(0,0,0,0.06)]
              dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)]
              text-left
              animate-float-delayed hover:[animation-play-state:paused] transition-all duration-300 hover:scale-105">

              <div className="w-12 h-12 rounded-2xl
                bg-gradient-to-tr from-amber-400 to-orange-500
                p-0.5 shrink-0 shadow-md">

                <div className="w-full h-full rounded-[14px]
                  bg-slate-900 flex items-center justify-center
                  text-white font-bold text-sm">
                  ⚡
                </div>
              </div>

              <div className="space-y-0.5">

                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-3.5 h-3.5 fill-current"
                    />
                  ))}
                </div>

                <div className="text-xs font-extrabold
                  text-slate-900 dark:text-white leading-tight">
                  Verified Lab Tech #04
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  1,420+ 5-Star Phone Fixes
                </div>
              </div>
            </div>

            {/* Right Subtitle */}
            <div className="space-y-2">

              <p className="text-sm font-semibold
                text-slate-800 dark:text-slate-200
                leading-relaxed max-w-xs mx-auto lg:mx-0">
                Bye bye repair stress. See you later overpriced quotes.
                Adios fake duplicate parts.
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400
                leading-relaxed">
                60-day replacement warranty and 100% genuine OEM
                components certified by local masters.
              </p>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-wrap items-center
              justify-center lg:justify-start gap-2.5 pt-1">

              <Link
                href="/marketplace"
                className="px-5 py-3 rounded-2xl
                  bg-slate-950 hover:bg-slate-800
                  dark:bg-white dark:hover:bg-slate-100
                  text-white dark:text-slate-950
                  text-xs font-extrabold transition shadow-md
                  flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Accessories</span>
              </Link>

              <a
                href="https://wa.me/919845011223"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-2xl
                  bg-emerald-600 hover:bg-emerald-500
                  text-white text-xs font-extrabold transition
                  shadow-md flex items-center gap-2
                  transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Book on WhatsApp</span>
              </a>

            </div>
          </div>

        </div>
      </div>

      {/* BENEFIT TILES (Interactive Hover Lift) */}
      <div className="max-w-7xl mx-auto pt-6 px-2 sm:px-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Benefit 1 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900
            border border-slate-200/80 dark:border-slate-800
            flex items-center gap-3.5 shadow-xs
            group hover:-translate-y-1 hover:shadow-md transition-all duration-300">

            <div className="w-10 h-10 rounded-xl
              bg-amber-500/10 border border-amber-500/20
              text-amber-600 dark:text-amber-400
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300">

              <Clock className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-xs font-extrabold
                text-slate-900 dark:text-white">
                45-Min Express Diagnostics
              </h4>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Rapid screen, battery &amp; charging IC restoration.
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900
            border border-slate-200/80 dark:border-slate-800
            flex items-center gap-3.5 shadow-xs
            group hover:-translate-y-1 hover:shadow-md transition-all duration-300">

            <div className="w-10 h-10 rounded-xl
              bg-emerald-500/10 border border-emerald-500/20
              text-emerald-600 dark:text-emerald-400
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300">

              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-xs font-extrabold
                text-slate-900 dark:text-white">
                60-Day Warranty Protection
              </h4>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% Genuine OEM components verified by invoice.
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900
            border border-slate-200/80 dark:border-slate-800
            flex items-center gap-3.5 shadow-xs
            group hover:-translate-y-1 hover:shadow-md transition-all duration-300">

            <div className="w-10 h-10 rounded-xl
              bg-blue-500/10 border border-blue-500/20
              text-blue-600 dark:text-blue-400
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300">

              <MapPin className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-xs font-extrabold
                text-slate-900 dark:text-white">
                1–2 km Walking Radius
              </h4>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct lab connection with no middleman markup.
              </p>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
