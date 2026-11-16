'use client';

import React, { useState, useEffect } from 'react';
import {
  Store, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw,
  Bell, Smartphone, Send, Sparkles, Check, MessageCircle
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { notificationService } from '../services/notificationService';

export default function SuperAdminOnboardSellerModal({ isOpen, onClose, onSellerCreated, superAdminUser }) {
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [form, setForm] = useState({
    selectedAdminId: '',
    name: '',
    email: '',
    phone: '',
    shopName: '',
    password: 'Seller@123',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Genuine Partner Verification Alert States
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [alertModalDetails, setAlertModalDetails] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoadingAdmins(true);
      supabaseService.getAllAdmins()
        .then((data) => {
          setAdmins(data || []);
          if (data && data.length > 0 && !form.selectedAdminId) {
            setForm((prev) => ({ ...prev, selectedAdminId: data[0].id }));
          }
        })
        .catch((err) => {
          console.error('Failed to load admins:', err);
        })
        .finally(() => {
          setLoadingAdmins(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Dispatch Verification Alert
  const handleSendAlert = async () => {
    if (!form.phone && !form.email) {
      setError('Please provide seller phone or email to send verification alert');
      return;
    }

    try {
      setSendingAlert(true);
      setError('');
      setOtpError('');

      const res = await notificationService.sendPartnerVerificationAlert({
        name: form.name || 'Store Partner',
        phone: form.phone,
        email: form.email,
        shopName: form.shopName || `${form.name} Accessories`,
      });

      setAlertSent(true);
      setGeneratedOtp(res.code);
      setAlertModalDetails(res);
    } catch (err) {
      setError('Failed to dispatch alert: ' + err.message);
    } finally {
      setSendingAlert(false);
    }
  };

  // 2. Validate Partner OTP
  const handleVerifyOtp = (codeToVerify) => {
    const code = codeToVerify || inputOtp;
    if (!code) {
      setOtpError('Please enter the 4-digit code sent to the partner');
      return;
    }

    const check = notificationService.verifyPartnerCode(
      form.phone || form.email,
      code,
      generatedOtp
    );

    if (check.verified) {
      setIsVerified(true);
      setOtpError('');
    } else {
      setOtpError(check.error || 'Invalid code');
    }
  };

  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setInputOtp(generatedOtp);
      handleVerifyOtp(generatedOtp);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.selectedAdminId) {
      setError('Please select an assigned Repair Shop Admin for this seller');
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please provide seller full name and email');
      return;
    }

    const selectedAdmin = admins.find((a) => a.id === form.selectedAdminId);

    try {
      setLoading(true);
      setError('');
      const created = await onSellerCreated({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        shopName: form.shopName.trim() || `${form.name.trim()} Accessories`,
        adminId: form.selectedAdminId,
        shopId: selectedAdmin?.shopId || null,
        password: form.password,
        isVerified,
        verificationStatus: isVerified ? 'VERIFIED_GENUINE' : 'STANDARD',
        verifiedAt: isVerified ? new Date().toISOString() : null,
      });

      // Post audit notification alert
      notificationService.addNotificationAlert({
        type: 'PARTNER_VERIFIED',
        title: isVerified ? 'Genuine Store Partner Verified' : 'New Partner Onboarded',
        message: `Store "${form.shopName || form.name}" (${form.phone || form.email}) ${isVerified ? 'verified as genuine partner' : 'onboarded'} under Admin "${selectedAdmin?.name || 'Admin'}".`,
        timestamp: new Date().toISOString(),
      });

      setSuccess(created);
      setTimeout(() => {
        setSuccess(null);
        setForm({
          selectedAdminId: admins[0]?.id || '',
          name: '',
          email: '',
          phone: '',
          shopName: '',
          password: 'Seller@123',
        });
        setAlertSent(false);
        setIsVerified(false);
        setInputOtp('');
        setGeneratedOtp('');
        setAlertModalDetails(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to onboard seller under admin');
    } finally {
      setLoading(false);
    }
  };

  const selectedAdmin = admins.find((a) => a.id === form.selectedAdminId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-white">Onboard Seller Under Admin</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                  Super Admin
                </span>
                {isVerified && (
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    GENUINE VERIFIED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign and verify a genuine mobile accessory seller under an authorized Repair Shop Admin.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Seller successfully onboarded under {selectedAdmin?.shopName || 'Admin'}!</span>
          </div>
        )}

        {/* Governance Notice Banner */}
        <div className="bg-purple-950/20 p-3 rounded-2xl border border-purple-500/30 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Attribution &amp; 2% Commission Rule</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            All repair jobs referred by this seller will be dispatched directly to the selected Admin&apos;s repair workshop. The Admin will oversee diagnosis, complete repairs, and settle the 2% referral fee.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Target Admin Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Select Assigned Repair Shop Admin <span className="text-rose-400">*</span>
            </label>
            {loadingAdmins ? (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 flex items-center gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Loading registered repair shop admins...</span>
              </div>
            ) : admins.length === 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                No registered Repair Shop Admins found. Register an Admin first.
              </div>
            ) : (
              <select
                required
                value={form.selectedAdminId}
                onChange={(e) => setForm({ ...form, selectedAdminId: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              >
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} &bull; {admin.shopName} ({admin.email})
                  </option>
                ))}
              </select>
            )}
            {selectedAdmin && (
              <p className="text-[10px] text-slate-400 mt-1">
                Assigned Hub: <strong className="text-purple-300">{selectedAdmin.shopName}</strong> &bull; Contact: {selectedAdmin.phone || selectedAdmin.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Full Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Accessory Store Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                placeholder="e.g. Balaji Mobile Accessories"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Login Email <span className="text-rose-400">*</span></label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seller@example.com"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Seller Phone Number <span className="text-rose-400">*</span></label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
              />
            </div>
          </div>

          {/* ============================================================== */}
          {/* GENUINE PARTNER VERIFICATION & NOTIFICATION ALERT SECTION      */}
          {/* ============================================================== */}
          <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <Bell className="w-3.5 h-3.5 text-purple-400" />
                <span>Genuine Partner Verification Alert</span>
              </div>
              {isVerified ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <Check className="w-3 h-3" />
                  <span>Verified Genuine</span>
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-medium">Unverified Partner</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Send an instant verification alert to the partner&apos;s contact to verify authentic identity before assigning to this Admin.
            </p>

            {!isVerified ? (
              <div className="space-y-2.5 pt-1">
                {!alertSent ? (
                  <button
                    type="button"
                    onClick={handleSendAlert}
                    disabled={sendingAlert}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 hover:border-purple-400 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    {sendingAlert ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{sendingAlert ? 'Dispatching Security Alert...' : '🔔 Send Verification Alert to Store Partner'}</span>
                  </button>
                ) : (
                  <div className="space-y-2 animate-in fade-in">
                    
                    {/* Simulated live notification toast banner */}
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-[11px] text-purple-200 flex items-start gap-2 shadow-inner">
                      <Smartphone className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>Verification Code Dispatched to Partner</span>
                          <span className="text-[9px] bg-purple-500/30 px-1.5 py-0.2 rounded font-mono">SMS ALERT</span>
                        </div>
                        <p className="text-slate-300 text-[10px]">
                          Notification alert sent to <strong className="text-white">{form.phone}</strong>. Please ask the partner for the 4-digit code.
                        </p>
                      </div>
                    </div>

                    {/* Direct WhatsApp Alert Option */}
                    {form.phone && form.phone.replace(/[^0-9]/g, '').length >= 10 && (
                      <a
                        href={`https://wa.me/${form.phone.replace(/[^0-9]/g, '').length === 10 ? '91' + form.phone.replace(/[^0-9]/g, '') : form.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi ${form.name}! SmartFix Governance Alert: Your verification code for genuine store registration of "${form.shopName || form.name}" under ${selectedAdmin?.shopName || 'Admin'} is: *${generatedOtp}*. Please share this with the admin.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>📲 Send Real Code via WhatsApp to Partner</span>
                      </a>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value)}
                        placeholder="Enter 4-digit code"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center font-bold tracking-widest focus:outline-none focus:border-purple-500 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyOtp(inputOtp)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                      >
                        Verify
                      </button>
                    </div>

                    {otpError && (
                      <div className="text-[10px] text-rose-400 font-medium">{otpError}</div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <button
                        type="button"
                        onClick={handleSendAlert}
                        className="hover:text-purple-300 underline"
                      >
                        Resend alert
                      </button>
                      <span className="text-[10px] text-slate-500">Ask partner for code</span>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-300">
                    Store Partner Authenticated as Genuine!
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">OTP Verified</span>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Default Password</label>
            <input
              type="text"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Default password provided to seller for login on /login.</p>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || admins.length === 0}
              className={`px-5 py-2.5 rounded-xl font-black shadow-lg transition flex items-center space-x-2 disabled:opacity-50 text-white ${
                isVerified
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/30'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Onboarding Seller...' : isVerified ? 'Create Verified Genuine Partner' : 'Create Seller Under Admin'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
