'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import CommissionCalculator from '../../components/CommissionCalculator';
import AdminCompleteRepairModal from '../../components/AdminCompleteRepairModal';
import AdminPayCommissionModal from '../../components/AdminPayCommissionModal';
import AdminOnboardSellerModal from '../../components/AdminOnboardSellerModal';
import RoleGuard from '../../components/RoleGuard';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Store, Clock, UserPlus, CheckCircle2, Phone, Mail } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingJob, setCompletingJob] = useState(null);
  const [payingCommission, setPayingCommission] = useState(null);
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [j, c, s] = await Promise.all([
        supabaseService.getRepairJobs({ adminId: user?.id }),
        supabaseService.getCommissions({ adminId: user?.id }),
        supabaseService.getAffiliatedSellers(user?.id),
      ]);
      setJobs(j || []);
      setCommissions(c || { data: [], summary: {} });
      setSellers(s || []);
    } catch (err) {
      console.error('Failed to load admin repair jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleStatusChange = async (jobId, newStatus) => {
    await supabaseService.updateRepairStatus(jobId, newStatus);
    await loadData();
  };

  const handleCompleteJob = async (jobId, amount, notes) => {
    await supabaseService.completeRepairJob(jobId, amount, notes);
    await loadData();
  };

  const handlePayCommission = async (commId, ref) => {
    await supabaseService.paySellerCommission(commId, ref);
    await loadData();
  };

  const handleSellerOnboarded = async (sellerData) => {
    const created = await supabaseService.onboardSeller(sellerData, user);
    await loadData();
    return created;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar />
      <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
        <main className="max-w-7xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
          <CommissionCalculator initialAmount={2000} />
          
          {/* Admin Header Workbench */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Admin Repair Hub</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.shopName || user?.name || 'Admin Shop'} — Repair Workbench
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage active device diagnostics, register affiliate accessory sellers, and settle 2% referral commissions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsOnboardOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Onboard Partner Seller</span>
                </button>

                <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Pending 2%</div>
                  <div className="text-sm font-black text-amber-400">
                    ₹{commissions.summary?.pendingCommission || 0}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Paid 2%</div>
                  <div className="text-sm font-black text-emerald-400">
                    ₹{commissions.summary?.paidCommission || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: AFFILIATED PARTNER SELLERS */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-extrabold text-white">Registered Accessory Sellers (2% Referral Partners)</h2>
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
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
                  <Store className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-300">No partner sellers onboarded yet</div>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Click &quot;+ Onboard Partner Seller&quot; to register local mobile accessory shops. They will log in with their credentials and refer repair customers to you.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sellers.map((s) => (
                    <div key={s.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-2 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{s.name}</div>
                          <div className="text-[11px] text-emerald-400 font-semibold">{s.shop_name || 'Accessory Partner'}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                          Active
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{s.email}</span>
                        </div>
                        {s.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* SECTION 2: LIVE REPAIR JOBS QUEUE */}
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
              <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Live Repair Jobs Queue</h2>
                <span className="text-xs text-slate-400">{jobs.length} total jobs</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs">Loading repair jobs from Supabase...</div>
              ) : jobs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-semibold text-slate-300">No repair jobs in queue</p>
                  <p className="text-[11px] text-slate-500">
                    When partner sellers or walk-in customers submit repairs, they will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Device &amp; Issue</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Bill Amount</th>
                        <th className="py-3 px-4 font-bold text-emerald-400">Seller 2%</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">{job.ticket_id}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{job.customer_name}</div>
                            <div className="text-[10px] text-slate-400">{job.customer_phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-200">{job.device_brand} {job.device_model}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">{job.problem_description}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              job.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {job.final_amount ? `₹${job.final_amount}` : (job.estimated_cost ? `₹${job.estimated_cost} (est.)` : 'Pending')}
                          </td>
                          <td className="py-3 px-4 text-emerald-400 font-extrabold">
                            {Number(job.seller_commission_amount) > 0 ? `₹${job.seller_commission_amount}` : '₹0'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                            {job.status === 'ACCEPTED' && (
                              <button 
                                onClick={() => handleStatusChange(job.id, 'IN_PROGRESS')} 
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 rounded font-bold text-[11px] transition shadow"
                              >
                                Start Repair
                              </button>
                            )}
                            {job.status === 'IN_PROGRESS' && (
                              <button 
                                onClick={() => setCompletingJob(job)} 
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-bold text-[11px] transition shadow"
                              >
                                Complete (2%)
                              </button>
                            )}
                            {job.status === 'COMPLETED' && job.commission_status === 'PENDING' && (
                              <button 
                                onClick={() => setPayingCommission({ 
                                  id: job.id, 
                                  ticket_id: job.ticket_id, 
                                  commission_amount: job.seller_commission_amount, 
                                  final_repair_amount: job.final_amount,
                                  seller_name: job.seller_name
                                })} 
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 rounded font-bold text-[11px] transition shadow"
                              >
                                Settle 2%
                              </button>
                            )}
                            {job.commission_status === 'PAID' && (
                              <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950 border border-emerald-800 rounded">
                                Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </RoleGuard>

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
      <AdminOnboardSellerModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onSellerCreated={handleSellerOnboarded}
        adminUser={user}
      />
    </div>
  );
}
