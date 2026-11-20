'use client';

import React from 'react';
import Link from 'next/link';
import {
  Link2, MessageCircle, Camera, ShoppingBag,
  Smartphone, ShieldCheck, MapPin, Phone, Mail
} from 'lucide-react';

export default function AnimatedFooter() {
  return (
    <footer className="w-full relative bg-black text-slate-200 overflow-hidden pt-16 pb-10 border-t border-slate-900">

      {/* 1. LAYERED ANIMATED DARK WAVES (Matching Reference Design) */}
      <div className="absolute top-0 left-0 right-0 h-44 pointer-events-none overflow-hidden z-0">

        {/* Wave Layer 1 (Slow Background Undulation) */}
        <div className="absolute -top-12 left-0 w-[200%] h-full opacity-40 animate-wave-slow">
          <svg
            className="w-full h-full text-slate-800/60 fill-current"
            viewBox="0 0 1440 220"
            preserveAspectRatio="none"
          >
            <path d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,96C960,107,1056,149,1152,160C1248,171,1344,149,1392,138.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
          </svg>
        </div>

        {/* Wave Layer 2 (Medium Foreground Flow with Soft Ambient Glow) */}
        <div className="absolute -top-8 left-0 w-[200%] h-full opacity-60 animate-wave-medium">
          <svg
            className="w-full h-full text-zinc-900/90 fill-current"
            viewBox="0 0 1440 240"
            preserveAspectRatio="none"
          >
            <path d="M0,64L60,85.3C120,107,240,149,360,149.3C480,149,600,107,720,101.3C840,96,960,128,1080,138.7C1200,149,1320,139,1380,133.3L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
          </svg>
        </div>

        {/* Subtle Horizontal Gradient Horizon Light */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent" />
      </div>

      {/* 2. FOOTER CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pt-4 pb-12">

          {/* Column 1: Brand Info & Mission - 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Smartphone className="w-5 h-5 font-bold" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                SmartFix<span className="text-amber-400">Hub</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Hyperlocal certified smartphone repair network &amp; verified partner accessories marketplace. Transparent diagnostic stages, genuine replacement parts, and verified warranty certificates.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Certified Workshop Network &bull; 60D Warranty</span>
            </div>
          </div>

          {/* Column 2: Quick Links - 3 cols */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-base font-extrabold text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition duration-150 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/aboutme" className="hover:text-white transition duration-150 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#nearby" className="hover:text-white transition duration-150 inline-block">
                  Repair Services
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition duration-150 inline-block">
                  Accessories Marketplace
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition duration-150 inline-block">
                  Track Repair Ticket
                </Link>
              </li>
              <li>
                <Link href="/aboutme" className="hover:text-white transition duration-150 inline-block">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Us - 3 cols */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-base font-extrabold text-white">
              Contact Us
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <p className="text-slate-300 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>123 Innovation Street, Tech City, TC 12345</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+919845011223" className="hover:text-amber-400 transition text-slate-300 font-medium">
                  +91 98450 11223
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:support@smartfixhub.com" className="hover:text-amber-400 transition text-slate-300 font-medium">
                  support@smartfixhub.com
                </a>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Mon - Sat: 9:30 AM &ndash; 8:30 PM IST
              </p>
            </div>
          </div>

          {/* Column 4: Follow Us - 2 cols */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-base font-extrabold text-white">
              Follow Us
            </h4>

            {/* Outline Circular Social Icons */}
            <div className="flex items-center space-x-3 pt-1">
              {/* Link Icon */}
              <a
                href="https://smartfixhub.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="w-9 h-9 rounded-full border border-zinc-800 hover:border-zinc-600 bg-zinc-950/60 hover:bg-zinc-900 text-slate-400 hover:text-white flex items-center justify-center transition hover:scale-105"
              >
                <Link2 className="w-4 h-4" />
              </a>

              {/* WhatsApp Community Icon */}
              <a
                href="https://wa.me/919845011223"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Community"
                className="w-9 h-9 rounded-full border border-zinc-800 hover:border-[#25D366]/40 bg-zinc-950/60 hover:bg-[#25D366]/10 text-slate-400 hover:text-[#25D366] flex items-center justify-center transition hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              {/* Instagram Icon */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-zinc-800 hover:border-pink-500/40 bg-zinc-950/60 hover:bg-pink-500/10 text-slate-400 hover:text-pink-400 flex items-center justify-center transition hover:scale-105"
              >
                <Camera className="w-4 h-4" />
              </a>

              {/* Shopping Bag Icon */}
              <Link
                href="/marketplace"
                aria-label="Marketplace Store"
                className="w-9 h-9 rounded-full border border-zinc-800 hover:border-amber-500/40 bg-zinc-950/60 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 flex items-center justify-center transition hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2 text-[11px] text-zinc-500">
              Hyperlocal Mobile Hub &amp; Retail Network
            </div>
          </div>

        </div>

        {/* 3. BOTTOM COPYRIGHT STRIP */}
        <div className="pt-8 border-t border-zinc-900/80 text-center">
          <p className="text-xs text-zinc-500 tracking-wide">
            &copy; {new Date().getFullYear()} SmartFix Hub. All rights reserved.
          </p>
        </div>

      </div>

    </footer>
  );
}
