'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import NearbyMarketplace from '../components/NearbyMarketplace';
import AnimatedFooter from '../components/AnimatedFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden transition-colors duration-200">

      {/* 1. TOP NAVBAR */}
      <Navbar />

      {/* 2. 21ST.DEV HERO-1 ATTRACTIVE HERO SECTION */}
      <HeroSection />

      {/* 3. HOW IT WORKS & REPAIR TRACKER */}
      <HowItWorksSection />

      {/* 4. HYPERLOCAL NEARBY MARKETPLACE (1–2 KM RADIUS) */}
      <NearbyMarketplace />

      {/* 5. ANIMATED WAVING FOOTER (Matching Reference Design) */}
      <AnimatedFooter />

    </div>
  );
}
