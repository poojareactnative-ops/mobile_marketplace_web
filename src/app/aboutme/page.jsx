'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { 
  Wrench, Store, ShieldCheck, User, Sparkles, Percent, 
  Layers, CheckCircle2, Clock, MapPin, Compass, ArrowRight, 
  MessageSquare, Heart, Code2, Database, Globe, Smartphone, 
  Terminal, Shield, Check, Mail, ExternalLink, Laptop
} from 'lucide-react';

export default function AboutMePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden transition-colors duration-200">
      
      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. HERO SPOTLIGHT SECTION */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-studio-grid bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
        
        {/* Ambient Glow Spotlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[32rem] h-[32rem] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Studio Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="tracking-wide uppercase text-[11px]">
              Developer Profile &bull; Product Vision &bull; SmartFix Hub
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Building Hyperlocal Tech{' '}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 dark:from-amber-400 dark:via-orange-400 dark:to-emerald-400 bg-clip-text text-transparent">
              That Empowers Local Shops.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Hi, welcome! I am a passionate full-stack developer dedicated to engineering modern web solutions for local commerce.{' '}
            <strong className="text-slate-900 dark:text-white font-bold">SmartFix Hub</strong> is an ecosystem born from a real-world problem: helping neighborhood mobile repair technicians and accessory retailers thrive together through automated 2% referral incentives and friction-free consumer discovery.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/#nearby"
              className="px-7 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-2xl text-sm shadow-xl shadow-emerald-600/25 transition flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-emerald-100" />
              <span>Explore Live Marketplace &darr;</span>
            </Link>

            <Link
              href="/marketplace"
              className="px-7 py-4 bg-white hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-amber-600 dark:text-amber-400 font-bold rounded-2xl text-sm transition flex items-center space-x-2 shadow-sm dark:shadow-lg backdrop-blur-md transform hover:-translate-y-0.5"
            >
              <Store className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Browse Products Catalog</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bento-card p-4 rounded-2xl text-center space-y-1">
                <div className="text-2xl font-black text-slate-900 dark:text-white">1–2 km</div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hyperlocal Geofence</div>
              </div>
              <div className="bento-card p-4 rounded-2xl text-center space-y-1">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">2% Split</div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Automated Ledger Payout</div>
              </div>
              <div className="bento-card p-4 rounded-2xl text-center space-y-1">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">0 Sign-Up</div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Frictionless Customer Queries</div>
              </div>
              <div className="bento-card p-4 rounded-2xl text-center space-y-1">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Supabase Database</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. ABOUT THE CREATOR & ENGINEERING PHILOSOPHY */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto space-y-14">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Card: Developer Profile Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bento-card rounded-3xl p-7 shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/25">
                    👨‍💻
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Full-Stack Engineer</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Mobile &amp; Web Systems Architect</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Bengaluru, India</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                  <p>
                    I craft production-grade, highly scalable software with a strong focus on clean architecture, intuitive user interfaces, and robust backend resilience.
                  </p>
                  <p>
                    My work on <strong className="text-slate-900 dark:text-white">SmartFix Hub</strong> blends mobile-first responsiveness, real-time relational database design on Supabase PostgreSQL, and practical local business monetization models.
                  </p>
                </div>

                {/* Tech Skills Pills */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Core Tech Stack:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Next.js 14 (App Router)', 'React 18', 'Node.js & Express', 'Supabase PostgreSQL', 'Tailwind CSS', 'Haversine GPS Algorithm', 'RESTful APIs', 'Role-Based Access Control'].map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="mailto:contact@smartfixhub.com"
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Get in Touch Directly</span>
                  </a>
                </div>

              </div>
            </div>

            {/* Right: The Origin & Vision */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Story &amp; Origin</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Why I Created SmartFix Hub
              </h2>

              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                <p>
                  Every day, thousands of consumers walk into local mobile accessory shops asking: <em>&quot;Can you fix my cracked iPhone display?&quot;</em> or <em>&quot;Do you replace swollen batteries?&quot;</em>.
                </p>
                <p>
                  In most cases, small accessory stores cannot afford precision SMD soldering machines or trained repair technicians. They turn the customer away and miss an easy revenue stream.
                </p>
                <p>
                  Meanwhile, certified device repair centers operate half a kilometer away with empty diagnostic bays, spending money on expensive online ads that yield low-converting leads.
                </p>
                <blockquote className="border-l-4 border-amber-500 pl-4 py-2 text-slate-700 dark:text-slate-200 italic font-medium bg-slate-100 dark:bg-slate-900/60 rounded-r-xl border border-slate-200/60 dark:border-slate-800/60">
                  &ldquo;SmartFix Hub bridges this divide by turning local accessory shops into active referral nodes that earn strictly 2% on completed repair bills, while customers enjoy walking-distance convenience without mandatory account creation.&rdquo;
                </blockquote>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bento-card p-4 rounded-2xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Zero Overhead for Sellers</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sellers don&apos;t perform repairs or buy tools. They refer walk-in customers in 1 click and receive automated commission.
                  </p>
                </div>

                <div className="bento-card p-4 rounded-2xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Quality Assurance for Admins</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Certified technicians diagnose, repair, and record transparent final bills with genuine OEM replacement warranties.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. THE 3 CORE PILLARS (BENTO GRID SHOWCASE) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-studio-grid bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-50 dark:from-slate-950 dark:via-slate-900/30 dark:to-slate-950">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Architectural Pillars</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Designed with Purpose. Engineered for Trust.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The technical and economic principles that power every transaction across the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pillar 1 */}
            <div className="bento-card rounded-3xl p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">1. Hyperlocal Geofencing (1–2 km)</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time Haversine distance calculations ensure consumers only see repair centers and accessory stores within physical walking distance. No spam listings from distant cities.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Tight 1.0 km, 1.5 km &amp; 2.0 km filters</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bento-card rounded-3xl p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Percent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">2. Automated 2% Referral Ledger</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  When a repair is completed, the system calculates strictly 2% credited to the referring accessory shop&apos;s ledger. Payouts are reconciled with UPI reference numbers in real time.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero accounting disputes &bull; Transparent audit</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bento-card rounded-3xl p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">3. Zero-Account Customer Access</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consumers shouldn&apos;t need to remember another password just to ask about a phone charger or screen repair. Inquiries bridge directly into 1-click WhatsApp chats and direct phone calls.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click WhatsApp &bull; Direct calling</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. TECH ARCHITECTURE SUMMARY */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Full-Stack Blueprint</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">How the System is Built</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Modern engineering practices applied to hyperlocal mobile commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bento-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Frontend Layer</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Next.js 14 App Router, React 18, Tailwind CSS, Lucide icons, responsive design.
              </p>
            </div>

            <div className="bento-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                <Terminal className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Node.js Backend</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dedicated Express REST API in <code className="text-amber-600 dark:text-amber-400 font-mono">server/</code> with role-based auth middleware and 2% split controllers.
              </p>
            </div>

            <div className="bento-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                <Database className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Supabase PostgreSQL</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Relational tables, Row-Level Security (RLS), foreign key cascades, and real-time ledger storage.
              </p>
            </div>

            <div className="bento-card p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <span>Auth &amp; Security</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Supabase Auth for staff JWT tokens, edge middleware guards, and zero-account customer access.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100/70 via-slate-50 to-slate-100/70 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl mx-auto">
            ⚡
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Ready to Explore the Platform?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Discover verified repair deals in your walking radius, browse accessories, or log in as a shop partner to start earning 2% referrals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition transform hover:-translate-y-0.5"
            >
              Go to Home &amp; Nearby Deals
            </Link>
            <Link
              href="/marketplace"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-xs transition shadow-xs transform hover:-translate-y-0.5"
            >
              Browse Products Catalog
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-bold rounded-xl text-xs transition shadow-xs transform hover:-translate-y-0.5"
            >
              Staff &amp; Partner Portal
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950 py-10 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white">SmartFix Hub</span> &mdash; Hyperlocal Mobile Care Ecosystem
            </div>
          </div>
          <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400 text-[11px]">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200 transition">
              Home
            </Link>
            <span>&bull;</span>
            <Link href="/marketplace" className="hover:text-slate-900 dark:hover:text-slate-200 transition">
              Marketplace
            </Link>
            <span>&bull;</span>
            <Link href="/aboutme" className="hover:text-amber-500 dark:hover:text-amber-400 transition text-amber-600 dark:text-amber-400 font-semibold">
              About Me
            </Link>
            <span>&bull;</span>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-200 transition">
              Partner Login
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
