'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Wrench, ShieldCheck, Store, User, Database, LogOut, 
  LogIn, UserPlus, ChevronDown, ShoppingBag, LayoutDashboard, 
  Search, Sparkles, MapPin, Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'Repair Admin', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'SELLER':
        return { label: 'Partner Seller (2%)', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Customer', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    }
  };

  const roleInfo = getRoleBadge(role);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 text-white shadow-2xl">
      {/* Micro Info Topbar */}
      <div className="bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-indigo-700/90 text-white text-[11px] py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.2 rounded font-black text-[9px] uppercase tracking-wider">
              Hyperlocal Repair Hub
            </span>
            <span className="font-medium text-white/90 hidden sm:inline">
              Admin operates Repair Center &bull; Mobile Accessory Sellers earn strictly 2% on completed repair bills
            </span>
          </div>

          <div className="flex items-center space-x-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] text-emerald-200">Supabase Live Connected</span>
          </div>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition">
              <Wrench className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-amber-400 transition">
                  SmartFix Hub
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  2% Referral
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">Hyperlocal Repair &amp; Accessories Ecosystem</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-300">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-xl transition ${pathname === '/' ? 'bg-slate-900 text-amber-400 font-bold border border-slate-800' : 'hover:text-white hover:bg-slate-900/60'}`}
            >
              Home
            </Link>
            <Link 
              href="/#nearby" 
              className="px-3 py-2 rounded-xl transition flex items-center gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 font-bold"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Nearby Deals (1–2 km)</span>
            </Link>
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname === '/dashboard' ? 'bg-slate-900 text-amber-400 font-bold border border-slate-800' : 'hover:text-white hover:bg-slate-900/60'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/marketplace" 
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname === '/marketplace' ? 'bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-800/40' : 'hover:text-emerald-400 hover:bg-slate-900/60'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Products &amp; Offers</span>
            </Link>
            <Link 
              href="/track" 
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname === '/track' ? 'bg-blue-950/40 text-blue-400 font-bold border border-blue-800/40' : 'hover:text-blue-400 hover:bg-slate-900/60'}`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Ticket</span>
            </Link>
          </nav>

          {/* User Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-800 flex items-center space-x-2.5 transition shadow-lg"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 text-xs font-black shadow-inner">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                    <div className="text-[10px] text-amber-400 font-medium leading-tight">{roleInfo.label}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2.5 border-b border-slate-800">
                      <div className="text-xs font-extrabold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${roleInfo.class}`}>
                        {roleInfo.label}
                      </div>
                      {user.shopName && (
                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                          🏪 {user.shopName}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-2 font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        href="/marketplace"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-2 font-medium"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Products &amp; Offers</span>
                      </Link>
                      <Link
                        href="/track"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-2 font-medium"
                      >
                        <Search className="w-3.5 h-3.5 text-blue-400" />
                        <span>Track Repair Ticket</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition flex items-center space-x-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs transition border border-slate-800 flex items-center space-x-1.5 shadow"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
