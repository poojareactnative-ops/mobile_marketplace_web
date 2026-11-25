'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, ShieldCheck, UserCheck, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export default function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadAlerts = async () => {
    const list = await notificationService.fetchNotificationsFromDb();
    setAlerts(list || []);
  };

  useEffect(() => {
    loadAlerts();

    const handleNew = () => {
      setAlerts(notificationService.getNotificationAlerts());
    };
    const handleRead = () => {
      setAlerts(notificationService.getNotificationAlerts());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('smartfix_new_notification', handleNew);
      window.addEventListener('smartfix_notifications_read', handleRead);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('smartfix_new_notification', handleNew);
        window.removeEventListener('smartfix_notifications_read', handleRead);
      }
    };
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      notificationService.markAlertsAsRead();
    }
    setIsOpen(!isOpen);
  };

  const handleClear = async () => {
    await notificationService.clearAllNotifications();
    setAlerts([]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
        title="Platform Notification Alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop on click outside */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-black text-white">Platform Notification Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                {alerts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  {alerts.length} Total
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80 text-xs">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-1">
                  <Check className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold text-slate-400">All caught up!</p>
                  <p className="text-[11px]">Partner verification alerts and system notices will display here.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 space-y-1 transition ${
                      !alert.read ? 'bg-purple-950/20' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        {alert.type === 'PARTNER_VERIFIED' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : alert.type === 'NEW_USER_REGISTRATION' || alert.type === 'NEW_ADMIN_REGISTRATION' ? (
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Bell className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <span>{alert.title || 'Platform Notice'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(alert.timestamp || alert.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.code && (
                      <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-purple-500/30 text-[10px] text-purple-300 font-mono font-bold">
                        <span>OTP: {alert.code}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
