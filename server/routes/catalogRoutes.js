import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Products (Public read, Authenticated write)
router.get('/products', optionalAuth, catalogController.getProducts);
router.post('/products', authenticate, requireRole(['ADMIN', 'SELLER', 'SUPER_ADMIN']), catalogController.addProduct);
router.delete('/products/:id', authenticate, requireRole(['ADMIN', 'SELLER', 'SUPER_ADMIN']), catalogController.deleteProduct);

// Offers (Public read, Authenticated write)
router.get('/offers', optionalAuth, catalogController.getOffers);
router.post('/offers', authenticate, requireRole(['ADMIN', 'SELLER', 'SUPER_ADMIN']), catalogController.addOffer);
router.delete('/offers/:id', authenticate, requireRole(['ADMIN', 'SELLER', 'SUPER_ADMIN']), catalogController.deleteOffer);

export default router;

