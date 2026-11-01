import { supabase } from '../config/supabase.js';

export const shopController = {
  // 1. Get all registered shops (Public or authenticated)
  async getShops(req, res) {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    } catch (err) {
      console.error('getShops error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Register a new repair shop (Admin)
  async createShop(req, res) {
    try {
      const { name, address, phone, latitude, longitude } = req.body;

      if (!name || !address || !phone) {
        return res.status(400).json({ success: false, error: 'Shop name, address, and contact phone are required' });
      }

      const newShop = {
        owner_id: req.user.id,
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        latitude: latitude != null ? Number(latitude) : null,
        longitude: longitude != null ? Number(longitude) : null,
        is_verified: true,
      };

      const { data, error } = await supabase
        .from('shops')
        .insert(newShop)
        .select()
        .single();

      if (error) throw error;

      // Update owner's profile with shop_id
      await supabase
        .from('profiles')
        .update({ shop_id: data.id })
        .eq('id', req.user.id);

      return res.status(201).json({ success: true, data });
    } catch (err) {
      console.error('createShop error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Admin onboards an affiliate accessory seller (2% partner)
  async onboardSeller(req, res) {
    try {
      const { email, name, phone, shopName } = req.body;
      const cleanEmail = String(email || '').trim().toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({ success: false, error: 'Seller login email is required' });
      }

      // Check if email already registered
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: `A user with email "${cleanEmail}" is already registered.`,
        });
      }

      const newSeller = {
        email: cleanEmail,
        name: (name || cleanEmail.split('@')[0]).trim(),
        phone: phone ? phone.trim() : '',
        role: 'SELLER',
        admin_id: req.user.id,
        shop_id: req.user.shopId || null,
        status: 'ACTIVE',
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(newSeller)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        data: {
          ...data,
          shopName: shopName || `${data.name} Accessories`,
        },
      });
    } catch (err) {
      console.error('onboardSeller error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Fetch affiliated sellers for current Admin
  async getAffiliatedSellers(req, res) {
    try {
      const adminId = req.user.role === 'SUPER_ADMIN' && req.query.adminId 
        ? req.query.adminId 
        : req.user.id;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'SELLER')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    } catch (err) {
      console.error('getAffiliatedSellers error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

