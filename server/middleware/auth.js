import { supabase } from '../config/supabase.js';

/**
 * Authentication Middleware: Managed directly via Supabase Auth
 * Validates the JWT Bearer token against Supabase Auth service
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid Authorization Bearer header',
      });
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify token with Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired Supabase authentication session',
      });
    }

    // 2. Fetch profile data (role, shop_id, admin_id)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Profile fetch warning:', profileError.message);
    }

    // 3. Attach user payload to request
    req.user = {
      id: authUser.id,
      email: authUser.email,
      role: profile?.role || authUser.user_metadata?.role || 'CUSTOMER',
      name: profile?.name || authUser.user_metadata?.name || authUser.email.split('@')[0],
      phone: profile?.phone || authUser.user_metadata?.phone || '',
      shopId: profile?.shop_id || null,
      adminId: profile?.admin_id || null,
    };

    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server authentication error',
    });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {string[]} allowedRoles - Array of allowed roles (e.g. ['ADMIN', 'SUPER_ADMIN'])
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role(s). Current role: ${req.user.role}`,
      });
    }

    next();
  };
}

/**
 * Optional Authentication Middleware
 * Populates req.user if a valid token exists, but doesn't block unauthenticated guests
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const { data: { user: authUser } } = await supabase.auth.getUser(token);
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      req.user = {
        id: authUser.id,
        email: authUser.email,
        role: profile?.role || 'CUSTOMER',
        name: profile?.name || authUser.email.split('@')[0],
        shopId: profile?.shop_id || null,
        adminId: profile?.admin_id || null,
      };
    }
  } catch (err) {
    req.user = null;
  }

  next();
}

