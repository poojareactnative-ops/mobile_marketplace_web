'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import CommissionCalculator from '../../components/CommissionCalculator';
import AdminCompleteRepairModal from '../../components/AdminCompleteRepairModal';
import AdminPayCommissionModal from '../../components/AdminPayCommissionModal';
import AdminOnboardSellerModal from '../../components/AdminOnboardSellerModal';
import SellerReferralModal from '../../components/SellerReferralModal';
import RoleGuard from '../../components/RoleGuard';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench, Store, Plus, Search,
  CheckCircle2, Clock, AlertCircle, ArrowLeft, RefreshCw,
  LogIn, UserPlus, Phone, MessageSquare
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, role, isAuthenticated, loading: authLoading } = useAuth();

  // Smart redirect: automatically navigate to the dedicated, full-screen dashboard for this role
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (role === 'ADMIN') {
        router.replace('/admin');
      } else if (role === 'SELLER') {
        router.replace('/seller');
      } else if (role === 'SUPER_ADMIN') {
        router.replace('/super-admin');
      }
    }
  }, [isAuthenticated, authLoading, role, router]);

  const [loading, setLoading] = useState(true);

  // Data states (Real Supabase data)
  const [jobs, setJobs] = useState([]);
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [platformStats, setPlatformStats] = useState({});
  const [sellers, setSellers] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Active Tab inside Workbench (distinct SaaS app layout)
  const [activeTab, setActiveTab] = useState('MAIN'); // 'MAIN' | 'TRACKER' | 'QUERIES' | 'COMMISSIONS' | 'SELLERS'

  // Modals state
  const [completingJob, setCompletingJob] = useState(null);
  const [payingCommission, setPayingCommission] = useState(null);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  // Dedicated Ticket tracking state (for Seller & Admin)
  const [ticketInput, setTicketInput] = useState('');
  const [trackedJob, setTrackedJob] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Load data specific to the active role
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load incoming inquiries for the active shop / role
      const inqFilter = role === 'ADMIN' ? { ownerRole: 'ADMIN' } : (role === 'SELLER' ? { ownerRole: 'SELLER' } : {});
      const inqPromise = supabaseService.getInquiries(inqFilter);

      if (role === 'SELLER') {
        const [jobsData, commData, inqData] = await Promise.all([
          supabaseService.getRepairJobs({ sellerId: user?.id }),
          supabaseService.getCommissions({ sellerId: user?.id }),
          inqPromise,
        ]);
        setJobs(jobsData || []);
        setCommissions(commData || { data: [], summary: {} });
        setInquiries(inqData || []);
      } else if (role === 'ADMIN') {
        const [jobsData, commData, sellersData, inqData] = await Promise.all([
          supabaseService.getRepairJobs({ adminId: user?.id }),
          supabaseService.getCommissions({ adminId: user?.id }),
          supabaseService.getAffiliatedSellers(user?.id),
          inqPromise,
        ]);
        setJobs(jobsData || []);
        setCommissions(commData || { data: [], summary: {} });
        setSellers(sellersData || []);
        setInquiries(inqData || []);
      } else if (role === 'SUPER_ADMIN') {
        const [commData, overData, inqData] = await Promise.all([
          supabaseService.getCommissions(),
          supabaseService.getPlatformOverview(),
          inqPromise,
        ]);
        setCommissions(commData || { data: [], summary: {} });
        setPlatformStats(overData?.stats || {});
        setInquiries(inqData || []);
      }
    } catch (err) {
      console.warn('Data load notice:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadData]);

  // Handle Admin status change
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await supabaseService.updateRepairStatus(jobId, newStatus);
      await loadData();
    } catch (e) {
      alert('Status update failed: ' + e.message);
    }
  };

  // Handle Admin complete job
  const handleCompleteJob = async (jobId, amount, notes) => {
    const res = await supabaseService.completeRepairJob(jobId, amount, notes);
    await loadData();
    alert(`Repair completed! Final bill: ₹${amount.toLocaleString('en-IN')}. Referring seller 2% commission ₹${res.sellerCommission} recorded as PENDING.`);
  };

  // Handle Admin pay commission
  const handlePayCommission = async (commId, paymentRef) => {
    await supabaseService.paySellerCommission(commId, paymentRef);
    await loadData();
    alert('2% Commission marked as PAID to Seller!');
  };

  // Handle Seller referral creation
  const handleCreateReferral = async (referralData) => {
    const res = await supabaseService.createRepairReferral({
      ...referralData,
      sellerId: user?.id,
      sellerName: user?.shopName || user?.name || 'Seller Partner',
      adminId: user?.adminId || null,
      shopId: user?.shopId || null,
    });
    await loadData();
    alert(`Referral created successfully! Ticket ID: ${res.ticket_id}`);
  };

  // Handle Admin onboard seller partner
  const handleSellerOnboarded = async (sellerData) => {
    const created = await supabaseService.onboardSeller(sellerData, user);
    await loadData();
    return created;
  };

  // Handle Ticket Lookup (Used in Seller & Admin tracker)
  const handleTrackTicket = async (targetTicketId) => {
    const idToSearch = (targetTicketId || ticketInput).trim();
    if (!idToSearch) return;

    try {
      setTrackingLoading(true);
      setTrackingError('');
      const res = await supabaseService.trackRepair(idToSearch);
      setTrackedJob(res);
      setTicketInput(idToSearch);
    } catch (err) {
      setTrackedJob(null);
      setTrackingError(err.message || 'Ticket not found in database');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, status) => {
    await supabaseService.updateInquiryStatus(inquiryId, status);
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not signed in, show clean authentication prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
        <Navbar />
        <main className="max-w-md mx-auto my-auto px-4 py-16 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-xl">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">Private Operations Workbench</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Dashboard is an authenticated partner workbench for Repair Admins, Accessory Sellers, and Super Admins. Please sign in to access your repair queues and 2% commission ledger.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Partner Sign In</span>
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Repair Shop</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const roleMeta = {
    ADMIN: {
      title: 'Repair Center Operations Workbench',
      badge: '🛠️ Admin Console',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Receive walk-in referrals from affiliated sellers, complete repairs, record bills, and settle 2% commission.',
    },
    SELLER: {
      title: 'Accessory Store Referral & Earnings Portal',
      badge: '🏪 Seller Partner (2%)',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Refer walk-in mobile repair customers to your partner shop, track real-time repair tickets, and earn guaranteed 2% commission.',
    },
    SUPER_ADMIN: {
      title: 'Global Platform Governance & Audit',
      badge: '🛡️ Super Admin Audit',
      badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'Platform owner oversight: real-time shop registry, platform repair volume, and tamper-proof commission ledger.',
    },
    CUSTOMER: {
      title: 'Customer Ticket Center',
      badge: '📱 Customer View',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      description: 'Review your device repair diagnostics, assigned workshop, and billing.',
    },
  }[role] || {
    title: 'Operations Dashboard',
    badge: role,
    badgeClass: 'bg-slate-800 text-slate-300',
    description: '',
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950">

      {/* Top Navbar */}
      <Navbar />

      {/* DISTINCT SAAS WORKBENCH APP BAR */}
      <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Identity & Breadcrumb */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700"
              title="Return to Public Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Public Site</span>
            </Link>

            <span className="text-slate-700 font-bold">/</span>

            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleMeta.badgeClass}`}>
                {roleMeta.badge}
              </span>
              <span className="text-xs font-black text-white">
                {user.shopName || user.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Supabase Connected" />
            </div>
          </div>

          {/* Quick Action Commands */}
          <div className="flex items-center space-x-2.5">
            {role === 'SELLER' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsReferralOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition transform hover:-translate-y-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Refer Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('TRACKER');
                    setTicketInput('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${activeTab === 'TRACKER'
                    ? 'bg-blue-600 text-white border-blue-500 shadow'
                    : 'bg-slate-950 text-blue-400 border-slate-800 hover:border-blue-500/50'
                    }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Ticket</span>
                </button>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition transform hover:-translate-y-0.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Onboard Seller</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('TRACKER');
                    setTicketInput('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${activeTab === 'TRACKER'
                    ? 'bg-blue-600 text-white border-blue-500 shadow'
                    : 'bg-slate-950 text-blue-400 border-slate-800 hover:border-blue-500/50'
                    }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Ticket</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={loadData}
              className="p-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 transition text-xs flex items-center gap-1.5 font-medium"
              title="Sync Supabase Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">

        {/* Workspace Title & Purpose */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {roleMeta.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {roleMeta.description}
            </p>
          </div>

          {/* Quick tab switcher for Seller */}
          {role === 'SELLER' && (
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('MAIN')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${activeTab === 'MAIN'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>Referral Queue</span>
                <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px] font-black">{jobs.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('QUERIES')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${activeTab === 'QUERIES'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Customer Queries</span>
                {inquiries.filter(i => i.status === 'NEW').length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
                    {inquiries.filter(i => i.status === 'NEW').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TRACKER')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${activeTab === 'TRACKER'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Repair Ticket</span>
              </button>
            </div>
          )}

          {/* Quick tab switcher for Admin */}
          {role === 'ADMIN' && (
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('MAIN')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${activeTab === 'MAIN'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>Repair Queue</span>
                <span className="px-1.5 py-0.2 bg-black/30 rounded-full text-[10px] font-black">{jobs.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('QUERIES')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${activeTab === 'QUERIES'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Customer Queries</span>
                {inquiries.filter(i => i.status === 'NEW').length > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black">
                    {inquiries.filter(i => i.status === 'NEW').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TRACKER')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${activeTab === 'TRACKER'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Ticket Inspector</span>
              </button>
            </div>
          )}
        </div>

        {/* Customer Queries Inbox View (when QUERIES tab active) */}
        {activeTab === 'QUERIES' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-extrabold text-white">Incoming Customer Inquiries</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct inquiries submitted by customers for your products (zero customer account required).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">{inquiries.length} total inquiries</span>
                {inquiries.filter(i => i.status === 'NEW').length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {inquiries.filter(i => i.status === 'NEW').length} New
                  </span>
                )}
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <div className="text-sm font-bold text-white">No customer queries received yet</div>
                <p className="text-xs text-slate-400">
                  When visitors inquire about your products on the marketplace, their messages will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => {
                  const cleanPhone = (inq.customer_phone || '').replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                    `Hello ${inq.customer_name}! Regarding your inquiry for "${inq.item_title}" on SmartFix Hub...`
                  )}`;

                  return (
                    <div key={inq.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-xs">{inq.customer_name}</span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full border ${inq.status === 'NEW' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                              {inq.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span className="font-mono text-slate-300">{inq.customer_phone}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-extrabold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            {inq.item_title}
                          </span>
                        </div>
                      </div>

                      {inq.message && (
                        <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                          &ldquo;{inq.message}&rdquo;
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-[10px] text-slate-500">
                          Received: {new Date(inq.created_at).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${inq.customer_phone}`}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span>Call</span>
                          </a>
                          {inq.status === 'NEW' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'CONTACTED')}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                            >
                              Mark Contacted
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'NEW')}
                              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-300 text-xs transition"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 1: SELLER WORKBENCH (WITH INTEGRATED TICKET TRACKER)   */}
        {/* ============================================================ */}
        {role === 'SELLER' && (
          <div className="space-y-8">

            {/* KPI Cards for Seller */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full pointer-events-none" />
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                  <span>Referred Walk-ins</span>
                  <Store className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">{jobs.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">Referred to partner repair shop</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full pointer-events-none" />
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                  <span>Pending 2% Commissions</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400 mt-2">
                  ₹{(commissions.summary?.pendingCommission || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-amber-400/80 mt-1">Completed repairs awaiting payout</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                  <span>Total 2% Received (Paid)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400 mt-2">
                  ₹{(commissions.summary?.paidCommission || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Directly settled by admin via UPI</div>
              </div>
            </div>

            {/* DEDICATED SELLER TICKET TRACKER TOOL */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    <h2 className="text-base font-extrabold text-white">
                      Track Customer Repair Ticket
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When a walk-in customer inquires about their phone, enter their Ticket ID to verify diagnostic status, repair progress, and bill.
                  </p>
                </div>
                {trackedJob && (
                  <button
                    type="button"
                    onClick={() => {
                      setTrackedJob(null);
                      setTicketInput('');
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Clear Lookup
                  </button>
                )}
              </div>

              {/* Ticket Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTrackTicket(ticketInput);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. REP-1048)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-blue-500 transition shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{trackingLoading ? 'Looking up...' : 'Lookup Ticket'}</span>
                </button>
              </form>

              {trackingError && (
                <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}

              {/* TRACKED TICKET INSPECTOR CARD */}
              {trackedJob && (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in">

                  {/* Status & Code Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-amber-400 font-extrabold">{trackedJob.ticket_id}</span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${trackedJob.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                          trackedJob.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          }`}>
                          {trackedJob.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-1">
                        {trackedJob.device_brand} {trackedJob.device_model}
                      </h3>
                      <div className="text-xs text-slate-400">
                        Customer: <strong className="text-white">{trackedJob.customer_name}</strong> &bull; {trackedJob.customer_phone}
                      </div>
                    </div>

                    {/* 2% Commission Status Pill */}
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Your 2% Referral Cut</div>
                      <div className="text-xl font-black text-emerald-400 mt-0.5">
                        {trackedJob.seller_commission_amount > 0 ? `₹${trackedJob.seller_commission_amount}` : 'Calculated upon completion'}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${trackedJob.commission_status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        trackedJob.commission_status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                        {trackedJob.commission_status}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Repair Lifecycle Progress */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-400">Repair Stage:</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className={`p-2 rounded-xl border ${['PENDING_APPROVAL', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(trackedJob.status)
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                        1. Referral Received
                      </div>
                      <div className={`p-2 rounded-xl border ${['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(trackedJob.status)
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                        2. Accepted &amp; Queue
                      </div>
                      <div className={`p-2 rounded-xl border ${['IN_PROGRESS', 'COMPLETED'].includes(trackedJob.status)
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                        3. In Repair
                      </div>
                      <div className={`p-2 rounded-xl border ${trackedJob.status === 'COMPLETED'
                        ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}>
                        4. Fixed &amp; Ready
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic details & Workshop Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold">Reported Issue / Problem</div>
                      <div className="text-white font-bold">{trackedJob.problem_description}</div>
                      {trackedJob.notes && (
                        <div className="text-slate-400 pt-1 text-[11px]">
                          <strong>Technician Notes:</strong> {trackedJob.notes}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <div className="text-slate-400 font-semibold">Assigned Repair Center (Admin)</div>
                      <div className="text-white font-bold">{trackedJob.shop_name || 'Partner Repair Hub'}</div>
                      <div className="text-slate-400 text-[11px]">
                        Final Repair Amount: <strong className="text-white">{trackedJob.final_amount > 0 ? `₹${trackedJob.final_amount}` : `Est. ₹${trackedJob.estimated_cost}`}</strong>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* SELLER REFERRED JOBS TABLE */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">My Walk-in Referral Queue</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Inspect Ticket&quot; on any referral to load instant customer tracking info above.</p>
                </div>
                <span className="text-xs text-slate-400">{jobs.length} total referrals</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Device &amp; Issue</th>
                      <th className="py-3 px-4">Repair Status</th>
                      <th className="py-3 px-4">Final Bill</th>
                      <th className="py-3 px-4 font-bold text-emerald-400">My 2% Commission</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{job.ticket_id}</td>
                        <td className="py-3 px-4 font-bold text-white">{job.customer_name}</td>
                        <td className="py-3 px-4">
                          <div className="text-white font-semibold">{job.device_brand} {job.device_model}</div>
                          <div className="text-[11px] text-slate-400">{job.problem_description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            job.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {job.final_amount > 0 ? `₹${job.final_amount.toLocaleString('en-IN')}` : 'In Diagnosis'}
                        </td>
                        <td className="py-3 px-4">
                          {job.seller_commission_amount > 0 ? (
                            <span className="text-emerald-400 font-black text-sm">
                              ₹{job.seller_commission_amount} ({job.commission_status})
                            </span>
                          ) : (
                            <span className="text-slate-500">&mdash; (Earns 2% when done)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleTrackTicket(job.ticket_id)}
                            className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-[11px] font-bold border border-blue-500/30 transition shadow"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {jobs.length === 0 && (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Store className="w-8 h-8 mx-auto text-slate-600" />
                  <div className="font-bold text-white text-sm">No referrals created yet</div>
                  <p className="text-xs text-slate-400">Click &quot;+ Refer Customer&quot; to send your first walk-in repair referral.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 2: ADMIN WORKBENCH (REPAIR SHOP OWNER)                 */}
        {/* ============================================================ */}
        {role === 'ADMIN' && (
          <div className="space-y-8">

            {/* KPI Cards for Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                  <span>Referred Jobs</span>
                  <Store className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white mt-2">{jobs.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">From partner sellers</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                  <span>Active Repairs</span>
                  <Wrench className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400 mt-2">
                  {jobs.filter(j => ['ACCEPTED', 'IN_PROGRESS'].includes(j.status)).length}
                </div>
                <div className="text-[11px] text-amber-400/80 mt-1">Under diagnostics &amp; repair</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                  <span>Pending 2% Owed</span>
                  <Clock className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-black text-rose-400 mt-2">
                  ₹{(commissions.summary?.pendingCommission || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-1">Ready for UPI settlement</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
                  <span>Paid Commissions</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400 mt-2">
                  ₹{(commissions.summary?.paidCommission || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Settled to partners</div>
              </div>
            </div>

            {/* Affiliated Partner Sellers */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-extrabold text-white">Registered Accessory Sellers (2% Referral Partners)</h2>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sellers only sell mobile accessories. You onboard them to refer repair walk-ins to your shop.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardOpen(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard Seller</span>
                </button>
              </div>

              {sellers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">No partner sellers registered yet</div>
                  <p className="text-[11px] text-slate-500">
                    Click &quot;Onboard Seller&quot; to create seller credentials for neighborhood accessory shops.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sellers.map((s) => (
                    <div key={s.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{s.name}</div>
                          <div className="text-[11px] text-emerald-400 font-semibold">{s.shop_name || 'Accessory Partner'}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{s.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repair Job Queue Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Technician Repair Queue</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Manage work orders, diagnose devices, complete jobs, and settle commissions.</p>
                </div>
                <span className="text-xs text-slate-400">{jobs.length} jobs in queue</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Referred By</th>
                      <th className="py-3 px-4">Customer &amp; Device</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Final Bill</th>
                      <th className="py-3 px-4 font-bold text-emerald-400">2% Seller Cut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{job.ticket_id}</td>
                        <td className="py-3 px-4 font-semibold text-white">{job.seller_name || 'Direct Walk-in'}</td>
                        <td className="py-3 px-4">
                          <div className="text-white font-bold">{job.customer_name} ({job.customer_phone})</div>
                          <div className="text-[11px] text-slate-400">{job.device_brand} {job.device_model} &bull; {job.problem_description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            job.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {job.final_amount > 0 ? `₹${job.final_amount.toLocaleString('en-IN')}` : `Est. ₹${job.estimated_cost}`}
                        </td>
                        <td className="py-3 px-4">
                          {job.seller_commission_amount > 0 ? (
                            <span className="text-emerald-400 font-black">
                              ₹{job.seller_commission_amount} ({job.commission_status})
                            </span>
                          ) : (
                            <span className="text-slate-500">&mdash;</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {job.status === 'PENDING_APPROVAL' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(job.id, 'ACCEPTED')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow"
                            >
                              Accept
                            </button>
                          )}
                          {job.status === 'ACCEPTED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(job.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold shadow"
                            >
                              Start Repair
                            </button>
                          )}
                          {job.status === 'IN_PROGRESS' && (
                            <button
                              type="button"
                              onClick={() => setCompletingJob(job)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow"
                            >
                              Complete &amp; Bill (2%)
                            </button>
                          )}
                          {job.status === 'COMPLETED' && job.commission_status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => {
                                const matchingComm = commissions.data.find(c => c.repair_job_id === job.id) || {
                                  id: job.id, ticket_id: job.ticket_id, commission_amount: job.seller_commission_amount,
                                  final_repair_amount: job.final_amount, seller_name: job.seller_name
                                };
                                setPayingCommission(matchingComm);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold shadow"
                            >
                              Pay ₹{job.seller_commission_amount} (2%)
                            </button>
                          )}
                          {job.status === 'COMPLETED' && job.commission_status === 'PAID' && (
                            <span className="text-emerald-400 font-bold text-[11px]">✓ Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 3: SUPER ADMIN COMMAND CENTER                          */}
        {/* ============================================================ */}
        {role === 'SUPER_ADMIN' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-medium">Registered Shops</div>
                <div className="text-3xl font-black text-white mt-1">{platformStats.totalShops || 0}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-medium">Associated Sellers</div>
                <div className="text-3xl font-black text-purple-400 mt-1">{platformStats.totalSellers || 0}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-medium">Gross Repair Volume</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  ₹{platformStats.totalRepairVolume?.toLocaleString('en-IN') || 0}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
                <div className="text-slate-400 text-xs font-medium">Total 2% Referral Paid</div>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  ₹{platformStats.totalCommissionPaid?.toLocaleString('en-IN') || 0}
                </div>
              </div>
            </div>

            {/* Global Audit Ledger */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white">Global 2% Referral Commission Audit Trail</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Referring Seller</th>
                      <th className="py-3 px-4">Bill</th>
                      <th className="py-3 px-4 font-bold text-emerald-400">Seller 2%</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {commissions.data.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.ticket_id}</td>
                        <td className="py-3 px-4 text-slate-300">{c.seller_name}</td>
                        <td className="py-3 px-4 font-bold text-white">₹{c.final_repair_amount}</td>
                        <td className="py-3 px-4 font-black text-emerald-400">₹{c.commission_amount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${c.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {c.payment_reference || '&mdash;'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <AdminCompleteRepairModal
        isOpen={!!completingJob}
        onClose={() => setCompletingJob(null)}
        job={completingJob}
        onCompleted={handleCompleteJob}
      />

      <AdminPayCommissionModal
        isOpen={!!payingCommission}
        onClose={() => setPayingCommission(null)}
        commission={payingCommission}
        onPaid={handlePayCommission}
      />

      <SellerReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        currentSeller={user}
        onCreated={handleCreateReferral}
      />

      <AdminOnboardSellerModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onSellerCreated={handleSellerOnboarded}
        adminUser={user}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RoleGuard allowedRoles={['ADMIN', 'SELLER', 'SUPER_ADMIN', 'CUSTOMER']}>
        <DashboardContent />
      </RoleGuard>
    </Suspense>
  );
}
