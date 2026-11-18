'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Wrench, ShieldCheck, Store, User, Database, LogOut,
  LogIn, UserPlus, ChevronDown, ShoppingBag, LayoutDashboard,
  Search, Sparkles, MapPin, Compass, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    logout('/');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'Repair Admin', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'SELLER':
        return { label: 'Accessory Partner', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Customer', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    }
  };

  const roleInfo = getRoleBadge(role);
  const dashboardUrl = role === 'ADMIN' ? '/admin' : (role === 'SELLER' ? '/seller' : (role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'));
  const dashboardLabel = role === 'ADMIN' ? 'Admin Hub' : (role === 'SELLER' ? 'Seller Workbench' : (role === 'SUPER_ADMIN' ? 'Super Admin Audit' : 'My Workbench'));

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 text-white shadow-2xl">


      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition">
              <Wrench className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-amber-400 transition">
                SmartFix Hub
              </span>
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
              href="/marketplace"
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname === '/marketplace' ? 'bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-800/40' : 'hover:text-emerald-400 hover:bg-slate-900/60'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Products</span>
            </Link>
            <Link
              href="/aboutme"
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname === '/aboutme' || pathname === '/about' ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30' : 'hover:text-amber-400 hover:bg-slate-900/60'}`}
            >
              <User className="w-3.5 h-3.5" />
              <span>About Me</span>
            </Link>

            {/* Dashboard ONLY visible when authenticated as shop staff */}
            {isAuthenticated && (
              <Link
                href={dashboardUrl}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname === dashboardUrl || pathname === '/dashboard' ? 'bg-slate-900 text-amber-400 font-bold border border-slate-800' : 'hover:text-white hover:bg-slate-900/60'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{dashboardLabel}</span>
              </Link>
            )}
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
                        href={dashboardUrl}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-2 font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                        <span>{dashboardLabel}</span>
                      </Link>
                      {user?.role === 'SELLER' && (
                        <Link
                          href="/seller/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center justify-between font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            <span>Store Profile &amp; Password</span>
                          </div>
                          {user?.isDefaultPassword && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </Link>
                      )}
                      <Link
                        href="/marketplace"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-2 font-medium"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Products</span>
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
              /* Consumer View & Staff Sign-In */
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition font-medium rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/#nearby"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Nearby Deals</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
