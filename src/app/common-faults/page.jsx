'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Zap,
  BatteryCharging,
  Smartphone,
  Cpu,
  Volume2,
  Camera,
  MessageCircle
} from 'lucide-react';

const COMMON_FAULTS = [
  {
    id: 'display-black',
    category: 'Display',
    icon: Smartphone,
    title: 'Black Screen / No Display (Phone Vibrates)',
    severity: 'High',
    symptoms: 'Phone vibrates on incoming calls and charges, but the screen stays pitch black.',
    probableCauses: [
      'Damaged AMOLED / LCD panel flex cable',
      'Blown Backlight / Display driver IC',
      'Corrosion around the display FPC connector'
    ],
    diyChecks: [
      'Perform a force restart (Power + Volume Down for 15s).',
      'Shine a flashlight at an angle to see if a faint image is visible (indicates backlight failure).'
    ],
    benchSolution: 'FPC connector micro-soldering or genuine display assembly replacement.',
    estimatedCost: '₹1,500 – ₹4,500',
    turnaround: '45–90 mins'
  },
  {
    id: 'charging-slow-fake',
    category: 'Charging',
    icon: BatteryCharging,
    title: 'Slow / Fake Charging (Battery % Stays Same)',
    severity: 'Medium',
    symptoms: 'Lightning or charging icon appears, but battery percentage does not increase or drains while plugged in.',
    probableCauses: [
      'Lint/debris compacted inside the Type-C/Lightning port',
      'Damaged charging sub-board (daughter board)',
      'Faulty Charging IC (e.g., PM6150 / Tristar / Hydra)'
    ],
    diyChecks: [
      'Gently clean port with a non-conductive wooden toothpick.',
      'Test with an original 33W/65W charger and official cable.'
    ],
    benchSolution: 'Sub-board CC line diagnostic, Type-C connector re-soldering, or PMIC thermal trace inspection.',
    estimatedCost: '₹400 – ₹1,200',
    turnaround: '30 mins'
  },
  {
    id: 'boot-loop-restart',
    category: 'Motherboard',
    icon: Cpu,
    title: 'Boot Loop / Auto Restart on Logo',
    severity: 'Critical',
    symptoms: 'Device starts, shows brand logo, vibrates, and reboots continuously.',
    probableCauses: [
      'Degraded battery internal fuse / BMC resistance',
      'Faulty power button shorted with moisture',
      'Cold solder joint on CPU / UFS storage (common in Poco X3 / Note 10 series)'
    ],
    diyChecks: [
      'Plug into charger to see if it boots normally when powered (points to battery fuse).',
      'Boot into Recovery Mode (Power + Vol Up) and clear cache.'
    ],
    benchSolution: 'Battery thermal fuse jump/replacement or BGA CPU reballing on hot plate bench.',
    estimatedCost: '₹800 – ₹2,500',
    turnaround: '2–4 hours'
  },
  {
    id: 'audio-low-crackling',
    category: 'Audio',
    icon: Volume2,
    title: 'Low In-Call Volume / Crackling Speaker',
    severity: 'Low',
    symptoms: 'Caller voice is barely audible even at 100% volume, or loudspeaker distorts at high volumes.',
    probableCauses: [
      'Ear-piece acoustic dust mesh completely clogged by skin oils and dirt',
      'Ruptured speaker diaphragm from water exposure',
      'Damaged Audio Codec IC'
    ],
    diyChecks: [
      'Dip an anti-static soft brush in 99% Isopropyl Alcohol and gently brush acoustic grill.',
      'Check if mono audio or hearing aid mode is enabled in accessibility settings.'
    ],
    benchSolution: 'Ultrasonic acoustic mesh chemical bath or replacement of speaker loudspeaker module.',
    estimatedCost: '₹250 – ₹650',
    turnaround: '20 mins'
  },
  {
    id: 'camera-shaking-focus',
    category: 'Camera',
    icon: Camera,
    title: 'Camera Shaking / Buzzing Sound (OIS Fault)',
    severity: 'Medium',
    symptoms: 'Opening the camera produces an audible buzz, screen shakes violently, or camera cannot focus at 1x.',
    probableCauses: [
      'Physical shock or bike mount vibrations damaged the OIS gyroscope coil',
      'Stuck autofocus voice coil motor (VCM)'
    ],
    diyChecks: [
      'Switch between 0.6x (Ultrawide) and 2x (Telephoto) to identify the faulty module.',
      'Test in third-party camera app to rule out software driver freeze.'
    ],
    benchSolution: 'Individual OIS primary sensor module replacement with sensor recalibration.',
    estimatedCost: '₹1,200 – ₹3,200',
    turnaround: '40 mins'
  },
  {
    id: 'network-no-service',
    category: 'Motherboard',
    icon: Zap,
    title: 'No Service / Searching for Network / SIM Not Detected',
    severity: 'High',
    symptoms: 'SIM card is inserted but status says "No Service", or Baseband Unknown in About Settings.',
    probableCauses: [
      'Damaged coaxial RF antenna cable or connector',
      'Burned Power Amplifier (PA IC) or WTR Transceiver IC',
      'Cold solder under Baseband processor'
    ],
    diyChecks: [
      'Dial *#06# to verify if IMEI numbers appear normally.',
      'Test SIM card in a secondary phone.'
    ],
    benchSolution: 'RF transceiver IC replacement (WTR2965/SDR660) and RF pathway tracing with multimeter.',
    estimatedCost: '₹900 – ₹2,800',
    turnaround: '3–5 hours'
  }
];

const CATEGORIES = ['All', 'Display', 'Charging', 'Motherboard', 'Audio', 'Camera'];

export default function CommonFaultsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaults = COMMON_FAULTS.filter((fault) => {
    const matchesCategory = selectedCategory === 'All' || fault.category === selectedCategory;
    const matchesSearch =
      fault.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.benchSolution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-4">
            <Wrench className="w-3.5 h-3.5" />
            <span>Interactive Diagnostic Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white mb-4">
            Common Mobile Faults &amp; <span className="text-amber-500">Solutions</span>
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Diagnose common chip-level faults, charging defects, boot loops, and display issues.
            Compare quick DIY checks with professional bench solutions and estimated repair costs.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms, e.g., 'black screen', 'fake charging', 'boot loop'..."
              className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fault Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{filteredFaults.length}</strong> diagnosed failure profiles
          </p>
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Updated with 2026 Smartphone Lab Benchmarks</span>
          </div>
        </div>

        {filteredFaults.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-base">No matching fault profiles found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with general terms like "battery", "display", or clear your filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFaults.map((fault) => {
              const Icon = fault.icon;
              return (
                <div
                  key={fault.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            {fault.category}
                          </span>
                          <h3 className="text-base font-black text-slate-950 dark:text-white">
                            {fault.title}
                          </h3>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          fault.severity === 'Critical'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : fault.severity === 'High'
                            ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {fault.severity} Priority
                      </span>
                    </div>

                    {/* Symptoms */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">
                        Symptom:
                      </strong>
                      {fault.symptoms}
                    </div>

                    {/* Causes */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Common Root Causes
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {fault.probableCauses.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bench Solution */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Professional Bench Solution</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{fault.benchSolution}</p>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                      <span className="text-sm font-black text-slate-950 dark:text-white">
                        {fault.estimatedCost}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Avg. Time</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {fault.turnaround}
                      </span>
                    </div>
                    <Link
                      href={`https://wa.me/919999999999?text=Hi%20SmartFix,%20I%20need%20help%20with%20fault:%20${encodeURIComponent(
                        fault.title
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Ask Expert</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
