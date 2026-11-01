import { Router } from 'express';
import { repairController } from '../controllers/repairController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Track Repair by Ticket ID (zero login)
router.get('/track/:ticketId', repairController.trackTicket);

// Authenticated: List Repair Jobs (Admin / Seller / Super Admin)
router.get('/', authenticate, repairController.getRepairJobs);

// Authenticated: Create Repair Referral (Seller or Admin)
router.post('/', authenticate, requireRole(['SELLER', 'ADMIN', 'SUPER_ADMIN']), repairController.createReferral);

// Authenticated: Update Status (Admin)
router.patch('/:id/status', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), repairController.updateStatus);

// Authenticated: Complete Repair & Calculate 2% Commission (Admin)
router.post('/:id/complete', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), repairController.completeRepair);

export default router;

