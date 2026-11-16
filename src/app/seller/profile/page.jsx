'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import RoleGuard from '../../../components/RoleGuard';
import { useAuth } from '../../../context/AuthContext';
import { supabaseService } from '../../../services/supabaseService';
import {
  Store, UserCheck, ShieldCheck, KeyRound, Lock, Eye, EyeOff,
  Mail, Phone, ShieldAlert, ArrowLeft, CheckCircle2, AlertTriangle,
  Building, Percent, Sparkles, RefreshCw, Smartphone
} from 'lucide-react';

export default function SellerProfilePage() {
  const { user, isDefaultPassword, updatePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('Seller@123');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live password record info
  const [pwdInfo, setPwdInfo] = useState(null);

  useEffect(() => {
    if (user?.email) {
      const info = supabaseService.getSellerPasswordInfo(user.email);
      setPwdInfo(info);
    }
  }, [user]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please provide your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === 'Seller@123') {
      setError('Please choose a new custom password different from default "Seller@123".');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await updatePassword(currentPassword, newPassword);
      setSuccess('Your password has been updated and secured successfully!');
      setNewPassword('');
      setConfirmPassword('');
      const updatedInfo = supabaseService.getSellerPasswordInfo(user.email);
      setPwdInfo(updatedInfo);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDefaultActive = isDefaultPassword || pwdInfo?.isDefault;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <RoleGuard allowedRoles={['SELLER', 'SUPER_ADMIN']}>
        <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">

          {/* Navigation Breadcrumb */}
          <div className="flex items-center justify-between">
            <Link
              href="/seller"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Seller Workbench</span>
            </Link>

            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ROLE: PARTNER SELLER
            </span>
          </div>

          {/* Partner Store Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-emerald-600/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user?.shopName || user?.name || 'Partner Accessory Store'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Store Partner
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Affiliated Mobile Accessories Store &bull; Authorized 2% Referral Commission Partner
                </p>
                {user?.shopName && (
                  <div className="text-xs text-amber-400 font-semibold pt-0.5">
                    Assigned Repair Hub: <strong>{user?.shopName}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Store & Profile Details (2 Cols on lg) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Profile Overview */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Store Details</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Store Owner / Partner</label>
                    <div className="font-bold text-white text-sm">{user?.name || 'Store Partner'}</div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Login Email</label>
                    <div className="font-mono text-slate-300 flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  {user?.phone && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Registered Phone</label>
                      <div className="font-mono text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{user?.phone}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Referral Commission Rate</label>
                    <div className="text-emerald-400 font-black flex items-center gap-1 text-sm">
                      <Percent className="w-4 h-4" />
                      <span>2.0% on completed repair billing</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Assigned Workshop Admin</label>
                    <div className="text-white font-medium">
                      {user?.shopName || 'Registered Hub Admin'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <div className="font-bold text-slate-300">Partner Privileges</div>
                    <div>&bull; Issue walk-in repair referral tickets</div>
                    <div>&bull; Auto-credited 2% referral fee</div>
                    <div>&bull; List store inventory on marketplace</div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Quick Actions</h4>
                <Link
                  href="/seller"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Repair Referrals Queue</span>
                  </span>
                  <span>&rarr;</span>
                </Link>
                <Link
                  href="/marketplace"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>Public Marketplace</span>
                  </span>
                  <span>&rarr;</span>
                </Link>
              </div>

            </div>

            {/* Right Column: Password Management & Security (2 Cols on lg) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Password Status Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white flex items-center gap-2.5">
                      <KeyRound className="w-5 h-5 text-amber-400" />
                      <span>Account Security &amp; Password</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage your password credentials. Once reset, the default login alert will be permanently disabled.
                    </p>
                  </div>

                  {/* Password Status Badge */}
                  <div>
                    {isDefaultActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Default Password Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Custom Password Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Warning Banner if using default */}
                {isDefaultActive && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 space-y-1.5">
                    <div className="font-black flex items-center gap-2 text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Security Recommendation: Reset Default Password</span>
                    </div>
                    <p className="leading-relaxed text-amber-300/90">
                      Your store partner account is currently using the system initial password (<code className="font-mono bg-amber-950/80 px-1 py-0.5 rounded text-amber-200">Seller@123</code>). Please choose your own private password to secure your store and protect commission withdrawals.
                    </p>
                  </div>
                )}

                {/* Status Alerts */}
                {error && (
                  <div className="p-3.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Password Change Form */}
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Current Password</span>
                      {isDefaultActive && (
                        <span className="text-[11px] text-amber-400 font-mono">Current Default: Seller@123</span>
                      )}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password (default: Seller@123)"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>New Private Password</span>
                      <span className="text-[10px] text-slate-500">Minimum 6 characters</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new custom password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new custom password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{submitting ? 'Updating Password...' : 'Save New Password & Secure Account'}</span>
                    </button>
                  </div>
                </form>

                {/* Audit Information */}
                {pwdInfo?.lastUpdated && (
                  <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-4 flex items-center justify-between">
                    <span>Password last updated:</span>
                    <span className="font-mono text-slate-400">
                      {new Date(pwdInfo.lastUpdated).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

        </main>
      </RoleGuard>
    </div>
  );
}
