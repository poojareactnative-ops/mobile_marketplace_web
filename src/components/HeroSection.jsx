'use client';
export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 pt-16 sm:pt-24 pb-20 lg:pb-28 border-b border-slate-900 bg-studio-grid selection:bg-amber-500 selection:text-slate-950">

      {/* 2. MAIN HERO CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">


        {/* 4. VALUE PROPOSITION STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6">
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
            <div className="text-2xl sm:text-3xl font-black text-white">1-Click</div>
            <div className="text-xs font-bold text-rose-400">WhatsApp Inquiries</div>
            <div className="text-[11px] text-slate-400">No customer account required</div>
          </div>
        </div>
      </div>
    </section>
  );
}
