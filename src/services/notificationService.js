/**
 * SmartFix Live Notification Service
 * 100% Database-Driven — Syncs directly with Supabase `notifications` table
 */

import { supabaseRest } from '../lib/supabase';

class NotificationService {
  constructor() {
    this.memoryCache = [];
  }

  // Play a gentle audible notification chime using Web Audio API
  playNotificationSound() {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Two-tone pleasant chime
      playTone(587.33, 0, 0.15); // D5
      playTone(880.00, 0.12, 0.25); // A5
    } catch (e) {
      // Audio autoplay policy may suppress without user interaction
    }
  }

  // 1. Add notification directly to Supabase database
  async addNotificationAlert(alert) {
    const newAlert = {
      type: alert.type || 'SYSTEM_ALERT',
      title: alert.title || 'Platform Notification',
      message: alert.message || '',
      recipient_role: alert.recipientRole || null,
      is_read: false,
    };

    // Keep immediate in-memory cache for ultra-fast UI response
    const cachedAlert = {
      id: `alert-${Date.now()}`,
      created_at: new Date().toISOString(),
      read: false,
      ...newAlert,
    };
    this.memoryCache = [cachedAlert, ...this.memoryCache].slice(0, 50);

    // Audio chime
    this.playNotificationSound();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartfix_new_notification', { detail: cachedAlert }));
    }

    try {
      const res = await supabaseRest('notifications', {
        method: 'POST',
        body: newAlert,
      });
      return Array.isArray(res) && res[0] ? res[0] : cachedAlert;
    } catch (e) {
      console.warn('Database notification insert notice:', e.message);
      return cachedAlert;
    }
  }

  // 2. Fetch all notifications from Supabase
  async fetchNotificationsFromDb(recipientRole = null) {
    try {
      let endpoint = 'notifications?select=*&order=created_at.desc&limit=40';
      if (recipientRole) {
        endpoint += `&recipient_role=eq.${recipientRole}`;
      }
      const data = await supabaseRest(endpoint);
      if (Array.isArray(data)) {
        this.memoryCache = data.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          read: n.is_read,
          created_at: n.created_at,
          recipient_role: n.recipient_role,
        }));
        return this.memoryCache;
      }
    } catch (e) {
      console.warn('Notifications fetch notice:', e.message);
    }
    return this.memoryCache;
  }

  // 3. Synchronous getter for UI components
  getNotificationAlerts() {
    return this.memoryCache;
  }

  // 4. Mark notifications as read in Supabase
  async markAlertsAsRead() {
    this.memoryCache = this.memoryCache.map((a) => ({ ...a, read: true }));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartfix_notifications_read'));
    }

    try {
      await supabaseRest('notifications?is_read=eq.false', {
        method: 'PATCH',
        body: { is_read: true },
      });
    } catch (e) {
      // ignore
    }
  }

  // 5. Clear all notifications
  async clearAllNotifications() {
    this.memoryCache = [];
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartfix_notifications_read'));
    }

    try {
      await supabaseRest('notifications', {
        method: 'DELETE',
      });
    } catch (e) {
      // ignore
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
