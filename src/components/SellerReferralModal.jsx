'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, ShieldCheck, CheckSquare, Square, Smartphone, CheckCircle2 } from 'lucide-react';
import { getWhatsAppRepairTrackingUrl } from '../utils/productImages';

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
    bodyCondition: 'MINOR_SCRATCHES',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdJob, setCreatedJob] = useState(null);

  if (!isOpen) return null;

  const toggleCheck = (field) => {
    setIntakeChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const seller = sellerUser || currentSeller;

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

      if (res && res.ticket_id) {
        setCreatedJob(res);
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
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-6">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{createdJob ? 'Ticket Tracking Created' : 'Refer Customer to Partner Repair Workshop'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {createdJob ? 'Send the live tracking ID to the customer on WhatsApp' : 'Generates a verified intake ticket. You earn an automatic 2% referral commission.'}
            </p>
          </div>
          <button onClick={handleModalClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SUCCESS STATE: TICKET CREATED & SEND TO WHATSAPP */}
        {createdJob ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Repair Referral Created Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">Customer Tracking Ticket ID:</p>
              <div className="mt-2 inline-block px-6 py-2.5 rounded-2xl bg-slate-950 border border-amber-500/40 font-mono text-amber-400 font-black text-2xl tracking-wider shadow-inner">
                {createdJob.ticket_id}
              </div>
              <div className="text-xs text-slate-300 mt-3 font-semibold">
                Customer: <span className="text-white">{createdJob.customer_name}</span> &bull; {createdJob.customer_phone}
              </div>
              <div className="text-[11px] text-slate-400">
                Device: {createdJob.device_brand} {createdJob.device_model}
              </div>
            </div>

            {/* Direct WhatsApp Share Button */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300">
                Send the tracking link with Ticket ID <strong>{createdJob.ticket_id}</strong> to the customer&apos;s WhatsApp:
              </p>
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
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-2.222-.572-1.828-.757-3.003-2.617-3.094-2.738-.09-.122-.74-1.024-.74-1.953 0-.929.479-1.386.65-1.577.171-.191.373-.239.498-.239.125 0 .25.002.359.007.114.005.267-.043.418.32.155.373.53 1.293.576 1.388.046.096.077.208.016.331-.061.123-.092.2-.183.308-.092.107-.193.24-.275.322-.093.093-.19.194-.082.38.109.186.483.797 1.036 1.29 0.713.636 1.314.833 1.5.926.186.093.295.077.404-.047.109-.123.468-.544.592-.73.125-.187.25-.156.421-.093.171.062 1.089.513 1.276.607.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                </svg>
                <span>Send Tracking ID ({createdJob.ticket_id}) on WhatsApp</span>
              </a>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              Done &amp; Close
            </button>
          </div>
        ) : (
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
                  placeholder="e.g. Samsung / Apple"
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
                  placeholder="e.g. Galaxy S22 / iPhone 13"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Problem Description</label>
              <textarea
                required
                rows={2}
                value={form.problemDescription}
                onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                placeholder="e.g. Display glass cracked, touch responsive, back panel fine"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Estimated Repair Cost */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Estimated Repair Cost (₹)</label>
              <input
                type="number"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                placeholder="e.g. 2500"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Pre-Repair Intake Checklist */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-extrabold text-[11px] uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Pre-Repair Intake Inspection Checklist</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => toggleCheck('powersOn')}
                  className="flex items-center space-x-2 text-left p-1.5 rounded-lg hover:bg-slate-900 transition"
                >
                  {intakeChecklist.powersOn ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={intakeChecklist.powersOn ? 'text-white font-bold' : 'text-slate-400'}>
                    Device Powers On
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleCheck('touchWorking')}
                  className="flex items-center space-x-2 text-left p-1.5 rounded-lg hover:bg-slate-900 transition"
                >
                  {intakeChecklist.touchWorking ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={intakeChecklist.touchWorking ? 'text-white font-bold' : 'text-slate-400'}>
                    Touch Working
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleCheck('cameraWorking')}
                  className="flex items-center space-x-2 text-left p-1.5 rounded-lg hover:bg-slate-900 transition"
                >
                  {intakeChecklist.cameraWorking ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={intakeChecklist.cameraWorking ? 'text-white font-bold' : 'text-slate-400'}>
                    Cameras Intact
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleCheck('biometricsWorking')}
                  className="flex items-center space-x-2 text-left p-1.5 rounded-lg hover:bg-slate-900 transition"
                >
                  {intakeChecklist.biometricsWorking ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={intakeChecklist.biometricsWorking ? 'text-white font-bold' : 'text-slate-400'}>
                    FaceID / Fingerprint
                  </span>
                </button>
              </div>

              {/* Physical Condition Selector */}
              <div className="pt-2 border-t border-slate-800">
                <span className="block text-slate-400 text-[10px] font-bold mb-1.5 uppercase">
                  Body Cosmetic Condition:
                </span>
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
                onClick={handleModalClose}
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
        )}

      </div>
    </div>
  );
}
