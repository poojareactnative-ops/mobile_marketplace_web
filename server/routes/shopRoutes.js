import { Router } from 'express';
import { shopController } from '../controllers/shopController.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public / Semi-public: Get Registered Shops (for geofence radar)
router.get('/', optionalAuth, shopController.getShops);

// Authenticated: Admin Creates Repair Shop
router.post('/', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), shopController.createShop);

// Authenticated: Admin Onboards 2% Partner Seller
router.post('/onboard-seller', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), shopController.onboardSeller);

// Authenticated: Admin Lists Affiliated Sellers
router.get('/sellers', authenticate, requireRole(['ADMIN', 'SUPER_ADMIN']), shopController.getAffiliatedSellers);

export default router;

