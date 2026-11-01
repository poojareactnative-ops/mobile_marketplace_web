import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * Auth Section: Managed by Supabase
 * These endpoints provide server-side validation and profile resolution
 */

// 1. Get current authenticated user profile
router.get('/me', authenticate, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

// 2. Validate session token against Supabase Auth
router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, valid: false, error: error?.message });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return res.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'CUSTOMER',
        name: profile?.name || user.email.split('@')[0],
        shopId: profile?.shop_id || null,
        adminId: profile?.admin_id || null,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

