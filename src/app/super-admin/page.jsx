'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import CommissionCalculator from '../../components/CommissionCalculator';
import RoleGuard from '../../components/RoleGuard';
import { supabaseService } from '../../services/supabaseService';
import { ShieldCheck, Store, Users, Banknote, Clock, TrendingUp, Layers } from 'lucide-react';

export default function SuperAdminPage() {
  const [commissions, setCommissions] = useState({ data: [], summary: {} });
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabaseService.getCommissions(),
      supabaseService.getPlatformOverview(),
    ])
      .then(([c, o]) => {
        setCommissions(c || { data: [], summary: {} });
        setOverview(o?.stats || {});
      })
      .catch((err) => {
        console.error('Failed to load platform overview:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <Navbar />
      <RoleGuard allowedRoles={['SUPER_ADMIN']}>
        <main className="max-w-7xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
          <CommissionCalculator initialAmount={2500} />

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-bl-full pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold mb-3 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Governance &bull; Master Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Super Admin — System-Wide Audit</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time oversight of all affiliated repair shops, registered accessory sellers, and platform-wide 2% referral commission flow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Registered Repair Shops</span>
                <Store className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white">{overview.totalShops || 0}</div>
              <div className="text-[10px] text-slate-500">Verified repair centers</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Registered Sellers</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-purple-400">{overview.totalSellers || 0}</div>
              <div className="text-[10px] text-slate-500">Affiliated accessory stores</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Repair Volume</span>
                <Banknote className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">
                ₹{Number(overview.totalRepairVolume || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500">Gross completed repair bills</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>2% Referral Settled</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">
                ₹{Number(overview.totalCommissionPaid || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500">Paid to accessory sellers</div>
            </div>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-white">Platform-wide 2% Referral Commission Audit Trail</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Immutable audit ledger tracking referral earnings and settlements across all shops</p>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{commissions.data?.length || 0} total records</span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading audit ledger from Supabase...</span>
              </div>
            ) : !commissions.data || commissions.data.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs space-y-3">
                <Clock className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-extrabold text-base text-slate-300">No commission audit records yet</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When repair shops complete jobs referred by accessory sellers, 2% audit entries will populate here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Repair Shop</th>
                      <th className="py-3 px-4">Accessory Seller Partner</th>
                      <th className="py-3 px-4">Bill Amount</th>
                      <th className="py-3 px-4 text-emerald-400 font-bold">Seller 2%</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {commissions.data.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{c.ticket_id}</td>
                        <td className="py-3.5 px-4 text-slate-200">{c.shop_name || 'Repair Partner'}</td>
                        <td className="py-3.5 px-4 text-slate-200">{c.seller_name || 'Seller Partner'}</td>
                        <td className="py-3.5 px-4 font-bold text-white">₹{c.final_repair_amount}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-400">₹{c.commission_amount}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            c.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {c.status}
                          </span>
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
    </div>
  );
}
