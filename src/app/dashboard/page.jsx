'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
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
  Wrench, Store, ShieldCheck, User, Plus, Search, 
  CheckCircle2, Clock, AlertCircle, ArrowLeft, RefreshCw, 
  LogIn, UserPlus, ShieldAlert
} from 'lucide-react';

function DashboardContent() {
  const { user, role, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);

  // Data states (Real Supabase data)
  const [jobs, setJobs] = useState([]);
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [platformStats, setPlatformStats] = useState({});
  const [sellers, setSellers] = useState([]);

  // Modals state
  const [completingJob, setCompletingJob] = useState(null);
  const [payingCommission, setPayingCommission] = useState(null);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  // Customer tracking state
  const [ticketInput, setTicketInput] = useState('');
  const [trackedJob, setTrackedJob] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Load data specific to the active role
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (role === 'SELLER') {
        const [jobsData, commData] = await Promise.all([
          supabaseService.getRepairJobs({ sellerId: user?.id }),
          supabaseService.getCommissions({ sellerId: user?.id }),
        ]);
        setJobs(jobsData || []);
        setCommissions(commData || { data: [], summary: {} });
      } else if (role === 'ADMIN') {
        const [jobsData, commData, sellersData] = await Promise.all([
          supabaseService.getRepairJobs({ adminId: user?.id }),
          supabaseService.getCommissions({ adminId: user?.id }),
          supabaseService.getAffiliatedSellers(user?.id),
        ]);
        setJobs(jobsData || []);
        setCommissions(commData || { data: [], summary: {} });
        setSellers(sellersData || []);
      } else if (role === 'SUPER_ADMIN') {
        const [commData, overData] = await Promise.all([
          supabaseService.getCommissions(),
          supabaseService.getPlatformOverview(),
        ]);
        setCommissions(commData || { data: [], summary: {} });
        setPlatformStats(overData?.stats || {});
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

  // Handle Customer track
  const handleTrackTicket = async (e) => {
    if (e) e.preventDefault();
    if (!ticketInput.trim()) return;
    try {
      setTrackingLoading(true);
      setTrackingError('');
      const res = await supabaseService.trackRepair(ticketInput.trim());
      setTrackedJob(res);
    } catch (err) {
      setTrackedJob(null);
      setTrackingError(err.message || 'Ticket not found');
    } finally {
      setTrackingLoading(false);
    }
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
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">Sign In to View Dashboard</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please log in with your account to access your role-based workbench, repair queue, and 2% referral commission tracker.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Navbar */}
      <Navbar />

      {/* Subheader / Role Context Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <span className="text-slate-700">|</span>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-300">Logged in as:</span>
              <span className="text-xs font-bold text-white">{user.name}</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                role === 'SELLER' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                role === 'SUPER_ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {role}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5 font-medium"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Supabase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Interactive 2% Commission Formula Calculator */}
        <CommissionCalculator initialAmount={2000} />

        {/* ============================================================ */}
        {/* ROLE 1: ADMIN (REPAIR SHOP OWNER) VIEW                      */}
        {/* ============================================================ */}
        {role === 'ADMIN' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black text-white">Repair Shop Owner Workbench</h1>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                    {user.shopName || 'Mobile Repair Shop'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Receive repair referrals from affiliated accessory sellers, perform repairs, enter final bills (auto 2% commission split), and settle payouts.
                </p>
              </div>

              {/* Status Pills & Onboard Action */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsOnboardOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Onboard Seller Partner</span>
                </button>
                <span className="text-xs text-slate-400">Total Referrals: <strong className="text-white">{jobs.length}</strong></span>
                <span className="text-xs text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded-xl border border-rose-900 font-bold">
                  ₹{commissions.summary?.pendingCommission || 0} Owed (2%)
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Referred Jobs</div>
                <div className="text-2xl font-black text-white mt-1">{jobs.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">From partner sellers</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Active Workbench</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {jobs.filter(j => ['ACCEPTED', 'IN_PROGRESS'].includes(j.status)).length}
                </div>
                <div className="text-[11px] text-amber-400/80 mt-1">Under repair</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Pending 2% Commissions Owed</div>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  ₹{(commissions.summary?.pendingCommission || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-1">Ready for settlement</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Paid Commissions</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{(commissions.summary?.paidCommission || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Settled via UPI</div>
              </div>
            </div>

            {/* Affiliated Partner Sellers (2% Referral Partners) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-extrabold text-white">My Registered Accessory Sellers (2% Partners)</h2>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sellers only sell mobile accessories. Only you (Admin) can onboard them to send repair referrals to your shop.
                  </p>
                </div>
                <button
                  onClick={() => setIsOnboardOpen(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  + Add Seller
                </button>
              </div>

              {sellers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">No partner sellers registered yet</div>
                  <p className="text-[11px] text-slate-500">
                    Click &quot;+ Onboard Seller Partner&quot; to create seller accounts for local mobile accessory shops.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  {sellers.map((s) => (
                    <div key={s.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{s.name}</div>
                          <div className="text-[11px] text-emerald-400 font-semibold">{s.shop_name || 'Accessory Partner'}</div>
                        </div>
                        <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{s.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repair Referrals Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Repair Referrals Workbench</h2>
                  <p className="text-xs text-slate-400">Click &quot;Complete &amp; Bill (2%)&quot; to finalize ticket and auto-split 2% commission</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Customer &amp; Phone</th>
                      <th className="py-3 px-4">Device &amp; Issue</th>
                      <th className="py-3 px-4">Referring Seller</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Final Bill</th>
                      <th className="py-3 px-4 font-bold text-emerald-400">Seller 2%</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">{job.ticket_id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{job.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{job.customer_phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white font-semibold">{job.device_brand} {job.device_model}</div>
                          <div className="text-[11px] text-slate-400 max-w-xs truncate">{job.problem_description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 px-2 py-0.5 rounded text-[11px]">
                            {job.seller_name || 'Seller Partner'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                            job.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                            job.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {job.final_amount > 0 ? `₹${job.final_amount.toLocaleString('en-IN')}` : `Est. ₹${job.estimated_cost}`}
                        </td>
                        <td className="py-3 px-4">
                          {job.seller_commission_amount > 0 ? (
                            <div>
                              <span className="font-black text-emerald-400">
                                ₹{job.seller_commission_amount}
                              </span>
                              <span className={`ml-1 text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                                job.commission_status === 'PAID' ? 'bg-emerald-900 text-emerald-200' : 'bg-rose-900 text-rose-200'
                              }`}>
                                {job.commission_status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">&mdash;</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {job.status === 'PENDING_APPROVAL' && (
                            <button
                              onClick={() => handleStatusChange(job.id, 'ACCEPTED')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold shadow"
                            >
                              Accept
                            </button>
                          )}
                          {job.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleStatusChange(job.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold shadow"
                            >
                              Start Repair
                            </button>
                          )}
                          {job.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => setCompletingJob(job)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow"
                            >
                              Complete &amp; Bill (2%)
                            </button>
                          )}
                          {job.status === 'COMPLETED' && job.commission_status === 'PENDING' && (
                            <button
                              onClick={() => {
                                const matchingComm = commissions.data.find(c => c.repair_job_id === job.id) || {
                                  id: job.id, ticket_id: job.ticket_id, commission_amount: job.seller_commission_amount,
                                  final_repair_amount: job.final_amount, seller_name: job.seller_name
                                };
                                setPayingCommission(matchingComm);
                              }}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold shadow"
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

              {jobs.length === 0 && (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Wrench className="w-8 h-8 mx-auto text-slate-600" />
                  <div className="font-bold text-white text-sm">No repair referrals yet</div>
                  <p className="text-xs text-slate-400">Referrals submitted by partner accessory stores will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 2: SELLER (ACCESSORIES & 2% REFERRAL EARNER) VIEW       */}
        {/* ============================================================ */}
        {role === 'SELLER' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black text-white">Seller Referrals &amp; 2% Earnings Hub</h1>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    {user.shopName || user.name || 'Accessory Partner'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Refer walk-in mobile repair customers to your partner repair shop. Earn strictly 2% on completed repair bills!
                </p>
              </div>

              <button
                onClick={() => setIsReferralOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Refer New Customer</span>
              </button>
            </div>

            {/* Seller Earnings Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">My Referred Customers</div>
                <div className="text-2xl font-black text-white mt-1">
                  {jobs.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Assigned to repair shop</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Pending 2% Commissions</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  ₹{commissions.summary?.pendingCommission || 0}
                </div>
                <div className="text-[11px] text-amber-400/80 mt-1">Awaiting shop payout</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Total 2% Paid &amp; Received</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{commissions.summary?.paidCommission || 0}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Directly credited to you</div>
              </div>
            </div>

            {/* Referred Repairs Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white">My Referred Repair Requests</h2>
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
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {job.final_amount > 0 ? `₹${job.final_amount}` : 'Pending repair'}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {jobs.length === 0 && (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Store className="w-8 h-8 mx-auto text-slate-600" />
                  <div className="font-bold text-white text-sm">No referrals created yet</div>
                  <p className="text-xs text-slate-400">Click &quot;+ Refer New Customer&quot; above to submit your first walk-in repair referral.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 3: SUPER ADMIN VIEW                                    */}
        {/* ============================================================ */}
        {role === 'SUPER_ADMIN' && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white">Super Admin Command Center</h1>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full font-bold border border-purple-500/30">
                  Platform Oversight
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor repair shops, verify sellers, and audit the global 2% referral commission flow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Registered Shops</div>
                <div className="text-2xl font-black text-white mt-1">{platformStats.totalShops || 0}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Associated Sellers</div>
                <div className="text-2xl font-black text-purple-400 mt-1">{platformStats.totalSellers || 0}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Gross Repair Volume</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{platformStats.totalRepairVolume?.toLocaleString('en-IN') || 0}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Total 2% Referral Paid</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  ₹{platformStats.totalCommissionPaid?.toLocaleString('en-IN') || 0}
                </div>
              </div>
            </div>

            {/* Global 2% Commission Ledger */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-6 py-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white">Global 2% Referral Commission Audit Trail</h2>
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            c.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
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

        {/* ============================================================ */}
        {/* ROLE 4: CUSTOMER / PUBLIC TRACKING VIEW                     */}
        {/* ============================================================ */}
        {role === 'CUSTOMER' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center pb-2">
              <h1 className="text-2xl font-black text-white">Track Your Mobile Repair</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Ticket ID to check diagnosis, repair progress, and bill.
              </p>
            </div>

            <form onSubmit={handleTrackTicket} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl flex gap-3">
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Enter Ticket ID (e.g. REP-1048)"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white uppercase focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{trackingLoading ? 'Searching...' : 'Track Ticket'}</span>
              </button>
            </form>

            {trackingError && (
              <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-4 rounded-2xl text-xs">
                {trackingError}
              </div>
            )}

            {trackedJob && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                  <div>
                    <span className="font-mono text-xs text-amber-400 font-bold">{trackedJob.ticket_id}</span>
                    <h2 className="text-lg font-bold text-white mt-0.5">{trackedJob.device_brand} {trackedJob.device_model}</h2>
                    <div className="text-xs text-slate-400">Customer: {trackedJob.customer_name}</div>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black uppercase">
                      {trackedJob.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-medium">Issue Diagnosed</div>
                    <div className="text-white font-semibold mt-1">{trackedJob.problem_description}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-medium">Assigned Repair Shop</div>
                    <div className="text-white font-semibold mt-1">Partner Repair Shop</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Total Bill Amount</div>
                    <div className="text-xl font-black text-white mt-0.5">
                      {trackedJob.final_amount > 0 ? `₹${trackedJob.final_amount.toLocaleString('en-IN')}` : `Est. ₹${trackedJob.estimated_cost}`}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    Referred via: <strong className="text-slate-200">{trackedJob.seller_name || 'Partner Accessory Store'}</strong>
                  </div>
                </div>
              </div>
            )}
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
