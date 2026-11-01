import { Router } from 'express';
import { inquiryController } from '../controllers/inquiryController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Zero-login Customer Inquiries
router.post('/', inquiryController.submitInquiry);

// Authenticated: Shop Owners View Inquiries
router.get('/', authenticate, inquiryController.getInquiries);

// Authenticated: Shop Owner Updates Status
router.patch('/:id/status', authenticate, requireRole(['ADMIN', 'SELLER', 'SUPER_ADMIN']), inquiryController.updateStatus);

export default router;

