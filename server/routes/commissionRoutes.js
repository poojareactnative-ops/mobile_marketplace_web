import { Router } from 'express';
import { commissionController } from '../controllers/commissionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Authenticated: Get Commission Ledger (Seller, Admin, Super Admin)
router.get('/', authenticate, commissionController.getCommissions);

// Authenticated: Admin Settles 2% Commission with UPI/Bank Reference
router.post('/:id/pay', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), commissionController.payCommission);

export default router;

