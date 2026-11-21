'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, AlertCircle, ShieldCheck, CheckSquare, Square, Smartphone, 
  CheckCircle2, Camera, Image as ImageIcon, Trash2, UploadCloud, Loader2, 
  X, Copy, Check, Sparkles, User, Phone, IndianRupee, ArrowRight, Wrench
} from 'lucide-react';
import { getWhatsAppRepairTrackingUrl, getWhatsAppAdminRepairAlertUrl } from '../utils/productImages';
import { uploadProductImageFile, fileToDataUrl } from '../services/storageService';

// Popular Indian smartphone brands for quick 1-tap mobile selection
const POPULAR_BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Realme', 'Oppo', 'Other'];

export default function SellerReferralModal({
  isOpen,
  onClose,
  onCreated,
  onSubmit,
  currentSeller,
  sellerUser,
  adminPhone,
}) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: '',
    deviceModel: '',
    problemDescription: '',
    estimatedCost: '',
  });

  // Pre-Repair Device Intake Condition Checklist
  const [intakeChecklist, setIntakeChecklist] = useState({
    powersOn: true,
    touchWorking: false,
    cameraWorking: true,
    biometricsWorking: true,
    bodyCondition: 'MINOR_SCRATCHES',
  });

  // Device Intake Photos (up to 4 photos: screen, back, frame, damage)
  const [devicePhotos, setDevicePhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdJob, setCreatedJob] = useState(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Target Admin Phone for WhatsApp Alert (editable if needed)
  const [targetAdminPhone, setTargetAdminPhone] = useState('');

  useEffect(() => {
    if (createdJob) {
      setTargetAdminPhone(createdJob.admin_phone || adminPhone || sellerUser?.adminPhone || currentSeller?.adminPhone || '+91 98450 11223');
    }
  }, [createdJob, adminPhone, sellerUser, currentSeller]);

  if (!isOpen) return null;

  const toggleCheck = (field) => {
    setIntakeChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const seller = sellerUser || currentSeller;
  const estimatedCostNum = Number(form.estimatedCost) || 0;
  const sellerCommissionPreview = Math.round(estimatedCostNum * 0.02);

  // Handle uploading photos
  const handlePhotoUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const availableSlots = 4 - devicePhotos.length;

    if (availableSlots <= 0) {
      setError('Maximum 4 photos allowed per intake ticket.');
      return;
    }

    setUploadingPhotos(true);
    setError('');
    const newUrls = [];

    for (const file of files.slice(0, availableSlots)) {
      try {
        const uploaded = await uploadProductImageFile(file, { folder: 'repair_intake' });
        if (uploaded?.url) {
          newUrls.push(uploaded.url);
        }
      } catch (err) {
        console.warn('Direct upload failed, using Data URL fallback:', err.message);
        try {
          const dataUrl = await fileToDataUrl(file);
          newUrls.push(dataUrl);
        } catch (convErr) {
          console.error('File conversion failed:', convErr);
        }
      }
    }

    setDevicePhotos((prev) => [...prev, ...newUrls]);
    setUploadingPhotos(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (indexToRemove) => {
    setDevicePhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCopyTicket = (ticketId) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ticketId);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      setError('Please provide customer name and phone');
      return;
    }

    const submitFn = onCreated || onSubmit;
    if (typeof submitFn !== 'function') {
      setError('Internal error: Submit handler not provided.');
      return;
    }

    const intakeSummary = `[Pre-Repair Intake Inspection]: Powers On: ${intakeChecklist.powersOn ? 'YES' : 'NO'}, Display Touch: ${intakeChecklist.touchWorking ? 'WORKING' : 'FAULTY/BROKEN'}, Cameras: ${intakeChecklist.cameraWorking ? 'OK' : 'DAMAGED'}, Biometrics/FaceID: ${intakeChecklist.biometricsWorking ? 'OK' : 'FAILED'}, Body Condition: ${intakeChecklist.bodyCondition.replace('_', ' ')}.`;

    try {
      setLoading(true);
      setError('');
      const res = await submitFn({
        ...form,
        estimatedCost: estimatedCostNum,
        sellerId: seller?.id,
        sellerName: seller?.shopName || seller?.name || 'Seller Partner',
        notes: intakeSummary,
        images: devicePhotos,
        image_url: devicePhotos[0] || null,
      });

      // reset form
      setForm({
        customerName: '',
        customerPhone: '',
        deviceBrand: '',
        deviceModel: '',
        problemDescription: '',
        estimatedCost: '',
      });
      setIntakeChecklist({
        powersOn: true,
        touchWorking: false,
        cameraWorking: true,
        biometricsWorking: true,
        bodyCondition: 'MINOR_SCRATCHES',
      });
      setDevicePhotos([]);

      if (res && res.ticket_id) {
        setCreatedJob({
          ...res,
          images: res.images || devicePhotos,
        });
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setCreatedJob(null);
    setDevicePhotos([]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div className="w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull-Down Indicator */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto sm:hidden mt-2.5 mb-1" />

        {/* Header - Sticky Top */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Smartphone className="w-5 h-5 font-bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white truncate">
                  {createdJob ? 'Repair Ticket Issued' : 'New Repair Referral Ticket'}
                </h3>
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>2% Commission</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                {createdJob ? 'Ticket ready to share with customer' : 'Intake device details for partner repair hub'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleModalClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition text-lg font-bold shrink-0 ml-2"
            title="Close"
          >
            &times;
          </button>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 bg-rose-950/70 border border-rose-800 text-rose-300 p-3 rounded-2xl text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* SUCCESS STATE: DIGITAL REPAIR INTAKE BOARDING PASS              */}
        {/* ============================================================== */}
        {createdJob ? (
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-4">
            
            {/* Ticket Card with Perforated Boarding Pass Styling */}
            <div className="relative bg-gradient-to-b from-slate-950 to-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-center space-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Official Customer Tracking ID
                </span>
                
                <div className="mt-1.5 flex items-center justify-center gap-2">
                  <div className="px-5 py-2.5 rounded-2xl bg-black border border-amber-500/50 font-mono text-amber-400 font-black text-2xl sm:text-3xl tracking-widest shadow-inner select-all">
                    {createdJob.ticket_id}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTicket(createdJob.ticket_id)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition border border-slate-700 shadow"
                    title="Copy Ticket ID"
                  >
                    {copiedTicket ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedTicket && (
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1 animate-in fade-in">
                    ✓ Ticket ID Copied to Clipboard!
                  </span>
                )}
              </div>

              {/* Customer & Device Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Customer</span>
                  <div className="font-bold text-white truncate">{createdJob.customer_name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{createdJob.customer_phone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Device Model</span>
                  <div className="font-bold text-white truncate">
                    {createdJob.device_brand} {createdJob.device_model}
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                    Est: ₹{createdJob.estimated_cost || 0}
                  </div>
                </div>
              </div>

              {/* Uploaded Photos Preview in Success State */}
              {createdJob.images && createdJob.images.length > 0 && (
                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center justify-center gap-1.5">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>Attached Intake Photos ({createdJob.images.length})</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                    {createdJob.images.map((img, idx) => (
                      <div key={idx} className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 shrink-0 shadow">
                        <img src={img} alt="Intake" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dual Action WhatsApp Dispatch: Customer & Admin Workshop */}
              <div className="space-y-3 pt-2">
                
                {/* 1. Customer Notification Button */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1. Customer Tracking WhatsApp</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{createdJob.customer_phone}</span>
                  </div>
                  <a
                    href={getWhatsAppRepairTrackingUrl({
                      customerPhone: createdJob.customer_phone,
                      customerName: createdJob.customer_name,
                      ticketId: createdJob.ticket_id,
                      deviceBrand: createdJob.device_brand,
                      deviceModel: createdJob.device_model,
                      problemDescription: createdJob.problem_description,
                      shopName: seller?.shopName || 'SmartFix Partner',
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                    </svg>
                    <span>Send Tracking ID ({createdJob.ticket_id}) to Customer</span>
                  </a>
                </div>

                {/* 2. Admin Workshop Notification Button */}
                <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-500/40 text-left space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      <span>2. Alert Admin Workshop on WhatsApp</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-400/80">
                      Technician Bay Alert
                    </span>
                  </div>

                  {/* Target Admin Phone input (editable if needed) */}
                  <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 shrink-0">Admin Workshop Phone:</label>
                    <input
                      type="text"
                      value={targetAdminPhone}
                      onChange={(e) => setTargetAdminPhone(e.target.value)}
                      placeholder="+91 98450 11223"
                      className="flex-1 px-2 py-0.5 bg-transparent border-0 text-white font-mono text-[11px] focus:outline-none"
                    />
                  </div>

                  <a
                    href={getWhatsAppAdminRepairAlertUrl({
                      adminPhone: targetAdminPhone || createdJob.admin_phone || adminPhone || seller?.adminPhone || '+91 98450 11223',
                      ticketId: createdJob.ticket_id,
                      customerName: createdJob.customer_name,
                      customerPhone: createdJob.customer_phone,
                      deviceBrand: createdJob.device_brand,
                      deviceModel: createdJob.device_model,
                      problemDescription: createdJob.problem_description,
                      estimatedCost: createdJob.estimated_cost,
                      sellerName: seller?.shopName || seller?.name || 'Partner Store',
                      sellerPhone: seller?.phone || null,
                      notes: createdJob.notes,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                    </svg>
                    <span>Send Intake Alert to Admin on WhatsApp</span>
                  </a>
                  <p className="text-[10px] text-slate-400 text-center">
                    Alerts workshop manager of ticket ID, fault details, and incoming intake unit.
                  </p>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition"
              >
                Done &amp; Close Ticket
              </button>
            </div>
          </div>
        ) : (

          /* ============================================================== */
          /* INTAKE FORM: RESPONSIVE & MOBILE-OPTIMIZED                      */
          /* ============================================================== */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              
              {/* SECTION 1: CUSTOMER CONTACTS */}
              <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Customer Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Customer Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      placeholder="e.g. Ramesh Verma"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Customer Phone <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={form.customerPhone}
                        onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DEVICE DETAILS & QUICK BRAND PILLS */}
              <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>2. Device Specification</span>
                </div>

                {/* Quick 1-Tap Brand Presets on Mobile */}
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                    Quick Brand Select:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_BRANDS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm({ ...form, deviceBrand: b === 'Other' ? '' : b })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                          form.deviceBrand === b
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Device Brand <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.deviceBrand}
                      onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })}
                      placeholder="e.g. Samsung / Apple"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Device Model <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.deviceModel}
                      onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
                      placeholder="e.g. Galaxy S22 / iPhone 13"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Problem / Damage Reported <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.problemDescription}
                    onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                    placeholder="e.g. Display glass cracked, touch working, charging port loose"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                </div>

                {/* Estimated Repair Cost + Live 2% Cut Calculator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-300">
                      Estimated Repair Cost (₹)
                    </label>
                    {estimatedCostNum > 0 && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ⚡ Your 2% Cut: ₹{sellerCommissionPreview}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={form.estimatedCost}
                      onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                      placeholder="e.g. 2500"
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PRE-REPAIR INTAKE CHECKLIST */}
              <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>3. Pre-Repair Intake Inspection</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Tap to toggle</span>
                </div>

                {/* 4 Diagnostic Check Cards */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  
                  <button
                    type="button"
                    onClick={() => toggleCheck('powersOn')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      intakeChecklist.powersOn
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold">Powers On</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      intakeChecklist.powersOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {intakeChecklist.powersOn ? 'YES' : 'NO'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck('touchWorking')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      intakeChecklist.touchWorking
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold">Touch Works</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      intakeChecklist.touchWorking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {intakeChecklist.touchWorking ? 'OK' : 'FAULTY'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck('cameraWorking')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      intakeChecklist.cameraWorking
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold">Cameras</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      intakeChecklist.cameraWorking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {intakeChecklist.cameraWorking ? 'OK' : 'DAMAGED'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck('biometricsWorking')}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      intakeChecklist.biometricsWorking
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold">FaceID / Touch</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                      intakeChecklist.biometricsWorking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {intakeChecklist.biometricsWorking ? 'OK' : 'FAILED'}
                    </span>
                  </button>

                </div>

                {/* Cosmetic Condition Selector */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase">
                    Body Cosmetic Condition:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                    {[
                      { id: 'FLAWLESS', label: 'Flawless' },
                      { id: 'MINOR_SCRATCHES', label: 'Minor Scratches' },
                      { id: 'HEAVY_DENTS', label: 'Dents & Scuffs' },
                      { id: 'CRACKED_BODY', label: 'Cracked Body' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIntakeChecklist({ ...intakeChecklist, bodyCondition: item.id })}
                        className={`py-2 px-2 rounded-xl font-bold border text-center transition truncate ${
                          intakeChecklist.bodyCondition === item.id
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: DEVICE CONDITION INTAKE PHOTOS */}
              <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>4. Device Condition Photos</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {devicePhotos.length}/4 Photos
                  </span>
                </div>

                {/* Photo Thumbnails */}
                {devicePhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {devicePhotos.map((photoUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-slate-700 bg-slate-900 shadow">
                        <img src={photoUrl} alt={`Intake ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-rose-600 text-white rounded-full transition shadow-md"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Trigger Button */}
                {devicePhotos.length < 4 && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingPhotos}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-3 border border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-2 transition text-xs font-semibold"
                    >
                      {uploadingPhotos ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>Uploading intake photo...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-emerald-400" />
                          <span>Tap to Upload / Take Damage Photos</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Footer - Sticky Bottom */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/95 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-xs transition transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Issuing Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Referral Ticket</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
