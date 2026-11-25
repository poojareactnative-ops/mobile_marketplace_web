'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Wrench, ShieldCheck, Store, User, Database, LogOut,
  LogIn, UserPlus, ChevronDown, ShoppingBag, LayoutDashboard,
  Search, Sparkles, MapPin, Compass, KeyRound, Menu, X,
  Sun, Moon, Monitor, MessageSquareQuote, AlertTriangle,
  Bell, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Coming Soon & Remind Me Feature State
  const [comingSoonFeature, setComingSoonFeature] = useState(null);
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setReminderEmail(user.email);
    }
  }, [user]);

  const handleSetReminder = (e) => {
    e.preventDefault();
    if (!reminderEmail.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('smartfix_feature_reminders') || '[]');
      existing.push({
        email: reminderEmail.trim(),
        feature: comingSoonFeature?.title,
        date: new Date().toISOString(),
      });
      localStorage.setItem('smartfix_feature_reminders', JSON.stringify(existing));
    } catch (err) {}

    setReminderSet(true);
  };

  const handleSignOut = () => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    logout('/');
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'Repair Admin', class: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'SELLER':
        return { label: 'Accessory Partner', class: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', class: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Customer', class: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
    }
  };

  const roleInfo = getRoleBadge(role);
  const dashboardUrl = role === 'ADMIN' ? '/admin' : (role === 'SELLER' ? '/seller' : (role === 'SUPER_ADMIN' ? '/super-admin' : '/dashboard'));
  const dashboardLabel = role === 'ADMIN' ? 'Admin Hub' : (role === 'SELLER' ? 'Seller Workbench' : (role === 'SUPER_ADMIN' ? 'Super Admin Audit' : 'My Workbench'));

  const navLinks = [
    { href: '/', label: 'Home', icon: null },
    { href: '/marketplace', label: 'Products', icon: ShoppingBag },
    { href: '/track', label: 'Track Repair', icon: Search },
    { href: '/aboutme', label: 'About', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white shadow-xs dark:shadow-2xl transition-colors duration-200">

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Wrench className="w-4 h-4 text-slate-950 font-black" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                SmartFix<span className="text-amber-500">Hub</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                1–2 km Labs
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/aboutme' && pathname === '/about');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold border border-slate-200 dark:border-slate-800'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Dashboard ONLY visible when authenticated as shop staff */}
            {isAuthenticated && (
              <Link
                href={dashboardUrl}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname === dashboardUrl || pathname === '/dashboard'
                  ? 'bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold border border-slate-200 dark:border-slate-800'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{dashboardLabel}</span>
              </Link>
            )}
          </nav>

          {/* Right Controls & User Profile */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 px-2 sm:px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center space-x-2 transition shadow-xs text-slate-800 dark:text-white"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 text-xs font-black shadow-inner shrink-0">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold leading-tight">{user.name}</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-tight">{roleInfo.label}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-slate-800 dark:text-white">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-extrabold">{user.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                      <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${roleInfo.class}`}>
                        {roleInfo.label}
                      </div>
                      {user.shopName && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          🏪 {user.shopName}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href={dashboardUrl}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center gap-2 font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                        <span>{dashboardLabel}</span>
                      </Link>
                      {user?.role === 'SELLER' && (
                        <Link
                          href="/seller/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                            <span>Store Profile &amp; Password</span>
                          </div>
                          {user?.isDefaultPassword && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </Link>
                      )}
                      <Link
                        href="/marketplace"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center gap-2 font-medium"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Products</span>
                      </Link>

                      {/* Common Fault Solutions (Coming Soon) */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          setComingSoonFeature({
                            title: 'Common Fault Solutions',
                            type: 'FAULT',
                            description: 'Comprehensive chip-level diagnostic guides, symptom search, and estimated repair cost calculator.',
                            previewUrl: '/common-faults',
                          });
                          setReminderSet(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between font-medium group"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench className="w-3.5 h-3.5 text-amber-500" />
                          <span>Common Fault Solutions</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition">
                          Coming Soon
                        </span>
                      </button>

                      {/* Experience Sharing (Coming Soon) */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          setComingSoonFeature({
                            title: 'Experience Sharing',
                            type: 'EXPERIENCE',
                            description: 'Verified community repair logs, before & after case studies, and bench technician tips.',
                            previewUrl: '/experience-share',
                          });
                          setReminderSet(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between font-medium group"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquareQuote className="w-3.5 h-3.5 text-purple-500" />
                          <span>Experience Sharing</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition">
                          Coming Soon
                        </span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center space-x-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Consumer View & Staff Sign-In (Desktop & Tablet) */
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
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

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-amber-500" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE EXPANDED NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-3">
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/aboutme' && pathname === '/about');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${isActive
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                >
                  {Icon ? <Icon className="w-4 h-4 text-amber-500" /> : <div className="w-4 h-4 rounded-full bg-amber-500/20" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Staff Dashboard Link */}
            {isAuthenticated && (
              <Link
                href={dashboardUrl}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${pathname === dashboardUrl || pathname === '/dashboard'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-500" />
                <span>{dashboardLabel}</span>
              </Link>
            )}

            {/* Mobile Common Faults (Coming Soon) */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setComingSoonFeature({
                  title: 'Common Fault Solutions',
                  type: 'FAULT',
                  description: 'Comprehensive chip-level diagnostic guides, symptom search, and estimated repair cost calculator.',
                  previewUrl: '/common-faults',
                });
                setReminderSet(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span>Common Fault Solutions</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Coming Soon
              </span>
            </button>

            {/* Mobile Experience Sharing (Coming Soon) */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setComingSoonFeature({
                  title: 'Experience Sharing',
                  type: 'EXPERIENCE',
                  description: 'Verified community repair logs, before & after case studies, and bench technician tips.',
                  previewUrl: '/experience-share',
                });
                setReminderSet(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              <div className="flex items-center gap-3">
                <MessageSquareQuote className="w-4 h-4 text-purple-500" />
                <span>Experience Sharing</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Coming Soon
              </span>
            </button>

            {isAuthenticated && user?.role === 'SELLER' && (
              <Link
                href="/seller/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Store Profile &amp; Password</span>
                </div>
                {user?.isDefaultPassword && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </Link>
            )}
          </nav>

          {/* Mobile Theme Appearance Switcher */}
          <div className="pt-2 pb-1 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-1">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div className="text-[10px] text-slate-500">
                Toggle dark and light theme
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile Bottom Actions */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl text-xs text-center transition border border-slate-200 dark:border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/#nearby"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs text-center shadow-md transition flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nearby Deals</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                  <span className="block text-[10px] text-slate-500">{roleInfo.label}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMING SOON & REMIND ME MODAL */}
      {comingSoonFeature && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setComingSoonFeature(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setComingSoonFeature(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Icon */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  comingSoonFeature.type === 'FAULT'
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    : 'bg-purple-500/15 text-purple-500 border border-purple-500/30'
                }`}
              >
                {comingSoonFeature.type === 'FAULT' ? (
                  <Wrench className="w-6 h-6" />
                ) : (
                  <MessageSquareQuote className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      comingSoonFeature.type === 'FAULT'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {comingSoonFeature.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {comingSoonFeature.description}
            </p>

            {/* Remind Me Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Get Notified When It Launches
                </span>
              </div>

              {reminderSet ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>
                    Reminder set! We will notify <strong>{reminderEmail}</strong> as soon as this feature goes live.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSetReminder} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={reminderEmail}
                      onChange={(e) => setReminderEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition whitespace-nowrap"
                    >
                      Remind Me
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    No spam. We'll only send a single ping when the module opens for public release.
                  </p>
                </form>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setComingSoonFeature(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>

              {comingSoonFeature.previewUrl && (
                <Link
                  href={comingSoonFeature.previewUrl}
                  onClick={() => setComingSoonFeature(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition"
                >
                  <span>Preview Early Draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}