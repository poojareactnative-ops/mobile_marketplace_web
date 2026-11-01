import { supabase } from '../config/supabase.js';

export const commissionController = {
  // 1. Get Commission Ledger & Summaries
  async getCommissions(req, res) {
    try {
      const { adminId, sellerId, status } = req.query;

      let query = supabase
        .from('repair_commissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminId) query = query.eq('admin_id', adminId);
      if (sellerId) query = query.eq('seller_id', sellerId);
      if (status) query = query.eq('status', status);

      // Force filter for seller
      if (req.user?.role === 'SELLER') {
        query = query.eq('seller_id', req.user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const list = data || [];
      const totalCommission = list.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
      const paidCommission = list.filter(c => c.status === 'PAID').reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
      const pendingCommission = list.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

      return res.json({
        success: true,
        data: list,
        summary: {
          totalCommission,
          paidCommission,
          pendingCommission,
          totalCount: list.length,
        },
      });
    } catch (err) {
      console.error('getCommissions error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Admin Settles 2% Commission with Payment Reference
  async payCommission(req, res) {
    try {
      const { id } = req.params;
      const { paymentReference, notes } = req.body;

      if (!paymentReference) {
        return res.status(400).json({ success: false, error: 'Payment transaction reference (UPI/Bank) is required' });
      }

      const paidAt = new Date().toISOString();

      // 1. Update commission record
      const { data: updatedComm, error: commErr } = await supabase
        .from('repair_commissions')
        .update({
          status: 'PAID',
          payment_reference: paymentReference.trim(),
          paid_at: paidAt,
          notes: notes || null,
          updated_at: paidAt,
        })
        .eq('id', id)
        .select()
        .single();

      if (commErr) throw commErr;

      // 2. Update associated repair_job if present
      if (updatedComm.repair_job_id) {
        await supabase
          .from('repair_jobs')
          .update({
            commission_status: 'PAID',
            paid_at: paidAt,
          })
          .eq('id', updatedComm.repair_job_id);
      }

      return res.json({ success: true, data: updatedComm });
    } catch (err) {
      console.error('payCommission error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

