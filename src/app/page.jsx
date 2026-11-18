'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import NearbyMarketplace from '../components/NearbyMarketplace';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">

      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. FULL-WIDTH HERO FEATURED PRODUCTS SHOWCASE */}
      <section className="w-full relative overflow-hidden">
      </section>

      {/* 2.5 HYPERLOCAL NEARBY MARKETPLACE (1–2 KM RADIUS) */}
      <NearbyMarketplace />

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-white">SmartFix Hub</span> &mdash; Hyperlocal Mobile Repair &amp; Accessories Network
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-500 text-[11px]">
            <Link href="/aboutme" className="hover:text-amber-400 transition">
              About Me
            </Link>
            <span>&bull;</span>
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
