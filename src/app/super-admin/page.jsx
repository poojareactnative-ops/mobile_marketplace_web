'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CommissionCalculator from '../../components/CommissionCalculator';
import SuperAdminOnboardSellerModal from '../../components/SuperAdminOnboardSellerModal';
import NotificationBell from '../../components/NotificationBell';
import RoleGuard from '../../components/RoleGuard';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck, Store, Users, Banknote, Clock, TrendingUp, Layers,
  Wrench, Plus, Search, Filter, RefreshCw, AlertCircle, FileText,
  DollarSign, ChevronRight, Sparkles, Phone, Mail, MapPin, CheckCircle2,
  Menu, X, LogOut, ArrowLeft, LayoutDashboard, Home, ExternalLink,
  Cpu, KeyRound, ArrowUpRight, BarChart3, Check, Smartphone, Shield,
  Building2, UserCheck, UserX
} from 'lucide-react';

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Sidebar Mobile Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active Navigation Tab
  // 'OVERVIEW' | 'COMMISSIONS' | 'SHOPS' | 'SELLERS' | 'REPAIRS' | 'CALCULATOR'
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Real Supabase Data States
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [overview, setOverview] = useState({});
  const [shops, setShops] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');
  const [adminActionLoading, setAdminActionLoading] = useState(null);

  // Modals
  const [isOnboardSellerOpen, setIsOnboardSellerOpen] = useState(false);

  // Load platform-wide data
  const loadPlatformData = useCallback(async () => {
    try {
      setLoading(true);
      const [c, o, sh, se, j, adm] = await Promise.all([
        supabaseService.getCommissions(),
        supabaseService.getPlatformOverview(),
        supabaseService.getShops(),
        supabaseService.getAllSellers(),
        supabaseService.getRepairJobs(),
        supabaseService.getAllAdmins(),
      ]);

      setCommissions(c || { data: [], summary: {} });
      setOverview(o?.stats || {});
      setShops(sh || []);
      setSellers(se || []);
      setJobs(j || []);
      setAdmins(adm || []);
    } catch (err) {
      console.error('Failed to load Super Admin governance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlatformData();
  }, [loadPlatformData]);

  const handleSignOut = () => {
    logout('/');
  };

  // Super Admin Accept Admin
  const handleAcceptAdmin = async (adminId) => {
    try {
      setAdminActionLoading(adminId);
      await supabaseService.updateAdminStatus(adminId, 'ACTIVE');
      await loadPlatformData();
    } catch (err) {
      alert('Error accepting admin: ' + err.message);
    } finally {
      setAdminActionLoading(null);
    }
  };

  // Super Admin Reject Admin
  const handleRejectAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to reject this Repair Shop Admin? They will be blocked from accessing workshop controls.')) return;
    try {
      setAdminActionLoading(adminId);
      await supabaseService.updateAdminStatus(adminId, 'REJECTED');
      await loadPlatformData();
    } catch (err) {
      alert('Error rejecting admin: ' + err.message);
    } finally {
      setAdminActionLoading(null);
    }
  };

  const handleSellerCreated = async (sellerData) => {
    const created = await supabaseService.onboardSeller(sellerData, user);
    await loadPlatformData();
    return created;
  };

  // Filtered commissions
  const filteredCommissions = (commissions.data || []).filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (c.ticket_id && c.ticket_id.toLowerCase().includes(q)) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(q)) ||
      (c.seller_name && c.seller_name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // Filtered admins
  const pendingAdminsCount = admins.filter(a => a.status === 'PENDING').length;
  const filteredAdmins = admins.filter((a) => {
    const matchesStatus =
      adminStatusFilter === 'ALL' ||
      a.status === adminStatusFilter ||
      (adminStatusFilter === 'REJECTED' && a.status === 'SUSPENDED');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q)) ||
      (a.shopName && a.shopName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // Filtered shops
  const filteredShops = shops.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q))
    );
  });

  // Filtered sellers
  const filteredSellers = sellers.filter((se) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      (se.name && se.name.toLowerCase().includes(q)) ||
      (se.email && se.email.toLowerCase().includes(q)) ||
      (se.phone && se.phone.includes(q))
    );
  });

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (j.ticket_id && j.ticket_id.toLowerCase().includes(q)) ||
      (j.customer_name && j.customer_name.toLowerCase().includes(q)) ||
      (j.device_model && j.device_model.toLowerCase().includes(q)) ||
      (j.seller_name && j.seller_name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // Navigation Items with counters
  const navItems = [
    {
      id: 'OVERVIEW',
      label: 'Executive Overview',
      icon: BarChart3,
      count: 'Macro KPIs',
      countClass: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'COMMISSIONS',
      label: '2% Commission Ledger',
      icon: DollarSign,
      count: commissions.data?.length || 0,
      countClass: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'ADMINS',
      label: 'Workshop Admins',
      icon: Building2,
      count: pendingAdminsCount > 0 ? `${pendingAdminsCount} Pending` : admins.length,
      countClass: pendingAdminsCount > 0 ? 'bg-amber-500/20 text-amber-300 animate-pulse font-bold' : 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'SHOPS',
      label: 'Repair Shop Centers',
      icon: Store,
      count: shops.length || overview.totalShops || 0,
      countClass: 'bg-blue-500/20 text-blue-300',
    },
    {
      id: 'SELLERS',
      label: 'Accessory Sellers',
      icon: Users,
      count: sellers.length || overview.totalSellers || 0,
      countClass: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'REPAIRS',
      label: 'Cross-Shop Repair Queue',
      icon: Wrench,
      count: jobs.length || 0,
      countClass: 'bg-slate-800 text-slate-400',
    },
    {
      id: 'CALCULATOR',
      label: '2% Rate Simulator',
      icon: Layers,
      count: 'Tool',
      countClass: 'bg-slate-800 text-slate-400',
    },
  ];

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-purple-500 selection:text-white">

        {/* MOBILE SIDEBAR BACKDROP */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          />
        )}

        {/* ============================================================== */}
        {/* SIDEBAR NAVIGATION (MATCHES ADMIN & SELLER WORKSPACE SHELL)   */}
        {/* ============================================================== */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
            }`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto">

            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition">
                  <ShieldCheck className="w-5 h-5 text-white font-black" />
                </div>
                <div>
                  <div className="font-black text-sm tracking-tight text-white group-hover:text-purple-300 transition">
                    SmartFix Hub
                  </div>
                  <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                    Super Admin Console
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Summary Card */}
            <div className="p-4 mx-3 my-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-inner shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Master Super Admin'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email || 'superadmin@smartfix.com'}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-purple-300 tracking-wider">
                    Level 4 Root Authority
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Governance Modules
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${isActive ? 'bg-white/20 text-white' : item.countClass
                        }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Sidebar Footer with Logout */}
          <div className="p-4 border-t border-slate-800/80 space-y-2">
            <Link
              href="/"
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Home className="w-4 h-4" />
              <span>Public Marketplace</span>
              <ExternalLink className="w-3 h-3 ml-auto text-slate-500" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Vault</span>
            </button>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* MAIN APPLICATION WORKSPACE CONTENT AREA                        */}
        {/* ============================================================== */}
        <div className="lg:pl-72 flex-1 flex flex-col min-w-0">

          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span>Platform Governance</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-purple-400 font-bold uppercase tracking-wider">
                    {navItems.find((n) => n.id === activeTab)?.label}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  Master Platform Administration
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <NotificationBell />

              <button
                type="button"
                onClick={loadPlatformData}
                disabled={loading}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center space-x-2"
                title="Refresh Supabase Ledger"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </button>
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-300">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono text-[11px]">Audit Active</span>
              </div>
            </div>
          </header>

          {/* Workspace Body */}
          <main className="p-4 sm:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">

            {/* Macro KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">

              {/* Card 1: Registered Shops */}
              <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Partner Repair Hubs</span>
                  <Store className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  {overview.totalShops || shops.length || 0}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified repair centers</span>
                </div>
              </div>

              {/* Card 2: Registered Sellers */}
              <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Accessory Partners</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-400">
                  {overview.totalSellers || sellers.length || 0}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Affiliated accessory stores</span>
                </div>
              </div>

              {/* Card 3: Total Repair Volume */}
              <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Gross Repair Volume</span>
                  <Banknote className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  ₹{Number(overview.totalRepairVolume || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500">
                  {overview.completedRepairs || 0} completed repair jobs
                </div>
              </div>

              {/* Card 4: 2% Referral Commission Settled */}
              <div className="bg-slate-900/90 border border-slate-800/90 p-4 sm:p-5 rounded-3xl space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>2% Referral Settled</span>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">
                  ₹{Number(overview.totalCommissionPaid || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Paid to sellers</span>
                  {Number(overview.totalCommissionPending || 0) > 0 && (
                    <span className="text-rose-400 font-bold">
                      ₹{Number(overview.totalCommissionPending || 0).toLocaleString('en-IN')} pending
                    </span>
                  )}
                </div>
              </div>

              {/* Card 5: SmartFix Platform Revenue (1% Tech Fee Vault) */}
              <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-purple-950/60 to-indigo-950/60 border border-purple-500/40 p-4 sm:p-5 rounded-3xl space-y-2 relative overflow-hidden shadow-lg shadow-purple-500/10">
                <div className="flex items-center justify-between text-purple-300 text-xs font-semibold">
                  <span>SmartFix 1% Vault</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  ₹{Number(overview.totalPlatformRevenue || Math.round((overview.totalRepairVolume || 0) * 0.01)).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-purple-300/80 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Platform Tech Revenue</span>
                </div>
              </div>

            </div>

            {/* Search & Filter Toolbar for Tabs */}
            {activeTab !== 'OVERVIEW' && activeTab !== 'CALCULATOR' && (
              <div className="bg-slate-900/80 border border-slate-800/80 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ticket, store, seller name, or phone..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition font-medium"
                  />
                </div>

                {(activeTab === 'COMMISSIONS' || activeTab === 'REPAIRS') && (
                  <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
                    {['ALL', 'PAID', 'PENDING'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition text-xs flex-1 sm:flex-none ${statusFilter === st
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 1: EXECUTIVE OVERVIEW                                      */}
            {/* ============================================================== */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">

                {/* Banner */}
                <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-bl-full pointer-events-none" />
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-3 border border-purple-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Platform Governance Active</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Master Platform Overview &amp; Ecosystem Ledger
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Cross-entity audit trail supervising verified repair shop centers, affiliated accessory sellers, device diagnostic queues, and automated 2% referral commission payouts.
                  </p>
                </div>

                {/* Quick Shortcuts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('COMMISSIONS')}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                    </div>
                    <div className="text-sm font-bold text-white">2% Commission Audit</div>
                    <div className="text-xs text-slate-400 mt-1">Review referral records and pending payouts across all shops</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('SHOPS')}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Store className="w-5 h-5 text-blue-400" />
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                    </div>
                    <div className="text-sm font-bold text-white">Repair Shop Hubs</div>
                    <div className="text-xs text-slate-400 mt-1">Audit verified repair centers, locations, and owner accounts</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('SELLERS')}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                    </div>
                    <div className="text-sm font-bold text-white">Accessory Sellers</div>
                    <div className="text-xs text-slate-400 mt-1">Manage affiliated accessory store partners and referral status</div>
                  </button>
                </div>

                {/* Recent Commission Entries Preview */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Recent 2% Referral Commission Entries</h3>
                      <p className="text-xs text-slate-400">Live feed of referred walk-ins converted to repair revenue</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('COMMISSIONS')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold inline-flex items-center gap-1"
                    >
                      <span>View Full Ledger</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="py-12 text-center text-xs text-slate-500">Loading ledger records...</div>
                  ) : commissions.data?.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">No commission records yet.</div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {commissions.data.slice(0, 5).map((c) => (
                        <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-amber-400 mr-2">{c.ticket_id}</span>
                            <span className="text-slate-300 font-medium">{c.shop_name || 'Repair Partner'}</span>
                            <span className="text-slate-500 mx-1.5">&bull;</span>
                            <span className="text-slate-400">{c.seller_name || 'Seller Partner'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">Bill: ₹{c.final_repair_amount}</span>
                            <span className="font-black text-emerald-400">2%: ₹{c.commission_amount}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${c.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}>
                              {c.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: 2% COMMISSION LEDGER (MASTER AUDIT)                     */}
            {/* ============================================================== */}
            {activeTab === 'COMMISSIONS' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-white">Platform-wide 2% Referral Commission Audit Trail</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Immutable audit ledger tracking referral earnings and settlements across all shops</p>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{filteredCommissions.length} records</span>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading audit ledger from Supabase...</span>
                  </div>
                ) : filteredCommissions.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-xs space-y-3">
                    <Clock className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="font-extrabold text-base text-slate-300">No commission records match filter</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Referral commission logs will appear here as repair centers complete jobs referred by accessory partners.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Ticket</th>
                          <th className="py-3 px-4">Repair Shop Hub</th>
                          <th className="py-3 px-4">Accessory Seller Partner</th>
                          <th className="py-3 px-4">Bill Amount</th>
                          <th className="py-3 px-4 text-emerald-400 font-bold">Seller 2%</th>
                          <th className="py-3 px-4 text-purple-400 font-bold">Super Admin 1%</th>
                          <th className="py-3 px-4 text-amber-400 font-bold">Admin Net</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Payment Ref</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium">
                        {filteredCommissions.map((c) => {
                          const bill = Number(c.final_repair_amount || 0);
                          const sellerFee = Number(c.commission_amount || 0);
                          const superAdminFee = Math.round(bill * 0.01);
                          const adminNet = bill - sellerFee - superAdminFee;
                          return (
                            <tr key={c.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.ticket_id}</td>
                              <td className="py-3.5 px-4 text-slate-200">{c.shop_name || 'Repair Partner'}</td>
                              <td className="py-3.5 px-4 text-slate-200">{c.seller_name || 'Seller Partner'}</td>
                              <td className="py-3.5 px-4 font-bold text-white">₹{bill.toLocaleString('en-IN')}</td>
                              <td className="py-3.5 px-4 font-black text-emerald-400">₹{sellerFee.toLocaleString('en-IN')}</td>
                              <td className="py-3.5 px-4 font-black text-purple-400">₹{superAdminFee.toLocaleString('en-IN')}</td>
                              <td className="py-3.5 px-4 font-black text-amber-400">₹{adminNet.toLocaleString('en-IN')}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${c.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                                {c.payment_reference || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: WORKSHOP ADMINS GOVERNANCE (ACCEPT / REJECT)              */}
            {/* ============================================================== */}
            {activeTab === 'ADMINS' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
                <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm sm:text-base font-extrabold text-white">Repair Shop Admin Applications &amp; Governance</h2>
                      {pendingAdminsCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                          {pendingAdminsCount} Awaiting Review
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Review, accept, or reject workshop owner registrations. Accepted admins gain workshop control; rejected admins are blocked.
                    </p>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
                    {['ALL', 'PENDING', 'ACTIVE', 'REJECTED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setAdminStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          adminStatusFilter === st
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{st === 'ALL' ? 'All Admins' : st}</span>
                        {st === 'PENDING' && pendingAdminsCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading registered admins...</span>
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-xs space-y-3">
                    <Building2 className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="font-extrabold text-base text-slate-300">No admins match this filter</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {adminStatusFilter === 'PENDING' 
                        ? 'There are currently no pending repair shop admin applications awaiting approval.'
                        : 'Registered workshop owners will appear here for governance review.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Admin Name &amp; Phone</th>
                          <th className="py-3 px-4">Login Email</th>
                          <th className="py-3 px-4">Repair Workshop / Hub</th>
                          <th className="py-3 px-4">Admin Volume &amp; Net Income</th>
                          <th className="py-3 px-4 text-purple-400 font-bold">Super Admin 1% Cut</th>
                          <th className="py-3 px-4">Approval Status</th>
                          <th className="py-3 px-4 text-right">Governance Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium">
                        {filteredAdmins.map((adm) => {
                          const isActioning = adminActionLoading === adm.id;
                          return (
                            <tr key={adm.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white text-sm">{adm.name}</div>
                                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <span>{adm.phone || 'No phone'}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{adm.email}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-white flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <span>{adm.shopName || 'Workshop'}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {adm.shopAddress || 'Local Address'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white text-xs">
                                  ₹{Number(adm.totalVolume || 0).toLocaleString('en-IN')} Gross
                                </div>
                                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                                  ₹{Number(adm.adminNetIncome || 0).toLocaleString('en-IN')} Net ({adm.completedJobs || 0} repairs)
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono">
                                <div className="font-black text-purple-300 text-xs">
                                  ₹{Number(adm.superAdminCommission || 0).toLocaleString('en-IN')}
                                </div>
                                <div className="text-[10px] text-slate-400">1% of volume</div>
                              </td>

                              <td className="py-3.5 px-4">
                                {adm.status === 'ACTIVE' && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>APPROVED / ACTIVE</span>
                                  </span>
                                )}
                                {adm.status === 'PENDING' && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    <span>PENDING APPROVAL</span>
                                  </span>
                                )}
                                {(adm.status === 'REJECTED' || adm.status === 'SUSPENDED') && (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-rose-400" />
                                    <span>REJECTED</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {adm.status !== 'ACTIVE' && (
                                    <button
                                      type="button"
                                      disabled={isActioning}
                                      onClick={() => handleAcceptAdmin(adm.id)}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition flex items-center gap-1.5 disabled:opacity-50"
                                      title="Accept and grant workshop admin privileges"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>{isActioning ? 'Updating...' : 'Accept Admin'}</span>
                                    </button>
                                  )}

                                  {adm.status !== 'REJECTED' && adm.status !== 'SUSPENDED' && (
                                    <button
                                      type="button"
                                      disabled={isActioning}
                                      onClick={() => handleRejectAdmin(adm.id)}
                                      className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition flex items-center gap-1.5 disabled:opacity-50"
                                      title="Reject and block access to workshop controls"
                                    >
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>{isActioning ? 'Updating...' : 'Reject Admin'}</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: REPAIR SHOP CENTERS                                     */}
            {/* ============================================================== */}
            {activeTab === 'SHOPS' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-white">Registered Repair Shop Hubs</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Directory of all verified repair center hubs on SmartFix</p>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{filteredShops.length} stores</span>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading repair shops from Supabase...</span>
                  </div>
                ) : filteredShops.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-xs space-y-3">
                    <Store className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="font-extrabold text-base text-slate-300">No repair shop records found</p>
                    <p className="text-xs text-slate-500">Registered shops will display here automatically.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Shop Name</th>
                          <th className="py-3 px-4">Address / Area</th>
                          <th className="py-3 px-4">Contact Phone</th>
                          <th className="py-3 px-4">Verification</th>
                          <th className="py-3 px-4">Owner ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium">
                        {filteredShops.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                              <Store className="w-4 h-4 text-blue-400 shrink-0" />
                              <span>{s.name}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">{s.address || 'Local Hub'}</td>
                            <td className="py-3.5 px-4 text-slate-300 font-mono">{s.phone || '—'}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {s.is_verified ? 'VERIFIED' : 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                              {s.owner_id ? s.owner_id.slice(0, 10) + '...' : 'System'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: ACCESSORY SELLERS                                       */}
            {/* ============================================================== */}
            {activeTab === 'SELLERS' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-white">Affiliated Accessory Seller Partners</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Directory of registered accessory merchants partnering with repair shops for 2% referral revenue</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold hidden md:inline">{filteredSellers.length} sellers</span>
                    <button
                      type="button"
                      onClick={() => setIsOnboardSellerOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/25 transition flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Onboard Seller Under Admin</span>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading sellers from Supabase...</span>
                  </div>
                ) : filteredSellers.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-xs space-y-4">
                    <Users className="w-10 h-10 mx-auto text-slate-600" />
                    <div>
                      <p className="font-extrabold text-base text-slate-300">No accessory sellers registered yet</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        You can onboard an accessory merchant and assign them directly to any registered Repair Shop Admin.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOnboardSellerOpen(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Onboard First Seller</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Seller &amp; Store Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Contact Phone</th>
                          <th className="py-3 px-4">Assigned Repair Hub &amp; Admin</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium">
                        {filteredSellers.map((se) => (
                          <tr key={se.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{se.name}</span>
                              </div>
                              {se.shopName && (
                                <div className="text-[10px] text-slate-400 font-normal pl-6">{se.shopName}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{se.email}</td>
                            <td className="py-3.5 px-4 text-slate-300 font-mono">{se.phone || '—'}</td>
                            <td className="py-3.5 px-4">
                              <div className="text-white font-semibold text-xs">{se.shop_name || 'Repair Partner Hub'}</div>
                              {se.assignedAdminName && (
                                <div className="text-[10px] text-purple-400 font-mono">Admin: {se.assignedAdminName}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ACTIVE
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>Active Partner</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: CROSS-SHOP REPAIR QUEUE                                */}
            {/* ============================================================== */}
            {activeTab === 'REPAIRS' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-white">Cross-Shop Diagnostic &amp; Repair Queue</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">Real-time status of device repair tickets across all partner shops</p>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{filteredJobs.length} tickets</span>
                </div>

                {loading ? (
                  <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading repair tickets from Supabase...</span>
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 text-xs space-y-3">
                    <Wrench className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="font-extrabold text-base text-slate-300">No repair tickets found</p>
                    <p className="text-xs text-slate-500">All repair tickets created across the platform will display here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Ticket</th>
                          <th className="py-3 px-4">Device</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Referred By</th>
                          <th className="py-3 px-4">Estimated</th>
                          <th className="py-3 px-4">Final Bill</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-medium">
                        {filteredJobs.map((j) => (
                          <tr key={j.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{j.ticket_id}</td>
                            <td className="py-3.5 px-4 text-white font-bold">
                              <div>{j.device_brand} {j.device_model}</div>
                              <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{j.problem_description}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <div>{j.customer_name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{j.customer_phone}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              {j.seller_name || 'Direct Hub Walk-In'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">₹{j.estimated_cost || 0}</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-400">
                              {j.final_amount ? `₹${j.final_amount}` : '—'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${j.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : j.status === 'IN_PROGRESS'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}>
                                {j.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 6: 2% COMMISSION RATE SIMULATOR TOOL                       */}
            {/* ============================================================== */}
            {activeTab === 'CALCULATOR' && (
              <div className="space-y-4">
                <CommissionCalculator initialAmount={3500} />
              </div>
            )}

          </main>
        </div>

        {/* Modal: Super Admin Onboard Seller Under Admin */}
        <SuperAdminOnboardSellerModal
          isOpen={isOnboardSellerOpen}
          onClose={() => setIsOnboardSellerOpen(false)}
          onSellerCreated={handleSellerCreated}
          superAdminUser={user}
        />

      </div>
    </RoleGuard>
  );
}
