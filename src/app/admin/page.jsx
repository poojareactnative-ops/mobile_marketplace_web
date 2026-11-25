'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminCompleteRepairModal from '../../components/AdminCompleteRepairModal';
import AdminPayCommissionModal from '../../components/AdminPayCommissionModal';
import AdminBatchSettleModal from '../../components/AdminBatchSettleModal';
import AdminOnboardSellerModal from '../../components/AdminOnboardSellerModal';
import InvoiceWarrantyModal from '../../components/InvoiceWarrantyModal';
import ImageLightboxModal from '../../components/ImageLightboxModal';
import NotificationBell from '../../components/NotificationBell';
import RoleGuard from '../../components/RoleGuard';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';
import { getWhatsAppRepairTrackingUrl, getRepairJobImages } from '../../utils/productImages';
import { uploadProductImageFile, fileToDataUrl } from '../../services/storageService';
import {
  Wrench, Store, Clock, UserPlus, CheckCircle2, Phone, Mail,
  MessageSquare, Plus, Search, Filter, RefreshCw, AlertCircle,
  Layers, ArrowRight, IndianRupee, FileText, ChevronRight, Sparkles,
  ShieldCheck, Check, Smartphone, Tag, ShoppingBag, Trash2, ArrowUpRight,
  Menu, X, LogOut, ArrowLeft, LayoutDashboard, Home, ExternalLink, Printer, Award,
  Camera, Image as ImageIcon, UploadCloud, Loader2, Zap
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Sidebar Mobile Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('REPAIRS'); // 'REPAIRS' | 'COMMISSIONS' | 'SELLERS' | 'INQUIRIES' | 'MARKETPLACE'

  // Data states
  const [jobs, setJobs] = useState([]);
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [sellers, setSellers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [completingJob, setCompletingJob] = useState(null);
  const [payingCommission, setPayingCommission] = useState(null);
  const [batchSettlingSeller, setBatchSettlingSeller] = useState(null);
  const [invoiceJob, setInvoiceJob] = useState(null);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [isDirectTicketOpen, setIsDirectTicketOpen] = useState(false);
  const [directTicketForm, setDirectTicketForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: 'Apple iPhone',
    deviceModel: '',
    problemDescription: '',
    estimatedCost: '',
  });
  const [directTicketPhotos, setDirectTicketPhotos] = useState([]);
  const [directTicketUploading, setDirectTicketUploading] = useState(false);
  const directFileInputRef = React.useRef(null);
  const [directTicketLoading, setDirectTicketLoading] = useState(false);

  // Lightbox Image Viewer State
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxTitle, setLightboxTitle] = useState('Device Photos');

  const handleDirectPhotoUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const availableSlots = 4 - directTicketPhotos.length;
    if (availableSlots <= 0) return;

    setDirectTicketUploading(true);
    const newUrls = [];
    for (const file of files.slice(0, availableSlots)) {
      try {
        const uploaded = await uploadProductImageFile(file, { folder: 'repair_intake' });
        if (uploaded?.url) newUrls.push(uploaded.url);
      } catch (err) {
        try {
          const dataUrl = await fileToDataUrl(file);
          newUrls.push(dataUrl);
        } catch (convErr) {}
      }
    }
    setDirectTicketPhotos((prev) => [...prev, ...newUrls]);
    setDirectTicketUploading(false);
    if (directFileInputRef.current) directFileInputRef.current.value = '';
  };

  // Load all admin data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [j, c, s, inq, prods] = await Promise.all([
        supabaseService.getRepairJobs({ adminId: user?.id }),
        supabaseService.getCommissions({ adminId: user?.id }),
        supabaseService.getAffiliatedSellers(user?.id),
        supabaseService.getInquiries({ ownerRole: 'ADMIN' }),
        supabaseService.getProducts(),
      ]);
      setJobs(j || []);
      setCommissions(c || { data: [], summary: {} });
      setSellers(s || []);
      setInquiries(inq || []);
      setProducts((prods || []).filter(p => p.uploader_role === 'ADMIN'));
    } catch (err) {
      console.error('Failed to load admin repair jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleSignOut = () => {
    logout('/');
  };

  // Handle status update
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await supabaseService.updateRepairStatus(jobId, newStatus);
      await loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Handle complete job
  const handleCompleteJob = async (jobId, amount, notes) => {
    await supabaseService.completeRepairJob(jobId, amount, notes);
    await loadData();
  };

  // Handle pay commission (single)
  const handlePayCommission = async (commId, ref) => {
    await supabaseService.paySellerCommission(commId, ref);
    await loadData();
  };

  // Handle batch pay commissions (1-click settlement for a partner seller's balance)
  const handleBatchPayCommission = async (batchPayload) => {
    await supabaseService.batchPaySellerCommissions(batchPayload);
    await loadData();
  };

  // Handle onboard partner seller
  const handleSellerOnboarded = async (sellerData) => {
    const created = await supabaseService.onboardSeller(sellerData, user);
    await loadData();
    return created;
  };

  // Handle Direct Walk-In Ticket by Admin
  const handleCreateDirectTicket = async (e) => {
    e.preventDefault();
    if (!directTicketForm.customerName || !directTicketForm.customerPhone) {
      alert('Please fill in customer details');
      return;
    }

    try {
      setDirectTicketLoading(true);
      await supabaseService.createRepairReferral({
        ...directTicketForm,
        adminId: user?.id,
        shopId: user?.shopId || null,
        sellerId: null,
        sellerName: 'Direct Walk-In (Admin Hub)',
        images: directTicketPhotos,
        image_url: directTicketPhotos[0] || null,
      });
      setIsDirectTicketOpen(false);
      setDirectTicketPhotos([]);
      setDirectTicketForm({
        customerName: '',
        customerPhone: '',
        deviceBrand: 'Apple iPhone',
        deviceModel: '',
        problemDescription: '',
        estimatedCost: '',
      });
      await loadData();
      alert('Walk-in repair job created successfully!');
    } catch (err) {
      alert('Error creating walk-in ticket: ' + err.message);
    } finally {
      setDirectTicketLoading(false);
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
      (j.device_model && j.device_model.toLowerCase().includes(q)) ||
      (j.seller_name && j.seller_name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const totalRevenue = jobs
    .filter(j => j.status === 'COMPLETED')
    .reduce((sum, j) => sum + Number(j.final_amount || 0), 0);

  const activeRepairsCount = jobs.filter(
    j => j.status === 'PENDING_APPROVAL' || j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS'
  ).length;

  const completedRepairsCount = jobs.filter(j => j.status === 'COMPLETED').length;

  const pendingCommissionAmount = Number(commissions.summary?.pendingCommission || 0);
  const paidCommissionAmount = Number(commissions.summary?.paidCommission || 0);
  // Super Admin 1% Commission on workshop repair volume
  const superAdminFee = Math.round(totalRevenue * 0.01);
  const adminNetTakeHome = totalRevenue - superAdminFee - (pendingCommissionAmount + paidCommissionAmount);

  const navItems = [
    {
      id: 'REPAIRS',
      label: 'Repair Jobs Queue',
      icon: Wrench,
      count: activeRepairsCount > 0 ? `${activeRepairsCount} active` : `${jobs.length}`,
      countClass: activeRepairsCount > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'COMMISSIONS',
      label: '2% Commission Ledger',
      icon: IndianRupee,
      count: pendingCommissionAmount > 0 ? `₹${pendingCommissionAmount} pend` : 'Settled',
      countClass: pendingCommissionAmount > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 'SELLERS',
      label: 'Partner Stores',
      icon: Store,
      count: sellers.length,
      countClass: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'INQUIRIES',
      label: 'Customer Leads',
      icon: MessageSquare,
      count: inquiries.length,
      countClass: inquiries.length > 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'MARKETPLACE',
      label: 'Products Catalog',
      icon: ShoppingBag,
      count: products.length,
      countClass: 'bg-slate-800 text-slate-400',
    },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-amber-500 selection:text-slate-950">

        {/* MOBILE SIDEBAR BACKDROP */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          />
        )}

        {/* ============================================================== */}
        {/* SIDEBAR NAVIGATION (FIXED ON DESKTOP, DRAWER ON MOBILE)        */}
        {/* ============================================================== */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
            }`}
        >
          <div className="flex flex-col flex-1 overflow-y-auto">

            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                  <Wrench className="w-5 h-5 text-slate-950 font-black" />
                </div>
                <div>
                  <span className="font-black text-white text-base tracking-tight block">SmartFix Hub</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block -mt-0.5">
                    Admin Master Console
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Profile Pill */}
            <div className="p-4 mx-3 my-3 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white truncate max-w-[170px]">
                  {user?.shopName || user?.name || 'Central Repair Lab'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Supabase Live Connected" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              <div className="pt-1 flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold rounded-full border border-amber-500/30">
                  Certified Admin
                </span>
                {user?.phone && (
                  <span className="text-[10px] text-slate-500 truncate">{user.phone}</span>
                )}
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="px-3 py-2 space-y-1">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Operations Menu
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.countClass} ${isActive ? '!bg-slate-950/30 !text-slate-950' : ''}`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Drawer inside Sidebar */}
            <div className="px-3 pt-4 mt-2 border-t border-slate-800/80 space-y-2">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Quick Commands
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOnboardOpen(true);
                  setIsSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Onboard Partner Seller</span>
              </button>
            </div>

          </div>

          {/* Sidebar Bottom Footer Links */}
          <div className="p-4 border-t border-slate-800/80 space-y-2 bg-slate-950/60">
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>Public Website</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Console</span>
            </button>
          </div>

        </aside>

        {/* ============================================================== */}
        {/* MAIN VIEWPORT (OFFSET BY SIDEBAR WIDTH ON LARGE SCREENS)       */}
        {/* ============================================================== */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">

          {/* Top Workbench App Bar */}
          <header className="sticky top-0 z-30 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="text-slate-500">Admin Console</span>
                <span className="text-slate-600">/</span>
                <span className="text-white">
                  {navItems.find(i => i.id === activeTab)?.label}
                </span>
              </div>
            </div>

            {/* Quick Top Bar Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDirectTicketOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Walk-In Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOnboardOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Onboard Seller</span>
              </button>

              <NotificationBell />

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
                title="Sync Database"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </header>

          {/* Main Content Workspace */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">

            {/* KPI Stat Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Volume</div>
                <div className="text-xl font-black text-white mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-950/40 to-slate-900/80 border border-purple-500/30 p-4 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Super Admin (1%)</div>
                <div className="text-xl font-black text-purple-300 mt-1">₹{superAdminFee.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/30 p-4 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Net Workshop Income</div>
                <div className="text-xl font-black text-emerald-400 mt-1">₹{adminNetTakeHome.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</div>
                <div className="text-xl font-black text-amber-400 mt-1">{activeRepairsCount}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</div>
                <div className="text-xl font-black text-white mt-1">{completedRepairsCount}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending 2% Payout</div>
                <div className="text-xl font-black text-rose-400 mt-1">₹{pendingCommissionAmount.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl backdrop-blur-md shadow-lg">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner Stores</div>
                <div className="text-xl font-black text-teal-400 mt-1">{sellers.length}</div>
              </div>
            </div>

            {/* TAB CONTENT 1: REPAIR JOBS QUEUE */}
            {activeTab === 'REPAIRS' && (
              <div className="space-y-4 animate-in fade-in duration-300">

                {/* Search & Status Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl border border-slate-800">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      placeholder="Search ticket, customer, phone, device..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {['ALL', 'PENDING_APPROVAL', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${statusFilter === st
                          ? 'bg-white text-slate-950 shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-extrabold text-white text-sm">Active Repair Tickets Queue</h3>
                    <span className="text-xs text-slate-400">Showing {filteredJobs.length} of {jobs.length} jobs</span>
                  </div>

                  {loading ? (
                    <div className="p-12 text-center text-slate-400 text-xs">Loading repair tickets from Supabase...</div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 space-y-2">
                      <Wrench className="w-10 h-10 mx-auto text-slate-700" />
                      <div className="text-sm font-bold text-slate-300">No repair tickets found</div>
                      <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                          <tr>
                            <th className="py-3.5 px-4">Ticket</th>
                            <th className="py-3.5 px-4">Customer</th>
                            <th className="py-3.5 px-4">Device &amp; Issue</th>
                            <th className="py-3.5 px-4">Referral Source</th>
                            <th className="py-3.5 px-4">Bill Amount</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-medium">
                          {filteredJobs.map((job) => {
                            const isCompleted = job.status === 'COMPLETED';
                            const isReferred = !!job.seller_id;
                            const jobImages = getRepairJobImages(job);
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
                                  <div className="font-bold text-white text-xs">{job.customer_name}</div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-500" />
                                    <span>{job.customer_phone}</span>
                                  </div>
                                </td>

                                <td className="py-3 px-4 max-w-xs">
                                  <div className="flex items-start gap-2.5">
                                    {jobImages.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setLightboxImages(jobImages);
                                          setLightboxTitle(`${job.ticket_id} • ${job.device_brand} ${job.device_model} Condition Photos`);
                                        }}
                                        className="relative group shrink-0 rounded-xl overflow-hidden border border-slate-700 w-11 h-11 bg-slate-950 hover:border-amber-400 transition shadow"
                                        title="Click to view device intake photos"
                                      >
                                        <img src={jobImages[0]} alt="device" className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                                        <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[8px] font-bold text-amber-300 text-center py-0.5">
                                          📷 {jobImages.length}
                                        </span>
                                      </button>
                                    )}
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-200">
                                        {job.device_brand} &bull; {job.device_model}
                                      </div>
                                      <div className="text-[11px] text-slate-400 truncate mt-0.5" title={job.problem_description}>
                                        {job.problem_description}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3 px-4">
                                  {isReferred ? (
                                    <div>
                                      <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/30">
                                        🏪 {job.seller_name || 'Partner Seller'}
                                      </span>
                                      <div className="text-[10px] text-slate-500 mt-1">2% referral fee</div>
                                    </div>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full text-[10px] font-bold">
                                      Direct Walk-in
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-4">
                                  {isCompleted ? (
                                    <div>
                                      <div className="font-black text-white text-sm">₹{Number(job.final_amount).toLocaleString('en-IN')}</div>
                                      {isReferred && (
                                        <div className="text-[10px] text-amber-400">
                                          ₹{Number(job.seller_commission_amount || 0)} (2% Cut)
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="text-slate-400">Est: ₹{job.estimated_cost || 0}</div>
                                      <div className="text-[10px] text-slate-500 italic">Bill on completion</div>
                                    </div>
                                  )}
                                </td>

                                <td className="py-3 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${job.status === 'COMPLETED'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : job.status === 'IN_PROGRESS'
                                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                      : job.status === 'ACCEPTED'
                                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                                        : job.status === 'CANCELLED'
                                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                          : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                    }`}>
                                    {job.status.replace('_', ' ')}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isCompleted && (
                                      <button
                                        type="button"
                                        onClick={() => setInvoiceJob(job)}
                                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                                        title="Print Official GST Invoice & 60-Day Warranty Certificate"
                                      >
                                        <Award className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Invoice / Warranty</span>
                                      </button>
                                    )}

                                    {!isCompleted && job.status !== 'CANCELLED' && (
                                      <>
                                        {job.status === 'PENDING_APPROVAL' && (
                                          <button
                                            type="button"
                                            onClick={() => handleStatusChange(job.id, 'ACCEPTED')}
                                            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition"
                                          >
                                            Accept
                                          </button>
                                        )}
                                        {job.status === 'ACCEPTED' && (
                                          <button
                                            type="button"
                                            onClick={() => handleStatusChange(job.id, 'IN_PROGRESS')}
                                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                                          >
                                            Start
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => setCompletingJob(job)}
                                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Complete</span>
                                        </button>
                                      </>
                                    )}

                                    {job.customer_phone && (
                                      <a
                                        href={getWhatsAppRepairTrackingUrl({
                                          customerPhone: job.customer_phone,
                                          customerName: job.customer_name,
                                          ticketId: job.ticket_id,
                                          deviceBrand: job.device_brand,
                                          deviceModel: job.device_model,
                                          problemDescription: job.problem_description,
                                          shopName: user?.shopName,
                                          status: job.status,
                                        })}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 rounded-lg transition"
                                        title="WhatsApp Tracking ID & Live Link to Customer"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </a>
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

              </div>
            )}

            {/* TAB CONTENT 2: 2% COMMISSION LEDGER */}
            {activeTab === 'COMMISSIONS' && (() => {
              const pendingCommissionsBySeller = (commissions.data || [])
                .filter(c => c.status === 'PENDING')
                .reduce((acc, c) => {
                  const key = c.seller_id || c.seller_name || 'UNKNOWN';
                  if (!acc[key]) {
                    const matchingSeller = sellers.find(s => s.id === c.seller_id);
                    acc[key] = {
                      seller: matchingSeller || { id: c.seller_id, name: c.seller_name || 'Partner Store', shop_name: c.seller_name || 'Partner Store' },
                      items: [],
                      totalPending: 0,
                    };
                  }
                  acc[key].items.push(c);
                  acc[key].totalPending += Number(c.commission_amount || 0);
                  return acc;
                }, {});
              const pendingSellerGroups = Object.values(pendingCommissionsBySeller);

              return (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-extrabold text-white text-base">2% Partner Referral Commission Ledger</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      By platform agreement, registered accessory stores earn strictly 2% on completed repair billing they refer. Settle accrued commission balances via UPI.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl shrink-0">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Pending Payouts</div>
                      <div className="text-2xl font-black text-rose-400">
                        ₹{commissions.summary?.pendingCommission || 0}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Total Paid to Date</div>
                      <div className="text-2xl font-black text-emerald-400">
                        ₹{commissions.summary?.paidCommission || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Click Batch Settlement Cards */}
                {pendingSellerGroups.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30">
                          <Zap className="w-5 h-5" />
                        </span>
                        <div>
                          <h4 className="font-extrabold text-white text-sm sm:text-base">1-Click Batch Settle Partner Balances</h4>
                          <p className="text-xs text-slate-400">Settle all accumulated referral tickets for a partner store in a single UPI transaction.</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
                        {pendingSellerGroups.length} Partner{pendingSellerGroups.length > 1 ? 's' : ''} Ready for Payout
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                      {pendingSellerGroups.map((group) => (
                        <div
                          key={group.seller.id || group.seller.name}
                          className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-extrabold text-white text-sm truncate">
                                {group.seller.shop_name || group.seller.name}
                              </h5>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                                {group.items.length} Ticket{group.items.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">Owner: {group.seller.name}</p>
                            <div className="pt-2">
                              <div className="text-[10px] font-bold text-slate-500 uppercase">Accumulated Balance</div>
                              <div className="text-2xl font-black text-emerald-400">
                                ₹{group.totalPending.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setBatchSettlingSeller(group)}
                            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 transition"
                          >
                            <Zap className="w-4 h-4" />
                            <span>Batch Settle ₹{group.totalPending.toLocaleString('en-IN')} (1 Click)</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">Commission Transactions Log</h4>
                    <span className="text-xs text-slate-400">{commissions.data?.length || 0} transactions</span>
                  </div>

                  {commissions.data?.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 space-y-2">
                      <IndianRupee className="w-10 h-10 mx-auto text-slate-700" />
                      <div className="text-sm font-bold text-slate-300">No referral commission entries yet</div>
                      <p className="text-xs text-slate-500">When partner sellers refer repairs and you complete the jobs, 2% entries will log here automatically.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800">
                          <tr>
                            <th className="py-3.5 px-4">Ticket</th>
                            <th className="py-3.5 px-4">Beneficiary Seller</th>
                            <th className="py-3.5 px-4">Final Repair Bill</th>
                            <th className="py-3.5 px-4">2% Commission</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">UPI Reference / Date</th>
                            <th className="py-3.5 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 font-medium">
                          {commissions.data.map((comm) => {
                            const isPaid = comm.status === 'PAID';
                            return (
                              <tr key={comm.id} className="hover:bg-slate-800/30 transition">
                                <td className="py-3 px-4 font-mono font-bold text-amber-400">
                                  {comm.ticket_id}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-white">{comm.seller_name || 'Accessory Partner'}</div>
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-200">
                                  ₹{Number(comm.final_repair_amount).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4 font-black text-amber-400 text-sm">
                                  ₹{Number(comm.commission_amount).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    }`}>
                                    {comm.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-400 text-[11px]">
                                  {isPaid ? (
                                    <div>
                                      <div className="font-mono text-emerald-400">{comm.payment_reference}</div>
                                      <div className="text-[10px] text-slate-500">
                                        {comm.paid_at ? new Date(comm.paid_at).toLocaleDateString('en-IN') : 'Paid'}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 italic">Pending payout</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {!isPaid && (
                                    <button
                                      type="button"
                                      onClick={() => setPayingCommission(comm)}
                                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs shadow transition"
                                    >
                                      Record UPI Payment
                                    </button>
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
              );
            })()}

            {/* TAB CONTENT 3: PARTNER STORES NETWORK */}
            {activeTab === 'SELLERS' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                  <div>
                    <h3 className="font-extrabold text-white text-base">Affiliated Accessory Stores (2% Referral Partners)</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                      Sellers onboarded by you can log in, create digital referral tickets for walk-in customers with damaged phones, and earn 2% commission.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOnboardOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Onboard New Partner Store</span>
                  </button>
                </div>

                {sellers.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
                    <Store className="w-10 h-10 mx-auto text-slate-700" />
                    <div className="text-sm font-bold text-slate-300">No partner stores registered yet</div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Click &quot;+ Onboard New Partner Store&quot; to register neighborhood accessory shops.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sellers.map((s) => {
                      const sellerJobs = jobs.filter(j => j.seller_id === s.id);
                      const sellerCompleted = sellerJobs.filter(j => j.status === 'COMPLETED');
                      const sellerTotalVolume = sellerCompleted.reduce((sum, j) => sum + Number(j.final_amount || 0), 0);
                      const sellerCommission = Math.round(sellerTotalVolume * 0.02);
                      const sellerPendingCommissions = (commissions.data || []).filter(c => c.seller_id === s.id && c.status === 'PENDING');
                      const sellerPendingAmount = sellerPendingCommissions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

                      return (
                        <div key={s.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg space-y-4 transition">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  Active Partner
                                </span>
                                {s.verification_status === 'VERIFIED_GENUINE' ? (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span>Genuine Partner</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                                    Verified Store
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-white text-base pt-0.5">{s.shop_name || s.name}</h4>
                              <p className="text-xs text-slate-400">Owner: {s.name}</p>
                            </div>

                            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                              <Store className="w-4 h-4" />
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                            <div className="flex items-center gap-2 truncate">
                              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">{s.email}</span>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span>{s.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80 text-xs">
                            <div>
                              <div className="font-black text-white">{sellerJobs.length}</div>
                              <div className="text-[10px] text-slate-500">Referrals</div>
                            </div>
                            <div>
                              <div className="font-black text-emerald-400">{sellerCompleted.length}</div>
                              <div className="text-[10px] text-slate-500">Repaired</div>
                            </div>
                            <div>
                              <div className="font-black text-amber-400">₹{sellerCommission}</div>
                              <div className="text-[10px] text-slate-500">2% Cut</div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span>Active Partner</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {sellerPendingAmount > 0 ? (
                                <span className="text-rose-400 font-bold">₹{sellerPendingAmount} Pending</span>
                              ) : (
                                'Settled'
                              )}
                            </span>
                          </div>

                          {sellerPendingAmount > 0 && (
                            <button
                              type="button"
                              onClick={() => setBatchSettlingSeller({
                                seller: s,
                                items: sellerPendingCommissions,
                                totalPending: sellerPendingAmount,
                              })}
                              className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 transition"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>1-Click Settle ₹{sellerPendingAmount.toLocaleString('en-IN')} (UPI)</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: CUSTOMER LEADS & INCOMING INQUIRIES */}
            {activeTab === 'INQUIRIES' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                  <h3 className="font-extrabold text-white text-base">Incoming Customer Leads &amp; Queries</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Queries submitted directly through your shop&apos;s product listings or repair quote estimator.
                  </p>
                </div>

                {inquiries.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-700" />
                    <div className="text-sm font-bold text-slate-300">No customer leads in inbox</div>
                    <p className="text-xs text-slate-500">When visitors submit questions or repair quote inquiries, they will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              {inq.item_type || 'INQUIRY'}
                            </span>
                            <h4 className="font-extrabold text-white text-sm mt-1">{inq.item_name || 'Repair Service'}</h4>
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
                            href={`https://wa.me/${inq.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${inq.customer_name}, thank you for contacting ${user?.shopName || 'our repair hub'} regarding ${inq.item_name || 'your mobile repair'}: `)}`}
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

            {/* TAB CONTENT 5: SHOP MARKETPLACE CATALOG */}
            {activeTab === 'MARKETPLACE' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base">Shop Marketplace Products</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage mobile accessories visible to customers within 1–2 km.
                    </p>
                  </div>
                  <Link
                    href="/marketplace"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Go to Public Marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Products */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>My Uploaded Products ({products.length})</span>
                  </h4>

                  {products.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">No products uploaded yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {products.map(p => (
                        <div key={p.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{p.name}</div>
                            <div className="text-[11px] text-slate-400">{p.brand} &bull; ₹{p.price}</div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {p.stock} in stock
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </main>

        </div>

        {/* MODALS */}
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

        <AdminBatchSettleModal
          isOpen={!!batchSettlingSeller}
          onClose={() => setBatchSettlingSeller(null)}
          seller={batchSettlingSeller?.seller}
          pendingCommissions={batchSettlingSeller?.items || []}
          onBatchPaid={handleBatchPayCommission}
          adminUser={user}
        />

        <AdminOnboardSellerModal
          isOpen={isOnboardOpen}
          onClose={() => setIsOnboardOpen(false)}
          onSellerCreated={handleSellerOnboarded}
          adminUser={user}
        />

        {isDirectTicketOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
              <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto sm:hidden mt-2.5 mb-1" />
              
              <div className="flex justify-between items-center border-b border-slate-800 px-5 py-4 shrink-0">
                <div>
                  <h3 className="text-base font-extrabold text-white">Log Walk-In Customer Repair</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Creates a direct repair order for customer at your front desk</p>
                </div>
                <button onClick={() => setIsDirectTicketOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
              </div>

              <form onSubmit={handleCreateDirectTicket} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Customer Full Name</label>
                    <input
                      type="text"
                      required
                      value={directTicketForm.customerName}
                      onChange={(e) => setDirectTicketForm({ ...directTicketForm, customerName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={directTicketForm.customerPhone}
                      onChange={(e) => setDirectTicketForm({ ...directTicketForm, customerPhone: e.target.value })}
                      placeholder="+91 98450 12345"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Device Brand</label>
                    <select
                      value={directTicketForm.deviceBrand}
                      onChange={(e) => setDirectTicketForm({ ...directTicketForm, deviceBrand: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Apple iPhone">Apple iPhone</option>
                      <option value="Samsung Galaxy">Samsung Galaxy</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="Google Pixel">Google Pixel</option>
                      <option value="Xiaomi / Redmi">Xiaomi / Redmi</option>
                      <option value="Other">Other Brand</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Device Model</label>
                    <input
                      type="text"
                      required
                      value={directTicketForm.deviceModel}
                      onChange={(e) => setDirectTicketForm({ ...directTicketForm, deviceModel: e.target.value })}
                      placeholder="e.g. iPhone 14 Pro Max"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Fault Description</label>
                  <textarea
                    rows="2"
                    required
                    value={directTicketForm.problemDescription}
                    onChange={(e) => setDirectTicketForm({ ...directTicketForm, problemDescription: e.target.value })}
                    placeholder="e.g. Cracked front display glass, touch unresponsive"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    value={directTicketForm.estimatedCost}
                    onChange={(e) => setDirectTicketForm({ ...directTicketForm, estimatedCost: e.target.value })}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Direct Walk-In Device Photos */}
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Device Intake Photos</span>
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {directTicketPhotos.length}/4
                    </span>
                  </div>

                  {directTicketPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {directTicketPhotos.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                          <img src={url} alt="Walkin Intake" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setDirectTicketPhotos((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-600 text-white rounded-full transition shadow"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {directTicketPhotos.length < 4 && (
                    <div>
                      <input
                        ref={directFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleDirectPhotoUpload(e.target.files)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={directTicketUploading}
                        onClick={() => directFileInputRef.current?.click()}
                        className="w-full py-2 px-3 border border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-amber-400 flex items-center justify-center gap-2 transition text-xs font-semibold"
                      >
                        {directTicketUploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span>Uploading photo...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Attach Condition Photos</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectTicketOpen(false);
                      setDirectTicketPhotos([]);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={directTicketLoading}
                    className="px-5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg"
                  >
                    {directTicketLoading ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Official GST Invoice & 60-Day Warranty Certificate Modal */}
        <InvoiceWarrantyModal
          isOpen={!!invoiceJob}
          onClose={() => setInvoiceJob(null)}
          job={invoiceJob}
        />

        {/* Fullscreen Image Lightbox Modal */}
        <ImageLightboxModal
          isOpen={lightboxImages.length > 0}
          onClose={() => setLightboxImages([])}
          images={lightboxImages}
          title={lightboxTitle}
        />

      </div>
    </RoleGuard>
  );
}
