'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import CommissionCalculator from '../../components/CommissionCalculator';
import SellerReferralModal from '../../components/SellerReferralModal';
import RoleGuard from '../../components/RoleGuard';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Store, Clock, CheckCircle2, TrendingUp, Banknote, Smartphone, Wrench } from 'lucide-react';

export default function SellerPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [isReferralOpen, setIsReferralOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, comm] = await Promise.all([
        supabaseService.getRepairJobs({ sellerId: user?.id }),
        supabaseService.getCommissions({ sellerId: user?.id }),
      ]);
      setJobs(list || []);
      setCommissions(comm || { data: [], summary: {} });
    } catch (err) {
      console.error('Failed to load seller repair jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

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

  const completedJobsCount = jobs.filter((j) => j.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar />
      <RoleGuard allowedRoles={['SELLER', 'SUPER_ADMIN']}>
        <main className="max-w-7xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
          
          {/* 2% Commission Formula Calculator */}
          <CommissionCalculator initialAmount={2500} />

          {/* Seller Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold mb-2.5 border border-emerald-500/30">
                <Store className="w-3.5 h-3.5" />
                <span>Mobile Accessories Partner &bull; 2% Referral Earner</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white">
                {user?.shopName || user?.name || 'Seller Store'}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Partnered with repair center. Refer walk-in customers with damaged devices and earn 2% commission automatically on completed bills.
              </p>
            </div>

            <button
              onClick={() => setIsReferralOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Refer New Repair Customer</span>
            </button>
          </div>

          {/* Seller Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Referrals</span>
                <Smartphone className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{jobs.length}</div>
              <div className="text-[10px] text-slate-500">Walk-in customers referred</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Completed Repairs</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{completedJobsCount}</div>
              <div className="text-[10px] text-slate-500">Fixed &amp; finalized by Admin</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Pending 2% Earnings</span>
                <Banknote className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                ₹{commissions.summary?.pendingCommission || 0}
              </div>
              <div className="text-[10px] text-amber-400/80">Awaiting shop payout</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total 2% Received</span>
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-teal-300">
                ₹{commissions.summary?.paidCommission || 0}
              </div>
              <div className="text-[10px] text-slate-500">Settled to your UPI account</div>
            </div>

          </div>

          {/* Referral Jobs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-white">My Referred Repair Requests</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Live tracking of your customers and earned 2% referral cuts</p>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{jobs.length} total referrals</span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading your referrals from Supabase...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs space-y-3">
                <Store className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-extrabold text-base text-slate-300">No referral requests created yet</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When a customer visits your accessory store with a damaged phone, click &quot;Refer New Repair Customer&quot; above to submit the referral.
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
                      <th className="py-3 px-4">Final Bill</th>
                      <th className="py-3 px-4 font-bold text-emerald-400">My 2% Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{job.ticket_id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{job.customer_name}</div>
                          <div className="text-[10px] text-slate-400">{job.customer_phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">{job.device_brand} {job.device_model}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{job.problem_description}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            job.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            job.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {job.final_amount ? `₹${job.final_amount}` : (job.estimated_cost ? `₹${job.estimated_cost} (est.)` : 'Pending repair')}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-black">
                          {Number(job.seller_commission_amount) > 0 ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-sm">₹{job.seller_commission_amount}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                job.commission_status === 'PAID' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                              }`}>
                                {job.commission_status || 'PENDING'}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-normal">2% upon completion</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </RoleGuard>

      <SellerReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        currentSeller={user}
        onCreated={handleCreateReferral}
      />
    </div>
  );
}
