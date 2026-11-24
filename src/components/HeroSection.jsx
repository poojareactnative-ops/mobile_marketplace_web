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
  Sparkles,
  Wrench,
  Cpu,
  Headphones,
  BatteryCharging,
  Gauge,
  Flame,
  Activity,
  Layers
} from 'lucide-react';

// Graphic items dataset: Mobile Accessories & Repairing Tools
const GRAPHIC_ITEMS = [
  // --- REPAIRING TOOLS ---
  {
    id: 'precision-kit',
    category: 'tools',
    name: 'Precision Driver Kit',
    subtitle: '24-in-1 S2 Steel Alloy & Magnetic Bits',
    tag: '0.01mm Lab Precision',
    tagColor: 'amber',
    stats: 'P2, T3, PH000 Bits',
    warranty: 'Lifetime Lab Grade',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background glow circle */}
        <circle cx="80" cy="80" r="60" fill="url(#amberGlow)" opacity="0.3" />
        {/* Magnetic field arcs */}
        <path d="M45 40 A45 45 0 0 1 115 40" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <path d="M55 50 A35 35 0 0 1 105 50" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
        {/* Precision Screwdriver Body */}
        <g transform="rotate(-35 80 80)">
          {/* Rotary Top Cap */}
          <rect x="74" y="22" width="12" height="10" rx="3" fill="#64748b" />
          <line x1="74" y1="26" x2="86" y2="26" stroke="#94a3b8" strokeWidth="1" />
          {/* Main Knurled Handle */}
          <rect x="73" y="32" width="14" height="60" rx="3" fill="url(#driverHandle)" />
          {/* Knurled grip ridges */}
          <line x1="73" y1="42" x2="87" y2="42" stroke="#334155" strokeWidth="1.5" />
          <line x1="73" y1="50" x2="87" y2="50" stroke="#334155" strokeWidth="1.5" />
          <line x1="73" y1="58" x2="87" y2="58" stroke="#334155" strokeWidth="1.5" />
          <line x1="73" y1="66" x2="87" y2="66" stroke="#334155" strokeWidth="1.5" />
          <line x1="73" y1="74" x2="87" y2="74" stroke="#334155" strokeWidth="1.5" />
          {/* Shaft Collar */}
          <path d="M75 92 L85 92 L83 108 L77 108 Z" fill="#94a3b8" />
          {/* Precision Steel Bit (Pentalobe/Phillips) */}
          <rect x="78" y="108" width="4" height="24" fill="#cbd5e1" />
          <path d="M78 132 L80 138 L82 132 Z" fill="#f59e0b" />
        </g>
        {/* Floating Mini Bit Indicators */}
        <g transform="translate(112, 50)">
          <rect x="0" y="0" width="22" height="8" rx="2" fill="#1e293b" stroke="#f59e0b" strokeWidth="0.75" />
          <text x="11" y="6" fontSize="5" fill="#f59e0b" textAnchor="middle" fontWeight="bold">P2 0.8</text>
        </g>
        <g transform="translate(24, 102)">
          <rect x="0" y="0" width="22" height="8" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.75" />
          <text x="11" y="6" fontSize="5" fill="#38bdf8" textAnchor="middle" fontWeight="bold">T3 TORX</text>
        </g>
        {/* Gradients */}
        <defs>
          <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="driverHandle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    id: 'thermal-separator',
    category: 'tools',
    name: 'Thermal Screen Separator',
    subtitle: 'Micro-suction Vacuum & 85°C Heated Bed',
    tag: 'Safe Frame Extraction',
    tagColor: 'orange',
    stats: '85°C Thermo-Control',
    warranty: 'Zero Ribbon Damage',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glow */}
        <circle cx="80" cy="80" r="55" fill="#ea580c" opacity="0.15" />
        {/* Heated Bed Base */}
        <rect x="35" y="65" width="90" height="48" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        {/* Silicone Thermal Heating Pad */}
        <rect x="42" y="70" width="76" height="24" rx="4" fill="#7c2d12" stroke="#ea580c" strokeWidth="1" />
        {/* Thermal Wave Heat Lines */}
        <path d="M48 78 Q52 74 56 78 T64 78" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M68 78 Q72 74 76 78 T84 78" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M88 78 Q92 74 96 78 T104 78" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
        {/* Digital LED Temperature Display */}
        <rect x="44" y="97" width="34" height="12" rx="2" fill="#090d16" stroke="#334155" strokeWidth="0.8" />
        <text x="61" y="106" fontSize="7" fill="#22c55e" fontFamily="monospace" fontWeight="bold" textAnchor="middle">85°C SET</text>
        {/* Vacuum Pump LED Indicator */}
        <circle cx="92" cy="103" r="2.5" fill="#38bdf8" />
        <circle cx="102" cy="103" r="2.5" fill="#22c55e" />
        <circle cx="112" cy="103" r="2.5" fill="#f59e0b" />
        {/* Floating Suction Cup Graphic */}
        <path d="M72 40 C72 32 88 32 88 40 L94 48 C94 50 66 50 66 48 Z" fill="#38bdf8" opacity="0.9" />
        <line x1="80" y1="28" x2="80" y2="36" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="80" cy="26" r="3" fill="#cbd5e1" />
      </svg>
    )
  },
  {
    id: 'diagnostics-meter',
    category: 'tools',
    name: 'Digital IC Multimeter',
    subtitle: 'Live Battery & IC Short-Circuit Testing',
    tag: '3.85V Signal Test',
    tagColor: 'emerald',
    stats: 'Waveform Analysis',
    warranty: '100% Motherboard Safe',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="55" fill="#10b981" opacity="0.12" />
        {/* Multimeter Body */}
        <rect x="46" y="30" width="68" height="96" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        {/* LCD Screen */}
        <rect x="54" y="40" width="52" height="30" rx="4" fill="#064e3b" stroke="#047857" strokeWidth="1" />
        {/* Digital Volts Text */}
        <text x="80" y="55" fontSize="11" fill="#34d399" fontFamily="monospace" fontWeight="bold" textAnchor="middle">3.85 V</text>
        <text x="80" y="65" fontSize="6" fill="#6ee7b7" fontFamily="monospace" textAnchor="middle">IC SHORT: PASS</text>
        {/* Rotary Dial */}
        <circle cx="80" cy="88" r="12" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <circle cx="80" cy="88" r="4" fill="#10b981" />
        <line x1="80" y1="88" x2="80" y2="79" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        {/* Probe Test Wire Jacks */}
        <circle cx="62" cy="114" r="3.5" fill="#ef4444" />
        <circle cx="80" cy="114" r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="98" cy="114" r="3.5" fill="#3b82f6" />
        {/* Probe Leads Floating */}
        <path d="M30 70 L46 62" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="26,72 30,70 32,74" fill="#facc15" />
        <path d="M130 70 L114 62" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="134,72 130,70 128,74" fill="#facc15" />
      </svg>
    )
  },
  {
    id: 'esd-tweezers',
    category: 'tools',
    name: 'Titanium ESD Tweezers',
    subtitle: 'Anti-Static Curved Tip for Micro-Jumpering',
    tag: 'ESD-15 Certified',
    tagColor: 'cyan',
    stats: 'Ultra-Fine 0.15mm',
    warranty: 'Non-Magnetic S2',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="55" fill="#06b6d4" opacity="0.12" />
        {/* Tweezers Shaft */}
        <path d="M40 35 Q65 65 78 120" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" />
        <path d="M120 35 Q95 65 82 120" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
        {/* Top Connecting Bridge */}
        <path d="M40 35 Q80 20 120 35" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
        {/* Anti-slip Grip Texture */}
        <line x1="56" y1="58" x2="63" y2="60" stroke="#0369a1" strokeWidth="1.5" />
        <line x1="58" y1="64" x2="65" y2="66" stroke="#0369a1" strokeWidth="1.5" />
        <line x1="104" y1="58" x2="97" y2="60" stroke="#0369a1" strokeWidth="1.5" />
        <line x1="102" y1="64" x2="95" y2="66" stroke="#0369a1" strokeWidth="1.5" />
        {/* Micro IC Chip being held between tips */}
        <g transform="translate(73, 114)">
          <rect x="0" y="0" width="14" height="14" rx="2" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="7" cy="7" r="2" fill="#f59e0b" />
          <line x1="-3" y1="4" x2="0" y2="4" stroke="#94a3b8" strokeWidth="1" />
          <line x1="-3" y1="10" x2="0" y2="10" stroke="#94a3b8" strokeWidth="1" />
          <line x1="14" y1="4" x2="17" y2="4" stroke="#94a3b8" strokeWidth="1" />
          <line x1="14" y1="10" x2="17" y2="10" stroke="#94a3b8" strokeWidth="1" />
        </g>
      </svg>
    )
  },

  // --- MOBILE ACCESSORIES ---
  {
    id: 'gan-charger',
    category: 'accessories',
    name: '65W GaN Fast Charger',
    subtitle: 'Dual Port Type-C & USB-A Fast Adapter',
    tag: '0 to 80% in 22 Mins',
    tagColor: 'amber',
    stats: 'PD 3.0 / SuperVOOC',
    warranty: '1-Year Lab Warranty',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="55" fill="#f59e0b" opacity="0.15" />
        {/* Charger Brick Body */}
        <rect x="48" y="42" width="64" height="74" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Front Gloss Face */}
        <rect x="54" y="48" width="52" height="62" rx="6" fill="#0f172a" />
        {/* Dual Type-C Ports with glowing accents */}
        <rect x="66" y="56" width="28" height="7" rx="3.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
        <rect x="70" y="58" width="20" height="3" rx="1.5" fill="#38bdf8" />
        <rect x="66" y="70" width="28" height="7" rx="3.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
        <rect x="70" y="72" width="20" height="3" rx="1.5" fill="#38bdf8" />
        {/* USB-A Fast Port */}
        <rect x="68" y="84" width="24" height="9" rx="2" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
        <rect x="71" y="86" width="18" height="3" fill="#f59e0b" />
        {/* 65W GaN Text */}
        <text x="80" y="103" fontSize="6.5" fill="#94a3b8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">65W GaN III</text>
        {/* AC Plug Pins Folded at Top */}
        <rect x="62" y="28" width="8" height="14" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        <rect x="90" y="28" width="8" height="14" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        {/* Lightning Energy Spark */}
        <path d="M124 55 L116 67 L122 67 L114 80 L128 66 L121 66 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
      </svg>
    )
  },
  {
    id: 'tws-earbuds',
    category: 'accessories',
    name: 'ANC Wireless Pods',
    subtitle: 'Spatial Audio & 48dB Active Noise Reduction',
    tag: '32-Hour Battery',
    tagColor: 'indigo',
    stats: 'OEM Calibrated Sound',
    warranty: 'Original Replacement',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="55" fill="#6366f1" opacity="0.15" />
        {/* Pebble Charging Case Open */}
        <rect x="46" y="58" width="68" height="58" rx="22" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5" />
        {/* Case Interior Chamber */}
        <rect x="52" y="64" width="56" height="26" rx="12" fill="#0f172a" />
        {/* Left Earbud Resting inside */}
        <circle cx="68" cy="74" r="8" fill="#334155" stroke="#818cf8" strokeWidth="1" />
        <rect x="66" y="76" width="4" height="22" rx="2" fill="#e2e8f0" />
        {/* Right Earbud Floating outside */}
        <g transform="translate(90, 30) rotate(15)">
          <circle cx="12" cy="12" r="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="12" cy="12" r="5" fill="#0f172a" />
          {/* Stem */}
          <rect x="10" y="20" width="4.5" height="26" rx="2.2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
          {/* Charging Contactor Rings */}
          <rect x="10.5" y="42" width="3.5" height="1.5" fill="#f59e0b" />
          <rect x="10.5" y="44.5" width="3.5" height="1.5" fill="#f59e0b" />
        </g>
        {/* Sound Wave Resonance Arcs */}
        <path d="M120 40 A18 18 0 0 1 126 56" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
        <path d="M126 34 A26 26 0 0 1 134 58" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        {/* Case Battery Status LED */}
        <circle cx="80" cy="102" r="2.5" fill="#10b981" />
      </svg>
    )
  },
  {
    id: 'magsafe-powerbank',
    category: 'accessories',
    name: 'MagSafe Wireless Pack',
    subtitle: '15W Magnetic Fast Inductive Power Bank',
    tag: '10,000 mAh Capacity',
    tagColor: 'emerald',
    stats: 'Strong Neodymium Lock',
    warranty: 'Certified Safe Cell',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="55" fill="#10b981" opacity="0.14" />
        {/* Power Bank Slim Aluminum Body */}
        <rect x="48" y="34" width="64" height="92" rx="14" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        {/* MagSafe Magnetic Ring Graphic */}
        <circle cx="80" cy="74" r="22" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />
        <circle cx="80" cy="74" r="16" stroke="#34d399" strokeWidth="1" opacity="0.5" />
        {/* Central Alignment Dot */}
        <circle cx="80" cy="74" r="4" fill="#10b981" />
        {/* Magnetic Alignment Notch at Bottom */}
        <line x1="80" y1="100" x2="80" y2="108" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        {/* 4-Stage Battery Level Indicator Dots */}
        <circle cx="68" cy="116" r="2" fill="#10b981" />
        <circle cx="76" cy="116" r="2" fill="#10b981" />
        <circle cx="84" cy="116" r="2" fill="#10b981" />
        <circle cx="92" cy="116" r="2" fill="#64748b" />
        {/* Wireless Waves Symbol */}
        <path d="M72 48 Q80 43 88 48" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M75 52 Q80 48 85 52" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'armor-shield',
    category: 'accessories',
    name: '9H Armor Screen Guard',
    subtitle: 'Military Drop-Tested Oleophobic Glass',
    tag: 'Edge-to-Edge 9H Core',
    tagColor: 'cyan',
    stats: 'Anti-Fingerprint / 0.3mm',
    warranty: 'Bubble-Free Fit',
    renderGraphic: () => (
      <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="55" fill="#06b6d4" opacity="0.12" />
        {/* Smartphone Silhouette in Background */}
        <rect x="52" y="28" width="56" height="104" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        {/* Elevated 3D Tempered Glass Guard Floating Above */}
        <g transform="translate(-4, -6)">
          <rect x="54" y="32" width="56" height="104" rx="12" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
          {/* Glass Specular Reflection Highlight */}
          <path d="M58 40 L98 40 L70 120 L58 120 Z" fill="white" opacity="0.15" />
          {/* Speaker Cutout Notch */}
          <rect x="74" y="36" width="16" height="3" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
          {/* Shield Badge */}
          <circle cx="96" cy="118" r="10" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
          <path d="M96 112 L101 114 V119 C101 122 96 124 96 124 C96 124 91 122 91 119 V114 Z" fill="#38bdf8" />
        </g>
      </svg>
    )
  }
];

export default function HeroSection() {
  const router = useRouter();
  const [ticketQuery, setTicketQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tools'); // 'all' | 'tools' | 'accessories'
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const filteredItems = selectedCategory === 'all'
    ? GRAPHIC_ITEMS
    : GRAPHIC_ITEMS.filter(item => item.category === selectedCategory);

  const activeItem = filteredItems[activeItemIndex % filteredItems.length] || filteredItems[0];

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const clean = ticketQuery.trim().toUpperCase();
    if (clean) {
      router.push(`/track?ticket=${clean}`);
    } else {
      router.push('/track');
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#f1f3f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 transition-colors duration-200">

      {/* AMBIENT PULSING BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[300px] sm:w-[600px] lg:w-[750px] h-[300px] sm:h-[450px] lg:h-[520px]
        bg-gradient-to-tr from-amber-500/10 via-indigo-500/10 to-emerald-500/10
        dark:from-amber-500/15 dark:via-indigo-500/15 dark:to-emerald-500/15
        rounded-full blur-[90px] sm:blur-[140px] pointer-events-none"
      />

      {/* ANIMATED ORBITAL RINGS & RADAR PULSES (Responsive clamped) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Sonar Radar Wave 1 */}
        <div className="absolute top-[55%] sm:top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[240px] sm:w-[360px] h-[240px] sm:h-[360px]
          rounded-full border border-amber-500/25 dark:border-amber-400/20
          animate-sonar-1"
        />

        {/* Sonar Radar Wave 2 */}
        <div className="absolute top-[55%] sm:top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[240px] sm:w-[360px] h-[240px] sm:h-[360px]
          rounded-full border border-indigo-500/25 dark:border-indigo-400/20
          animate-sonar-2"
        />

        {/* Inner Ring (240px mobile / 360px desktop) */}
        <div className="
          absolute top-[55%] sm:top-[58%] left-1/2
          w-[240px] sm:w-[360px]
          h-[240px] sm:h-[360px]
          rounded-full
          border border-dashed border-slate-300/80 dark:border-slate-700/80
          animate-orbit-slow
        ">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-ping" />
            <span className="absolute w-2 h-2 rounded-full bg-emerald-400" />
            <span className="absolute -top-5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[8px] font-mono font-bold text-emerald-600 dark:text-emerald-400 backdrop-blur-md whitespace-nowrap">
              OEM 100%
            </span>
          </div>
        </div>

        {/* Middle Ring (340px mobile / 560px desktop) */}
        <div className="
          absolute top-[55%] sm:top-[58%] left-1/2
          w-[340px] sm:w-[560px]
          h-[340px] sm:h-[560px]
          rounded-full
          border border-slate-200/70 dark:border-slate-800/80
          animate-orbit-reverse
        ">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-beacon" />
            <span className="absolute -bottom-5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[8px] font-mono font-bold text-amber-600 dark:text-amber-400 backdrop-blur-md whitespace-nowrap">
              45m Bay
            </span>
          </div>
        </div>

        {/* Outer Ring - visible on sm+ screens */}
        <div className="
          hidden sm:block absolute top-[58%] left-1/2
          w-[520px] sm:w-[800px]
          h-[520px] sm:h-[800px]
          rounded-full
          border border-dashed border-slate-200/50 dark:border-slate-800/50
          animate-orbit-slower
        ">
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-beacon" />
            <span className="absolute -top-5 px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[8px] font-mono font-bold text-cyan-600 dark:text-cyan-400 backdrop-blur-md whitespace-nowrap">
              0.8 km
            </span>
          </div>
        </div>

      </div>

      {/* MAIN TITLE (Fluid responsive typography) */}
      <div className="text-center relative z-20 space-y-3 pt-1 sm:pt-4 max-w-4xl mx-auto">
        <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold
          text-slate-900 dark:text-white tracking-tight leading-[1.12]">
          Welcome To{' '}
          <span className="bg-gradient-to-r from-slate-950 via-amber-600 to-slate-950 dark:from-white dark:via-amber-400 dark:to-white bg-clip-text text-transparent animate-text-shimmer inline-block">
            SmartFix
          </span>
        </h1>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5
          rounded-full bg-slate-100 dark:bg-slate-800/90
          border border-slate-200 dark:border-slate-700
          text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs max-w-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">
            Hyperlocal Repair &amp; Verified Accessories Network
          </span>
        </div>
      </div>

      {/* THREE COLUMN HERO (Responsive stacking on mobile, 12 cols on desktop) */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center pt-6 sm:pt-10 max-w-7xl mx-auto">

        {/* LEFT COLUMN: Intro Copy & Quick Tracking Form */}
        <div className="lg:col-span-3 space-y-5 sm:space-y-6 text-center lg:text-left order-1">

          {/* Express Bay Card */}
          <div className="inline-flex items-center gap-3 p-3 sm:p-4 rounded-2xl sm:rounded-3xl
            bg-white dark:bg-slate-800/90
            border border-slate-200/80 dark:border-slate-700/80
            shadow-sm dark:shadow-md
            transition-all duration-300 hover:scale-105">

            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl
              bg-amber-50 dark:bg-amber-950/60
              border border-amber-200 dark:border-amber-800
              flex items-center justify-center
              text-amber-600 dark:text-amber-400 relative shrink-0">
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              <Zap className="w-5 h-5 fill-current" />
            </div>

            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                45-Min Express Bay
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Live diagnosis while you wait
              </div>
            </div>
          </div>

          {/* Left Headline */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold
              text-slate-900 dark:text-white tracking-tight leading-snug">
              The ultimate repair &amp; care gear is here.
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400
              leading-relaxed max-w-sm mx-auto lg:mx-0">
              Direct walk-in to 1–2 km certified labs with zero markup, genuine OEM parts, and live milestone alerts.
            </p>
          </div>

          {/* Quick Repair Tracking Form */}
          <div className="max-w-sm mx-auto lg:mx-0">
            <form
              onSubmit={handleTrackSubmit}
              className="relative flex items-center
                bg-white dark:bg-slate-800/90
                border border-slate-200 dark:border-slate-700
                focus-within:border-amber-500 dark:focus-within:border-amber-400
                rounded-2xl p-1 shadow-sm transition"
            >
              <Search className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
              <input
                type="text"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                placeholder="Track Ticket: REP-7477..."
                className="w-full px-2 py-2 bg-transparent border-0
                  text-xs font-mono uppercase text-slate-900
                  dark:text-white placeholder:text-slate-400
                  focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800
                  dark:bg-amber-500 dark:hover:bg-amber-400
                  text-white dark:text-slate-950 font-bold
                  text-xs rounded-xl transition shrink-0 transform active:scale-95"
              >
                Track
              </button>
            </form>
          </div>

        </div>

        {/* CENTER COLUMN: INTERACTIVE HARDWARE GRAPHICS SHOWCASE (No big photo image, 100% Vector & Responsive) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center order-2 w-full max-w-lg mx-auto">

          {/* Interactive Graphic Showcase Card */}
          <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
            border border-slate-200/90 dark:border-slate-800/90
            rounded-3xl p-4 sm:p-6 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all duration-300">

            {/* Glowing Corner Accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

            {/* Top Interactive Tabs: Switch between Gear Types */}
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 sm:mb-5">

              <button
                onClick={() => { setSelectedCategory('tools'); setActiveItemIndex(0); }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${selectedCategory === 'tools'
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>Repair Tools</span>
              </button>

              <button
                onClick={() => { setSelectedCategory('accessories'); setActiveItemIndex(0); }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${selectedCategory === 'accessories'
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                <span>Accessories</span>
              </button>
            </div>

            {/* Central Graphic Visual Stage */}
            <div className="relative flex flex-col items-center justify-center py-2 sm:py-4">

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeItem.tag}</span>
              </div>

              {/* High-Definition SVG Graphic Container */}
              <div className="w-40 h-40 sm:w-48 sm:h-48 my-1 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                {activeItem.renderGraphic()}
              </div>

              {/* Graphic Info */}
              <div className="text-center space-y-1 mt-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {activeItem.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeItem.subtitle}
                </p>

                {/* Specs pill */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                    ⚡ {activeItem.stats}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    ✓ {activeItem.warranty}
                  </span>
                </div>
              </div>

            </div>

            {/* Quick-Switch Thumbnails Carousel / Selector (Touch-friendly on mobile) */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {filteredItems.map((item, idx) => {
                const isSelected = activeItem.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    className={`p-1.5 sm:p-2 rounded-xl text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold scale-102 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0">
                      {item.renderGraphic()}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-full">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Verified Lab Tech & Direct Call-to-Actions */}
        <div className="lg:col-span-3 space-y-5 sm:space-y-6 text-center lg:text-left order-3">

          {/* Verified Technician Badge */}
          <div className="inline-flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl
            bg-white dark:bg-slate-800/90
            border border-slate-200/80 dark:border-slate-700/80
            shadow-sm dark:shadow-md
            text-left transition-all duration-300 hover:scale-105 mx-auto lg:mx-0">

            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl
              bg-gradient-to-tr from-amber-400 to-orange-500
              p-0.5 shrink-0 shadow-sm">
              <div className="w-full h-full rounded-[10px] sm:rounded-[14px]
                bg-slate-900 flex items-center justify-center
                text-white font-bold text-xs sm:text-sm">
                ⚡
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                Verified Lab Tech #04
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                1,420+ 5-Star Phone Fixes
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200
              leading-relaxed max-w-sm mx-auto lg:mx-0">
              Bye bye repair stress. See you later overpriced quotes. Adios fake duplicate parts.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto lg:mx-0">
              60-day replacement warranty and 100% genuine OEM components certified by local master technicians.
            </p>
          </div>

          {/* CTA Buttons (Touch-friendly & full-width friendly on mobile) */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 max-w-sm mx-auto lg:mx-0">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl
                bg-slate-950 hover:bg-slate-800
                dark:bg-white dark:hover:bg-slate-100
                text-white dark:text-slate-950
                text-xs font-extrabold transition shadow-md
                flex items-center justify-center gap-2 transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Accessories</span>
            </Link>

            <a
              href="https://wa.me/919845011223"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl
                bg-emerald-600 hover:bg-emerald-500
                text-white text-xs font-extrabold transition
                shadow-md flex items-center justify-center gap-2
                transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Book on WhatsApp</span>
            </a>
          </div>

        </div>

      </div>

      {/* BENEFIT TILES (Fully Mobile Responsive Grid) */}
      <div className="max-w-7xl mx-auto pt-8 sm:pt-12 px-1 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">

          {/* Benefit 1 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900
            border border-slate-200/80 dark:border-slate-800
            flex items-center gap-3.5 shadow-xs
            group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-xl
              bg-amber-500/10 border border-amber-500/20
              text-amber-600 dark:text-amber-400
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                45-Min Express Diagnostics
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Rapid screen, battery &amp; charging IC restoration.
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900
            border border-slate-200/80 dark:border-slate-800
            flex items-center gap-3.5 shadow-xs
            group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-xl
              bg-emerald-500/10 border border-emerald-500/20
              text-emerald-600 dark:text-emerald-400
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                60-Day Warranty Protection
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% Genuine OEM components verified by invoice.
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900
            border border-slate-200/80 dark:border-slate-800
            flex items-center gap-3.5 shadow-xs sm:col-span-2 md:col-span-1
            group hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-xl
              bg-blue-500/10 border border-blue-500/20
              text-blue-600 dark:text-blue-400
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
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