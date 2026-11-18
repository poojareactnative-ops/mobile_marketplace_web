'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, ShieldCheck, CheckSquare, Square, Smartphone } from 'lucide-react';

export default function SellerReferralModal({
  isOpen,
  onClose,
  onCreated,
  onSubmit,
  currentSeller,
  sellerUser,
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
    bodyCondition: 'MINOR_SCRATCHES', // 'FLAWLESS' | 'MINOR_SCRATCHES' | 'HEAVY_DENTS' | 'CRACKED_BODY'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleCheck = (field) => {
    setIntakeChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
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

    const seller = sellerUser || currentSeller;

    // Compose human-readable intake notes to eliminate post-repair disputes
    const intakeSummary = `[Pre-Repair Intake Inspection]: Powers On: ${intakeChecklist.powersOn ? 'YES' : 'NO'}, Display Touch: ${intakeChecklist.touchWorking ? 'WORKING' : 'FAULTY/BROKEN'}, Cameras: ${intakeChecklist.cameraWorking ? 'OK' : 'DAMAGED'}, Biometrics/FaceID: ${intakeChecklist.biometricsWorking ? 'OK' : 'FAILED'}, Body Condition: ${intakeChecklist.bodyCondition.replace('_', ' ')}.`;

    try {
      setLoading(true);
      setError('');
      await submitFn({
        ...form,
        estimatedCost: Number(form.estimatedCost) || 0,
        sellerId: seller?.id,
        sellerName: seller?.shopName || seller?.name || 'Seller Partner',
        notes: intakeSummary,
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
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Refer Customer to Partner Repair Workshop</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates a verified intake ticket. You earn an automatic <strong>2% referral commission</strong> on completion.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Customer Contacts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="e.g. Ramesh Verma"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Customer Phone</label>
              <input
                type="tel"
                required
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Device Brand & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Device Brand</label>
              <input
                type="text"
                required
                value={form.deviceBrand}
                onChange={(e) => setForm({ ...form, deviceBrand: e.target.value })}
                placeholder="e.g. Apple, Samsung, Vivo"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Device Model</label>
              <input
                type="text"
                required
                value={form.deviceModel}
                onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
                placeholder="e.g. iPhone 14, S23 Ultra"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Problem & Estimate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Problem Description</label>
              <input
                type="text"
                required
                value={form.problemDescription}
                onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                placeholder="e.g. Cracked OLED screen, battery drain"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Estimated Cost (₹)</label>
              <input
                type="number"
                placeholder="e.g. 2500"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* PRE-REPAIR INTAKE CHECKLIST (Realistic Dispute Prevention) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Pre-Repair Intake Inspection</span>
              </span>
              <span className="text-[10px] text-slate-500">Recorded on receipt</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'powersOn', label: 'Powers On' },
                { key: 'touchWorking', label: 'Touch Working' },
                { key: 'cameraWorking', label: 'Camera OK' },
                { key: 'biometricsWorking', label: 'FaceID/Fingerprint' },
              ].map(({ key, label }) => {
                const checked = intakeChecklist[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCheck(key)}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition ${
                      checked
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{label}</span>
                    {checked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Body Condition Selector */}
            <div className="pt-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Body Physical Condition</label>
              <div className="grid grid-cols-4 gap-1.5 text-[10px]">
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
                    className={`py-1.5 px-2 rounded-lg font-bold border text-center transition truncate ${
                      intakeChecklist.bodyCondition === item.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center space-x-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Dispatch Referral'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
