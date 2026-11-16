'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, AlertCircle, CheckCircle2, Store,
  MessageCircle, Send, Check, Smartphone, Sparkles, X, RefreshCw
} from 'lucide-react';
import { notificationService } from '../services/notificationService';

export default function VerifyPartnerModal({ isOpen, onClose, partner, onVerified }) {
  const [sendingAlert, setSendingAlert] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Direct OTP generation when modal opens
  useEffect(() => {
    if (isOpen && partner) {
      setInputOtp('');
      setOtpError('');
      setIsOtpVerified(false);
      setError('');
      setSuccess(false);

      // Directly send/generate OTP for this partner
      setSendingAlert(true);
      notificationService
        .sendPartnerVerificationAlert({
          name: partner.name,
          phone: partner.phone,
          email: partner.email,
          shopName: partner.shop_name || partner.shopName || partner.name,
        })
        .then((res) => {
          setGeneratedOtp(res.code);
        })
        .catch((err) => {
          setError('Failed to dispatch OTP alert: ' + err.message);
        })
        .finally(() => {
          setSendingAlert(false);
        });
    }
  }, [isOpen, partner]);

  if (!isOpen || !partner) return null;

  const cleanPhone = String(partner.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // WhatsApp pre-composed direct dispatch link
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hi ${partner.name}! This is SmartFix Hub.\n\nYour Genuine Store Partner Verification Code for "${partner.shop_name || partner.name}" is: *${generatedOtp || '----'}*.\n\nPlease share this 4-digit code with the Admin to verify your store.`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  // Re-generate OTP
  const handleRegenerateOtp = async () => {
    try {
      setSendingAlert(true);
      setError('');
      setOtpError('');
      const res = await notificationService.sendPartnerVerificationAlert({
        name: partner.name,
        phone: partner.phone,
        email: partner.email,
        shopName: partner.shop_name || partner.shopName || partner.name,
      });
      setGeneratedOtp(res.code);
      setInputOtp('');
    } catch (err) {
      setError('Failed to resend code: ' + err.message);
    } finally {
      setSendingAlert(false);
    }
  };

  // Verify OTP
  const handleVerifyAndConfirm = async (codeToVerify) => {
    const code = codeToVerify || inputOtp;
    if (!code) {
      setOtpError('Please enter the 4-digit verification code');
      return;
    }

    const check = notificationService.verifyPartnerCode(
      partner.phone || partner.email,
      code,
      generatedOtp
    );

    if (!check.verified) {
      setOtpError(check.error || 'Invalid code. Please enter the correct 4-digit code.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setOtpError('');
      setIsOtpVerified(true);

      // Record in persistent storage
      notificationService.markPartnerAsVerified(partner.email, {
        phone: partner.phone,
        name: partner.name,
        shopName: partner.shop_name || partner.shopName,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'ADMIN_OTP_AUTHENTICATION',
      });

      // Post audit alert to notification stream
      notificationService.addNotificationAlert({
        type: 'PARTNER_VERIFIED',
        title: 'Genuine Partner Verified via OTP',
        message: `Store "${partner.shop_name || partner.name}" (${partner.phone || partner.email}) verified as genuine partner via direct OTP.`,
        timestamp: new Date().toISOString(),
      });

      setSuccess(true);
      if (onVerified) {
        onVerified(partner.id || partner.email);
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans relative">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Direct OTP Partner Verification</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify genuine store partner identity with 4-digit OTP.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
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
            <span>Partner successfully verified as Genuine! Badge activated.</span>
          </div>
        )}

        {/* Store Summary Card */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="font-extrabold text-white text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>{partner.shop_name || partner.shopName || partner.name}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-bold">
              Accessory Partner
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] pt-1">
            <div>Owner: <strong className="text-slate-200">{partner.name}</strong></div>
            <div>Phone: <strong className="text-slate-200">{partner.phone || '—'}</strong></div>
            <div className="col-span-2 truncate">Email: <strong className="text-slate-200">{partner.email}</strong></div>
          </div>
        </div>

        {/* Direct OTP Section */}
        <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Direct Security OTP Dispatched</span>
            </div>
            {isOtpVerified && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Live Alert Toast Box */}
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-[11px] text-purple-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Security Code Dispatched to Partner's Phone</span>
            </div>
            <p className="text-[10px] text-slate-300">
              Notification alert sent to <strong className="text-white font-mono">+{formattedPhone}</strong>. Please ask the partner to share the 4-digit code they received.
            </p>
          </div>

          {/* Real WhatsApp Option */}
          {cleanPhone.length >= 10 && (
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>📲 Send Real Code via WhatsApp (+{formattedPhone})</span>
            </a>
          )}

          {/* Input OTP & Verify Button */}
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="Enter 4-digit OTP from partner"
                className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center font-bold tracking-widest focus:outline-none focus:border-purple-500 text-sm"
              />
              <button
                type="button"
                onClick={() => handleVerifyAndConfirm(inputOtp)}
                disabled={saving || !inputOtp}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition"
              >
                {saving ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>

            {otpError && (
              <div className="text-[10px] text-rose-400 font-medium">{otpError}</div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <button
                type="button"
                onClick={handleRegenerateOtp}
                disabled={sendingAlert}
                className="hover:text-purple-300 underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${sendingAlert ? 'animate-spin' : ''}`} />
                <span>Resend OTP to Partner</span>
              </button>
              <span className="text-[10px] text-slate-500">Awaiting code from store partner</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => handleVerifyAndConfirm(inputOtp)}
            disabled={saving || (!isOtpVerified && !inputOtp)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-emerald-900/30 transition flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{saving ? 'Activating...' : (isOtpVerified ? 'Partner Verified' : 'Confirm Genuine Partner')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
