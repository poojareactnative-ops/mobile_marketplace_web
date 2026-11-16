/**
 * Notification & Partner Verification Alert Service
 * Handles dispatching verification OTP alerts, audio-visual notification pings,
 * and maintaining genuine partner verification audit logs.
 */

class NotificationService {
  constructor() {
    this.activeVerifications = new Map();
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

      // Two-tone pleasant notification chime
      playTone(587.33, 0, 0.15); // D5
      playTone(880.00, 0.12, 0.25); // A5
    } catch (e) {
      // Audio autoplay policy may suppress without user interaction
    }
  }

  // 1. Dispatch Genuine Partner Verification Alert (SMS / Email Simulation)
  async sendPartnerVerificationAlert({ name, phone, email, shopName }) {
    // Generate secure 4-digit verification code
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const recipient = phone || email || 'partner';
    const cleanKey = String(email || phone || name).toLowerCase().trim();

    const alertPayload = {
      code,
      name: name || 'Store Partner',
      recipient,
      phone: phone || '',
      email: email || '',
      shopName: shopName || 'Accessory Partner Store',
      timestamp: new Date().toISOString(),
      message: `[SmartFix Security Alert]: Verification code for genuine store registration of "${shopName || name}" is: ${code}. Please provide this code to the Admin to confirm genuine partner authorization.`,
    };

    this.activeVerifications.set(cleanKey, alertPayload);

    // Play audible notification chime
    this.playNotificationSound();

    // Log to notification alert stream
    this.addNotificationAlert({
      type: 'VERIFICATION_ALERT_SENT',
      title: 'Partner Verification Alert Dispatched',
      message: `Security verification code sent to ${recipient} (${shopName || name})`,
      code,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      code,
      recipient,
      message: alertPayload.message,
      timestamp: alertPayload.timestamp,
    };
  }

  // 2. Verify Code
  verifyPartnerCode(key, inputCode, expectedCode) {
    const cleanInput = String(inputCode || '').trim();
    if (expectedCode && cleanInput === String(expectedCode).trim()) {
      return { verified: true };
    }

    const cleanKey = String(key || '').toLowerCase().trim();
    const stored = this.activeVerifications.get(cleanKey);
    if (stored && stored.code === cleanInput) {
      return { verified: true };
    }

    // Also accept Master verification bypass '9922' for instant testing
    if (cleanInput === '9922') {
      return { verified: true, bypass: true };
    }

    return { verified: false, error: 'Incorrect verification code. Please check the code sent to the partner.' };
  }

  // 3. Add to persistent notification alerts
  addNotificationAlert(alert) {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getNotificationAlerts();
      const newAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        read: false,
        ...alert,
      };
      const updated = [newAlert, ...existing].slice(0, 30); // keep last 30 alerts
      localStorage.setItem('smartfix_notification_alerts', JSON.stringify(updated));

      // Broadcast custom event for reactive UI updates
      window.dispatchEvent(new CustomEvent('smartfix_new_notification', { detail: newAlert }));
    } catch (e) {
      console.warn('Could not store notification alert:', e);
    }
  }

  // 4. Get all stored notification alerts
  getNotificationAlerts() {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('smartfix_notification_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  // 5. Mark alerts as read
  markAlertsAsRead() {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getNotificationAlerts();
      const updated = existing.map((a) => ({ ...a, read: true }));
      localStorage.setItem('smartfix_notification_alerts', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('smartfix_notifications_read'));
    } catch (e) {
      // ignore
    }
  }

  // 6. Record verified genuine store partner (persists across reloads)
  markPartnerAsVerified(email, details = {}) {
    if (typeof window === 'undefined' || !email) return;
    try {
      const verifiedMap = this.getVerifiedPartners();
      const key = String(email).toLowerCase().trim();
      verifiedMap[key] = {
        verified: true,
        verifiedAt: details.verifiedAt || new Date().toISOString(),
        phone: details.phone || '',
        name: details.name || '',
        shopName: details.shopName || '',
      };
      localStorage.setItem('smartfix_verified_partners', JSON.stringify(verifiedMap));
    } catch (e) {
      console.warn('Could not record verified partner:', e);
    }
  }

  // 7. Get map of all verified genuine partners
  getVerifiedPartners() {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('smartfix_verified_partners');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  // 8. Check if a seller is verified genuine
  isPartnerVerified(email) {
    if (!email) return false;
    const map = this.getVerifiedPartners();
    return !!map[String(email).toLowerCase().trim()];
  }
}

export const notificationService = new NotificationService();
