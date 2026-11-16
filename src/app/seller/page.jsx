'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import SellerReferralModal from '../../components/SellerReferralModal';
import ResetDefaultPasswordModal from '../../components/ResetDefaultPasswordModal';
import RoleGuard from '../../components/RoleGuard';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';
import {
  Store, Clock, CheckCircle2, TrendingUp, Banknote, Smartphone,
  Wrench, Search, AlertCircle, MessageSquare, Phone, Plus,
  RefreshCw, DollarSign, ShoppingBag, Trash2, ArrowRight,
  ShieldCheck, Check, Sparkles, Filter, Mail, KeyRound, AlertTriangle,
  UserCheck, Lock, Eye, EyeOff
} from 'lucide-react';

const CATEGORIES = [
  'Chargers & Cables',
  'Cases & Covers',
  'Screen Protectors',
  'Power Banks',
  'Audio',
];

export default function SellerPage() {
  const { user, isDefaultPassword, updatePassword } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('REFERRALS'); // 'REFERRALS' | 'COMMISSIONS' | 'PRODUCTS' | 'INQUIRIES' | 'TRACKER' | 'PROFILE'

  // Reset Default Password Modal State
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // In-tab Profile Password Reset Form State
  const [profileCurrentPwd, setProfileCurrentPwd] = useState('Seller@123');
  const [profileNewPwd, setProfileNewPwd] = useState('');
  const [profileConfirmPwd, setProfileConfirmPwd] = useState('');
  const [profileShowCurrent, setProfileShowCurrent] = useState(false);
  const [profileShowNew, setProfileShowNew] = useState(false);
  const [profileShowConfirm, setProfileShowConfirm] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Auto-prompt Reset Default Password popup on login / mount if default password is still active
  useEffect(() => {
    if (user && user.role === 'SELLER') {
      const pwdInfo = supabaseService.getSellerPasswordInfo(user.email);
      if (pwdInfo?.isDefault || isDefaultPassword) {
        setIsResetPasswordOpen(true);
      }
    }
  }, [user, isDefaultPassword]);

  // Data states
  const [jobs, setJobs] = useState([]);
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'Chargers & Cables',
    price: '',
    stock: '',
  });
  const [productLoading, setProductLoading] = useState(false);

  // Dedicated Ticket tracker state
  const [ticketInput, setTicketInput] = useState('');
  const [trackedJob, setTrackedJob] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Load seller data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [list, comm, inq, prods] = await Promise.all([
        supabaseService.getRepairJobs({ sellerId: user?.id }),
        supabaseService.getCommissions({ sellerId: user?.id }),
        supabaseService.getInquiries({ ownerRole: 'SELLER' }),
        supabaseService.getProducts(),
      ]);
      setJobs(list || []);
      setCommissions(comm || { data: [], summary: {} });
      setInquiries(inq || []);
      setProducts((prods || []).filter(p => p.uploader_name === user?.shopName || p.seller_id === user?.id));
    } catch (err) {
      console.error('Failed to load seller repair jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Handle Create Referral
  const handleCreateReferral = async (data) => {
    await supabaseService.createRepairReferral({
      ...data,
      sellerId: user?.id,
      sellerName: user?.shopName || user?.name || 'Seller Partner',
      adminId: user?.adminId || null,
      shopId: user?.shopId || null,
    });
    await loadData();
  };

  // Handle Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in product name and price');
      return;
    }

    try {
      setProductLoading(true);
      await supabaseService.addProduct({
        ...newProduct,
        sellerId: user?.id,
        uploaderName: user?.shopName || user?.name || 'Accessory Partner',
        uploaderRole: 'SELLER',
      });
      setIsAddProductOpen(false);
      setNewProduct({ name: '', brand: '', category: 'Chargers & Cables', price: '', stock: '' });
      await loadData();
      alert('Product published to marketplace successfully!');
    } catch (err) {
      alert('Error adding product: ' + err.message);
    } finally {
      setProductLoading(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to remove this product from your inventory?')) return;
    try {
      await supabaseService.deleteProduct(id);
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Dedicated Ticket tracking
  const handleTrackTicket = async (e) => {
    e?.preventDefault();
    const cleanTicket = ticketInput.trim().toUpperCase();
    if (!cleanTicket) return;

    try {
      setTrackingLoading(true);
      setTrackingError('');
      setTrackedJob(null);
      const res = await supabaseService.trackTicket(cleanTicket);
      setTrackedJob(res);
    } catch (err) {
      setTrackingError(err.message || 'Ticket not found');
    } finally {
      setTrackingLoading(false);
    }
  };

  // In-tab Password Reset Handler
  const handleInTabPasswordUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileCurrentPwd) {
      setProfileError('Please provide your current default password (default: Seller@123).');
      return;
    }
    if (!profileNewPwd || profileNewPwd.length < 6) {
      setProfileError('New password must be at least 6 characters long.');
      return;
    }
    if (profileNewPwd === 'Seller@123') {
      setProfileError('Please choose a new private password different from "Seller@123".');
      return;
    }
    if (profileNewPwd !== profileConfirmPwd) {
      setProfileError('New password and confirmation do not match.');
      return;
    }

    try {
      setProfileSubmitting(true);
      await updatePassword(profileCurrentPwd, profileNewPwd);
      setProfileSuccess('Password updated successfully! Your account is now secured.');
      setProfileNewPwd('');
      setProfileConfirmPwd('');
      await loadData();
    } catch (err) {
      setProfileError(err.message || 'Failed to update password.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Filtered jobs calculation
  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const q = jobSearch.toLowerCase();
    const matchesSearch =
      !jobSearch ||
      (j.ticket_id && j.ticket_id.toLowerCase().includes(q)) ||
      (j.customer_name && j.customer_name.toLowerCase().includes(q)) ||
      (j.customer_phone && j.customer_phone.includes(q)) ||
      (j.device_model && j.device_model.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const totalCommissionEarned = Number(commissions.summary?.totalCommission || 0);
  const pendingCommission = Number(commissions.summary?.pendingCommission || 0);
  const paidCommission = Number(commissions.summary?.paidCommission || 0);
  const completedJobsCount = jobs.filter(j => j.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <RoleGuard allowedRoles={['SELLER', 'SUPER_ADMIN']}>
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
          
          {/* DEFAULT PASSWORD ALERT BANNER */}
          {(isDefaultPassword || supabaseService.getSellerPasswordInfo(user?.email)?.isDefault) && (
            <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm text-white flex items-center gap-2">
                    <span>Default Password Active &bull; Action Required</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">Seller@123</span>
                  </div>
                  <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                    Your partner store account is currently using the system default password. Please reset your password to secure referral earnings and catalog access.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordOpen(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Reset Password Now</span>
                </button>
                <Link
                  href="/seller/profile"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition border border-slate-700/80 flex items-center gap-1.5"
                >
                  <span>Go to Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* 1. SELLER STORE PROFILE & HEADER */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/30">
                  <Store className="w-3.5 h-3.5" />
                  <span>Affiliated Mobile Accessory Store (2% Referral Partner)</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user?.shopName || user?.name || 'Partner Accessory Store'} &mdash; Partner Workbench
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Refer walk-in customers with damaged phones to your affiliated repair hub, track repair progress, earn strictly 2% on completed billings, and manage your accessory catalog.
                </p>
                {user?.shopName && (
                  <div className="text-xs text-amber-400 font-semibold pt-1">
                    Assigned Partner Repair Hub: <strong>{user?.shopName}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsReferralOpen(true)}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ New Repair Referral Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800/80">
              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total 2% Earned</div>
                <div className="text-xl font-black text-emerald-400 mt-1">₹{totalCommissionEarned.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Payout</div>
                <div className="text-xl font-black text-amber-400 mt-1">₹{pendingCommission.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid to Bank/UPI</div>
                <div className="text-xl font-black text-white mt-1">₹{paidCommission.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Referrals Sent</div>
                <div className="text-xl font-black text-blue-400 mt-1">{jobs.length}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Repairs</div>
                <div className="text-xl font-black text-teal-400 mt-1">{completedJobsCount}</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Products</div>
                <div className="text-xl font-black text-purple-400 mt-1">{products.length}</div>
              </div>
            </div>
          </div>

          {/* 2. TAB CONTROLS */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('REFERRALS')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                activeTab === 'REFERRALS'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Repair Referrals Queue</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40">{jobs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('COMMISSIONS')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                activeTab === 'COMMISSIONS'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>2% Earnings Ledger</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40">₹{pendingCommission}</span>
            </button>

            <button
              onClick={() => setActiveTab('PRODUCTS')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                activeTab === 'PRODUCTS'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Store Inventory</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('INQUIRIES')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                activeTab === 'INQUIRIES'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Leads</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40">{inquiries.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('TRACKER')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                activeTab === 'TRACKER'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Instant Ticket Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                activeTab === 'PROFILE'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Store Profile &amp; Security</span>
              {(isDefaultPassword || supabaseService.getSellerPasswordInfo(user?.email)?.isDefault) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 animate-pulse">
                  Reset Needed
                </span>
              )}
            </button>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: REPAIR REFERRALS QUEUE                                   */}
          {/* ============================================================== */}
          {activeTab === 'REFERRALS' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Search by ticket, customer, phone, device..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {['ALL', 'PENDING_APPROVAL', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        statusFilter === st
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Referrals Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-sm">Customer Referrals Dispatched to Admin Hub</h3>
                  <button
                    onClick={() => setIsReferralOpen(true)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    + Create New Referral
                  </button>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-slate-400 text-xs">Loading referrals from Supabase...</div>
                ) : filteredJobs.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-3">
                    <Smartphone className="w-10 h-10 mx-auto text-slate-700" />
                    <div className="text-sm font-bold text-slate-300">No referral tickets found</div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      When a customer visits your store with a damaged phone, click &quot;+ New Repair Referral Ticket&quot; to send the job to the partner repair hub and earn 2%.
                    </p>
                    <button
                      onClick={() => setIsReferralOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                    >
                      Create First Referral
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3.5 px-4">Ticket</th>
                          <th className="py-3.5 px-4">Customer Details</th>
                          <th className="py-3.5 px-4">Device &amp; Issue</th>
                          <th className="py-3.5 px-4">Repair Status</th>
                          <th className="py-3.5 px-4">Final Bill</th>
                          <th className="py-3.5 px-4">Your 2% Cut</th>
                          <th className="py-3.5 px-4">Payout Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-medium">
                        {filteredJobs.map((job) => {
                          const isCompleted = job.status === 'COMPLETED';
                          const isPaid = job.commission_status === 'PAID';
                          return (
                            <tr key={job.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-3 px-4">
                                <div className="font-mono font-black text-amber-400 text-sm">{job.ticket_id}</div>
                                <div className="text-[10px] text-slate-500">
                                  {new Date(job.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-bold text-white">{job.customer_name}</div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <span>{job.customer_phone}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4 max-w-xs">
                                <div className="font-bold text-slate-200">
                                  {job.device_brand} &bull; {job.device_model}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {job.problem_description}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                  job.status === 'COMPLETED'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : job.status === 'IN_PROGRESS'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                    : job.status === 'ACCEPTED'
                                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                }`}>
                                  {job.status.replace('_', ' ')}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                {isCompleted ? (
                                  <div className="font-black text-white text-sm">
                                    ₹{Number(job.final_amount).toLocaleString('en-IN')}
                                  </div>
                                ) : (
                                  <div className="text-slate-400 text-xs">Est: ₹{job.estimated_cost || 0}</div>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                {isCompleted ? (
                                  <div className="font-black text-emerald-400 text-sm">
                                    ₹{Number(job.seller_commission_amount || 0).toLocaleString('en-IN')}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-500 italic">2% upon repair</div>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                {isCompleted ? (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isPaid
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}>
                                    {isPaid ? 'PAID TO BANK' : 'PENDING SETTLEMENT'}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">&mdash;</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: 2% COMMISSION EARNINGS LEDGER                            */}
          {/* ============================================================== */}
          {activeTab === 'COMMISSIONS' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h3 className="font-extrabold text-white text-base">Your 2% Referral Commission Ledger</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Every completed repair referred by your store earns you strictly 2% of the total billing amount. Payouts are settled directly by the Admin Hub via UPI.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl shrink-0">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Awaiting Payout</div>
                    <div className="text-2xl font-black text-amber-400">₹{pendingCommission}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Paid to Date</div>
                    <div className="text-2xl font-black text-emerald-400">₹{paidCommission}</div>
                  </div>
                </div>
              </div>

              {/* Commission Ledger Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Payout History &amp; UPI Reference Log</h4>
                  <span className="text-xs text-slate-400">{commissions.data?.length || 0} payout records</span>
                </div>

                {commissions.data?.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <DollarSign className="w-10 h-10 mx-auto text-slate-700" />
                    <div className="text-sm font-bold text-slate-300">No commission records yet</div>
                    <p className="text-xs text-slate-500">When your referred customers complete repairs at the admin shop, your 2% fees will reflect here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3.5 px-4">Ticket</th>
                          <th className="py-3.5 px-4">Final Repair Bill</th>
                          <th className="py-3.5 px-4">Your 2% Commission</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">UPI Reference / Settlement Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-medium">
                        {commissions.data.map((c) => {
                          const isPaid = c.status === 'PAID';
                          return (
                            <tr key={c.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-3 px-4 font-mono font-bold text-amber-400">{c.ticket_id}</td>
                              <td className="py-3 px-4 font-bold text-slate-200">
                                ₹{Number(c.final_repair_amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                                ₹{Number(c.commission_amount).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPaid
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400 text-[11px]">
                                {isPaid ? (
                                  <div>
                                    <div className="font-mono text-emerald-400 font-bold">{c.payment_reference}</div>
                                    <div className="text-[10px] text-slate-500">
                                      {c.paid_at ? new Date(c.paid_at).toLocaleDateString('en-IN') : 'Paid'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic">Pending payout from Admin Hub</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: STORE ACCESSORY PRODUCTS CATALOG                         */}
          {/* ============================================================== */}
          {activeTab === 'PRODUCTS' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-white text-base">My Store Accessory Products</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Products listed here are shown to nearby customers within 1–2 km with instant WhatsApp inquiry.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Upload New Accessory</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-700" />
                  <div className="text-sm font-bold text-slate-300">No products uploaded yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Start publishing chargers, tempered glass, cables, or phone cases to attract customers in your neighborhood.
                  </p>
                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Upload First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-3 transition">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            ● In Stock: {p.stock}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] text-amber-400 font-semibold">{p.brand}</div>
                          <h4 className="font-extrabold text-white text-base mt-0.5 leading-snug">{p.name}</h4>
                        </div>

                        <div className="text-2xl font-black text-white pt-1">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Live in Catalog</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-rose-400 hover:text-rose-300 transition p-1"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: CUSTOMER INQUIRIES & LEADS                               */}
          {/* ============================================================== */}
          {activeTab === 'INQUIRIES' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <h3 className="font-extrabold text-white text-base">Incoming Product Inquiries &amp; Customer Leads</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Questions sent by nearby customers browsing accessories uploaded by your store.
                </p>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-700" />
                  <div className="text-sm font-bold text-slate-300">No customer leads in inbox</div>
                  <p className="text-xs text-slate-500">When visitors send queries about your products, they will appear here instantly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            PRODUCT QUERY
                          </span>
                          <h4 className="font-extrabold text-white text-sm mt-1">{inq.item_name}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(inq.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1 text-xs">
                        <div className="text-slate-300 font-bold">{inq.customer_name}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{inq.customer_phone}</span>
                        </div>
                        {inq.message && (
                          <p className="text-slate-300 text-xs italic pt-1 border-t border-slate-800/60 mt-1">
                            &ldquo;{inq.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">Quick Response:</span>
                        <a
                          href={`https://wa.me/${inq.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${inq.customer_name}, thank you for contacting ${user?.shopName || 'our shop'} regarding ${inq.item_name}: `)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: INSTANT TICKET TRACKER                                   */}
          {/* ============================================================== */}
          {activeTab === 'TRACKER' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl max-w-2xl mx-auto space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-extrabold text-white text-lg">Instant Repair Ticket Progress Lookup</h3>
                  <p className="text-xs text-slate-400">Enter a customer ticket code to inspect repair stage and payout readiness.</p>
                </div>

                <form onSubmit={handleTrackTicket} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. REP-1001)"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm uppercase focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow transition"
                  >
                    {trackingLoading ? 'Checking...' : 'Track Ticket'}
                  </button>
                </form>

                {trackingError && (
                  <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{trackingError}</span>
                  </div>
                )}

                {trackedJob && (
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-mono font-black text-amber-400 text-base">{trackedJob.ticket_id}</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {trackedJob.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Customer: <strong className="text-white">{trackedJob.customer_name}</strong></div>
                      <div>Device: <strong className="text-white">{trackedJob.device_brand} {trackedJob.device_model}</strong></div>
                      <div>Issue: <span className="text-slate-400">{trackedJob.problem_description}</span></div>
                      <div>Final Bill: <strong className="text-white">₹{trackedJob.final_amount || 0}</strong></div>
                    </div>

                    {trackedJob.seller_commission_amount > 0 && (
                      <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center justify-between">
                        <span>Your 2% Commission:</span>
                        <strong className="text-sm font-black">₹{trackedJob.seller_commission_amount}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: STORE PROFILE & PASSWORD MANAGEMENT                    */}
          {/* ============================================================== */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Card: Store Details */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Store Profile</span>
                    </h3>
                    <Link
                      href="/seller/profile"
                      className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Full Profile Page</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Store / Partner Name</div>
                      <div className="font-bold text-white text-sm mt-0.5">{user?.shopName || user?.name || 'Partner Store'}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Login Email</div>
                      <div className="font-mono text-slate-300 mt-0.5 truncate">{user?.email}</div>
                    </div>

                    {user?.phone && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Phone</div>
                        <div className="font-mono text-slate-300 mt-0.5">{user?.phone}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Repair Hub</div>
                      <div className="text-amber-400 font-bold mt-0.5">{user?.shopName || 'Registered Workshop Admin'}</div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commission Terms</div>
                      <div className="text-emerald-400 font-bold mt-0.5">Strictly 2% referral fee on completed jobs</div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Security & Password Management */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-amber-400" />
                        <span>Security &amp; Password Management</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Reset your default password so the login popup warning is permanently cleared.
                      </p>
                    </div>

                    {(isDefaultPassword || supabaseService.getSellerPasswordInfo(user?.email)?.isDefault) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 self-start sm:self-auto animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Default Password Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 self-start sm:self-auto">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Custom Password Active
                      </span>
                    )}
                  </div>

                  {/* Warning banner */}
                  {(isDefaultPassword || supabaseService.getSellerPasswordInfo(user?.email)?.isDefault) && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Your account is using default password <strong className="text-white font-mono">Seller@123</strong>. Please update it below.</span>
                    </div>
                  )}

                  {/* Error & Success alerts */}
                  {profileError && (
                    <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleInTabPasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span>Current Password</span>
                        <span className="text-[10px] text-amber-400 font-mono">Default: Seller@123</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                        <input
                          type={profileShowCurrent ? 'text' : 'password'}
                          required
                          value={profileCurrentPwd}
                          onChange={(e) => setProfileCurrentPwd(e.target.value)}
                          placeholder="Current password (default: Seller@123)"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setProfileShowCurrent(!profileShowCurrent)}
                          className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                        >
                          {profileShowCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          New Secure Password
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type={profileShowNew ? 'text' : 'password'}
                            required
                            value={profileNewPwd}
                            onChange={(e) => setProfileNewPwd(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setProfileShowNew(!profileShowNew)}
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                          >
                            {profileShowNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                          <input
                            type={profileShowConfirm ? 'text' : 'password'}
                            required
                            value={profileConfirmPwd}
                            onChange={(e) => setProfileConfirmPwd(e.target.value)}
                            placeholder="Repeat new password"
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setProfileShowConfirm(!profileShowConfirm)}
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                          >
                            {profileShowConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={profileSubmitting}
                        className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{profileSubmitting ? 'Updating Password...' : 'Save New Password & Secure Account'}</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODAL 1: CREATE REPAIR REFERRAL                                 */}
          {/* ============================================================== */}
          <SellerReferralModal
            isOpen={isReferralOpen}
            onClose={() => setIsReferralOpen(false)}
            onCreated={handleCreateReferral}
            onSubmit={handleCreateReferral}
            currentSeller={user}
            sellerUser={user}
          />

          {/* ============================================================== */}
          {/* MODAL 2: ADD ACCESSORY PRODUCT                                  */}
          {/* ============================================================== */}
          {isAddProductOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Upload New Accessory Product</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Publish products to customers within walking distance</p>
                  </div>
                  <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="e.g. 65W GaN Fast Charger"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Brand</label>
                      <input
                        type="text"
                        required
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        placeholder="e.g. Anker / Spigen"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        placeholder="999"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        placeholder="15"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={productLoading}
                      className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                    >
                      {productLoading ? 'Publishing...' : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODAL 3: RESET DEFAULT PASSWORD POPUP (TRIGGERED ON LOGIN)     */}
          {/* ============================================================== */}
          <ResetDefaultPasswordModal
            isOpen={isResetPasswordOpen}
            onClose={() => setIsResetPasswordOpen(false)}
            onSuccess={() => {
              loadData();
            }}
          />

        </main>
      </RoleGuard>
    </div>
  );
}
