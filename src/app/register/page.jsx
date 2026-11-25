'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, Store, User, ArrowRight, Lock, Mail, Phone, 
  Building, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, 
  Eye, EyeOff, ArrowLeft, Zap, Layers
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    shopName: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (!form.shopName.trim()) {
      setError('Please enter your repair workshop / shop name.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await register({ ...form, role: 'ADMIN' });
      router.push(redirectTarget);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      
      {/* Error notification */}
      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs flex items-center gap-3 shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Customer Notice: Customers do NOT register */}
      <div className="bg-blue-950/40 border border-blue-800/60 p-3.5 rounded-2xl text-[11px] text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-start gap-2.5">
          <User className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Looking to track your repair?</strong> Customers do not need to register. You can check your device status instantly using your ticket ID.
          </div>
        </div>
        <Link
          href="/track"
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shrink-0 flex items-center gap-1 transition shadow"
        >
          <span>Track Device</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Accessory Store Partner Notice */}
      <div className="bg-slate-950/90 border border-slate-800/80 p-3.5 rounded-2xl text-[11px] text-slate-400 flex items-start gap-3">
        <Store className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Mobile Accessory Store Partner?</strong> Sellers are onboarded directly by their affiliated Repair Shop Admin to preserve 2% referral commissions.
        </div>
      </div>

      {/* Registration Input Form */}
      <form onSubmit={handleRegister} className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
            Repair Shop Admin Registration
          </label>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Workshop Hub
          </span>
        </div>

        {/* Repair Shop Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Repair Shop / Center Name <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              required
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              placeholder="e.g. Pooja Mobile Care &amp; Repair Hub"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition shadow-inner"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Workshop Owner Full Name <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Pooja Maurya"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition shadow-inner"
            />
          </div>
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Password with Eye Toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">Create Secure Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-2.5 text-slate-500 hover:text-white transition"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-xl shadow-amber-500/20 transition flex items-center justify-center space-x-2 transform hover:-translate-y-0.5"
        >
          <span>{submitting ? 'Registering Workshop...' : 'Register Workshop Admin'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Link to Login */}
      <div className="pt-4 text-center text-xs text-slate-400 border-t border-slate-800">
        Already have an active account?{' '}
        <Link 
          href={`/login${redirectTarget !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} 
          className="font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
        >
          <span>Sign In directly</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Simple Navigation */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supabase Live Database</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex items-center justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: BRAND STORY & BENEFITS SHOWCASE */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            
            <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hyperlocal Mobile Repair Platform</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Join the Network of{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
                  Local Repair Pros
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
                Connect your mobile repair shop with neighborhood accessory stores. Receive walk-in customer referrals and auto-settle guaranteed 2% commissions.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-4 pt-2 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-start space-x-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Full Repair Shop Workbench</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Manage technician work orders, update device diagnostic states, and generate transparent bills.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Seller Partner Onboarding</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Admins onboard local accessory shops as 2% referral partners with dedicated login credentials.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time Supabase Ledger</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated 2% commission splits, public customer ticket tracker, and tamper-proof audit trails.</p>
                </div>
              </div>
            </div>

            {/* Testimonial / Trust banner */}
            <div className="pt-2 flex items-center justify-center lg:justify-start space-x-3 text-xs text-slate-400">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold border-2 border-slate-950">A</div>
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold border-2 border-slate-950">S</div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-slate-950 font-bold border-2 border-slate-950">C</div>
              </div>
              <span>Trusted by local repair centers &amp; accessory partners</span>
            </div>

          </div>

          {/* RIGHT COLUMN: REGISTRATION FORM CARD */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto">
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

              <div className="mb-6 space-y-1">
                <h2 className="text-2xl font-black text-white">Register Repair Workshop</h2>
                <p className="text-xs text-slate-400">
                  Register your repair shop to join the SmartFix partner network
                </p>
              </div>

              <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading registration form...</div>}>
                <RegisterForm />
              </Suspense>

            </div>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        SmartFix Hub &bull; Hyperlocal Mobile Repair &amp; 2% Referral Platform &bull; Powered by Next.js &amp; Supabase
      </footer>

    </div>
  );
}
