import { supabase } from '../config/supabase.js';

export const repairController = {
  // 1. Get list of repair jobs with optional filters
  async getRepairJobs(req, res) {
    try {
      const { adminId, sellerId, status } = req.query;

      let query = supabase
        .from('repair_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminId) query = query.eq('admin_id', adminId);
      if (sellerId) query = query.eq('seller_id', sellerId);
      if (status) query = query.eq('status', status);

      // If user is SELLER, force filter to their own referrals unless SUPER_ADMIN
      if (req.user?.role === 'SELLER') {
        query = query.eq('seller_id', req.user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.json({ success: true, data: data || [] });
    } catch (err) {
      console.error('getRepairJobs error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 2. Create Repair Referral (by Seller or Admin)
  async createReferral(req, res) {
    try {
      const {
        customerName,
        customerPhone,
        deviceBrand,
        deviceModel,
        problemDescription,
        estimatedCost,
        adminId,
        shopId,
      } = req.body;

      if (!customerName || !customerPhone || !deviceBrand || !deviceModel || !problemDescription) {
        return res.status(400).json({
          success: false,
          error: 'Missing required customer or device repair information',
        });
      }

      // Generate unique Ticket ID: REP-XXXX
      const ticketId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;

      const newJob = {
        ticket_id: ticketId,
        admin_id: adminId || req.user?.adminId || null,
        shop_id: shopId || req.user?.shopId || null,
        seller_id: req.user?.role === 'SELLER' ? req.user.id : null,
        seller_name: req.user?.role === 'SELLER' ? req.user.name : null,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        device_brand: deviceBrand.trim(),
        device_model: deviceModel.trim(),
        problem_description: problemDescription.trim(),
        status: 'PENDING_APPROVAL',
        estimated_cost: Number(estimatedCost || 0),
        final_amount: 0,
        seller_commission_percent: 2.0,
        seller_commission_amount: 0,
        admin_remaining_amount: 0,
        commission_status: req.user?.role === 'SELLER' ? 'PENDING' : 'NOT_APPLICABLE',
      };

      const { data, error } = await supabase
        .from('repair_jobs')
        .insert(newJob)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, data });
    } catch (err) {
      console.error('createReferral error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 3. Update Repair Status (ACCEPTED, IN_PROGRESS, CANCELLED)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['PENDING_APPROVAL', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid repair status' });
      }

      const { data, error } = await supabase
        .from('repair_jobs')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({ success: true, data });
    } catch (err) {
      console.error('updateStatus error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 4. Complete Repair Job & Calculate Automated 2% Split
  async completeRepair(req, res) {
    try {
      const { id } = req.params;
      const { finalAmount, notes } = req.body;

      const billAmount = Number(finalAmount);
      if (isNaN(billAmount) || billAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid positive final amount is required' });
      }

      // 1. Fetch current job
      const { data: job, error: fetchErr } = await supabase
        .from('repair_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !job) {
        return res.status(404).json({ success: false, error: 'Repair job not found' });
      }

      // 2. Calculate 2% commission
      const sellerCommission = job.seller_id ? Math.round(billAmount * 0.02) : 0;
      const adminRemaining = billAmount - sellerCommission;
      const commissionStatus = job.seller_id ? 'PENDING' : 'NOT_APPLICABLE';

      // 3. Update repair job
      const { data: updatedJob, error: updateErr } = await supabase
        .from('repair_jobs')
        .update({
          status: 'COMPLETED',
          final_amount: billAmount,
          seller_commission_amount: sellerCommission,
          admin_remaining_amount: adminRemaining,
          commission_status: commissionStatus,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // 4. If referred by an accessory seller, record in repair_commissions ledger
      if (job.seller_id && sellerCommission > 0) {
        await supabase
          .from('repair_commissions')
          .insert({
            repair_job_id: job.id,
            ticket_id: job.ticket_id,
            shop_id: job.shop_id,
            admin_id: job.admin_id,
            seller_id: job.seller_id,
            seller_name: job.seller_name,
            final_repair_amount: billAmount,
            commission_percent: 2.0,
            commission_amount: sellerCommission,
            status: 'PENDING',
          });
      }

      return res.json({
        success: true,
        data: updatedJob,
        commission: {
          billAmount,
          sellerCommission,
          adminRemaining,
          status: commissionStatus,
        },
      });
    } catch (err) {
      console.error('completeRepair error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // 5. Public Ticket Tracking (ZERO login needed)
  async trackTicket(req, res) {
    try {
      const { ticketId } = req.params;
      if (!ticketId) {
        return res.status(400).json({ success: false, error: 'Ticket ID is required' });
      }

      const cleanId = ticketId.trim().toUpperCase();
      const { data, error } = await supabase
        .from('repair_jobs')
        .select('*')
        .eq('ticket_id', cleanId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: `No repair job found for ticket "${ticketId}"`,
        });
      }

      return res.json({ success: true, data });
    } catch (err) {
      console.error('trackTicket error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

