import { supabase } from '../config/supabase.js';

export const catalogController = {
  // 1. Get Products
  async getProducts(req, res) {
    try {
      const { category, search } = req.query;

      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    } catch (err) {
      console.error('getProducts error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Add Product
  async addProduct(req, res) {
    try {
      const { name, brand, category, price, stock, shopId } = req.body;

      if (!name || price == null) {
        return res.status(400).json({ success: false, error: 'Product name and price are required' });
      }

      const newProduct = {
        name: name.trim(),
        brand: brand ? brand.trim() : '',
        category: category || 'Accessories',
        price: Number(price),
        stock: Number(stock || 0),
        seller_id: req.user.id,
        shop_id: shopId || req.user.shopId || null,
      };

      const { data, error } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    } catch (err) {
      console.error('addProduct error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Delete Product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
      console.error('deleteProduct error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Get Promotional Offers
  async getOffers(req, res) {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    } catch (err) {
      console.error('getOffers error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Add Promotional Offer
  async addOffer(req, res) {
    try {
      const { title, description, discountPercent, validUntil, shopId } = req.body;

      if (!title || discountPercent == null) {
        return res.status(400).json({ success: false, error: 'Offer title and discount percent are required' });
      }

      const newOffer = {
        title: title.trim(),
        description: description ? description.trim() : '',
        discount_percent: Number(discountPercent),
        shop_id: shopId || req.user.shopId || null,
        valid_until: validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
      };

      const { data, error } = await supabase
        .from('offers')
        .insert(newOffer)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    } catch (err) {
      console.error('addOffer error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 6. Delete Offer
  async deleteOffer(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (err) {
      console.error('deleteOffer error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

