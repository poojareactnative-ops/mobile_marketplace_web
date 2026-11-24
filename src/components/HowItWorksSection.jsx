'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Compass, MessageSquare, Wrench, ShieldCheck, 
  ArrowRight, Smartphone, Store, Clock, CheckCircle2 
} from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Pinpoint Nearby Stores',
    description: 'Our real-time GPS geofence identifies certified repair labs and mobile accessory shops strictly within a 1.0 to 2.0 km walking radius.',
    icon: Compass,
    accent: 'amber',
  },
  {
    step: '02',
    title: 'Direct WhatsApp Chat',
    description: 'Skip lengthy registration forms. Connect straight with verified store managers and technicians on WhatsApp with pre-filled model details.',
    icon: MessageSquare,
    accent: 'emerald',
  },
  {
    step: '03',
    title: 'Walk-In or Fast Pickup',
    description: 'Visit the local store in 5 minutes for express 45-minute repair diagnostics or pick up genuine chargers, cables, and screen protectors.',
    icon: Wrench,
    accent: 'cyan',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 relative overflow-hidden transition-colors duration-200">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-14 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 shadow-xs dark:shadow-md">
            <span>✨ Seamless Customer Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            How SmartFix Hub Works
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            No middleman fees, no delivery delays. Direct hyper-local coordination between customers and verified local smartphone specialists.
          </p>
        </div>

        {/* 3 Step Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bento-card rounded-3xl p-7 flex flex-col justify-between group relative overflow-hidden space-y-6 hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:scale-110 group-hover:border-amber-500/40 transition duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-300 dark:text-slate-700/80 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition">
                    {s.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified &amp; Guaranteed</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlight Banner: Repair Job Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl text-white">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                Live Tracking
              </span>
              <span className="text-xs text-slate-400">Already have a repair in progress?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Track Your Smartphone Repair in Real-Time
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Enter your job tracking code to inspect technician notes, diagnostic milestones, and warranty certificate status anytime.
            </p>
          </div>

          <Link
            href="/track"
            className="w-full sm:w-auto justify-center px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-xs transition flex items-center space-x-2 border border-slate-700 shadow-lg shrink-0 transform active:scale-95"
          >
            <span>Open Job Tracker</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

      </div>

    </section>
  );
}
